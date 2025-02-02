import { readable, writable, derived, get } from 'svelte/store';

// import.meta.env.BASE_URL is a Vite feature.
// import.meta.env.BASE_URL: {string} the base url the app is being served from. 
// This is determined by the base config option. (https://vitejs.dev/guide/env-and-mode.html#env-variables)
// vite.config.js 
//     import { defineConfig } from 'vite'
//     export default defineConfig({
//         base: '/',
//     })
export const base_url = readable(import.meta.env.BASE_URL);

export const currentSemester = writable(''); // Currently selected semester
export const semesterData = writable({}); // Stores the course data for each downloaded semester
export const searchQuery = writable('');
export const hoveredCourse = createHoveredCourse();
export const isMobile = readable(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
export const selectedCourseNamesAll = createSelectedCourseNamesAll(); // selected course names for all semesters
//export const selectedCourseNames = createSelectedCourseNames();

function createHoveredCourse() {
    const { subscribe, set, update } = writable("");

    return {
        subscribe,
        set: (course) => {
            // Do not highlight the hovered course on mobile because touch is registed as mouseenter
            // and the course remains still highlighted when user no longer touches
            if (!get(isMobile)) {
                set(course)
            }
        },
        reset: () => set("")
    }
}

function readSelectedCourseNames() {
    try {
        const storedData = localStorage.getItem("semesterSelCourses2");
        if (!storedData) return {};
        
        const parsedData = JSON.parse(storedData);
        if (typeof parsedData !== 'object' || parsedData === null) {
            throw new Error('Invalid stored course data format');
        }

        // Validate and clean data structure
        const cleanedData = {};
        for (const [semester, courses] of Object.entries(parsedData)) {
            if (Array.isArray(courses)) {
                cleanedData[semester] = courses.filter(course => typeof course === 'string');
            }
        }
        
        return cleanedData;
    } catch (e) {
        console.error('Error reading stored courses:', e);
        // Reset storage if corrupted
        localStorage.setItem("semesterSelCourses2", "{}");
        return {};
    }
}

function createSelectedCourseNamesAll() {
    const { subscribe, set, update } = writable(readSelectedCourseNames());

    // Auto-save to localStorage on changes
    subscribe(value => {
        try {
            localStorage.setItem("semesterSelCourses2", JSON.stringify(value));
        } catch (e) {
            console.error('Error saving courses to storage:', e);
        }
    });

    return {
        subscribe,
        addCourse: (newCour) => {
            if (typeof newCour !== 'string' || !newCour.trim()) {
                console.error('Invalid course name:', newCour);
                return;
            }

            update(cour => {
                const semester = get(currentSemester);
                if (!semester) {
                    console.error('No semester selected');
                    return cour;
                }

                const newState = { ...cour };
                if (!(semester in newState)) {
                    newState[semester] = [];
                }

                // Prevent duplicates
                if (!newState[semester].includes(newCour)) {
                    newState[semester] = [...newState[semester], newCour].sort();
                }

                return newState;
            });
        },
        delCourse: (delCour) => {
            if (typeof delCour !== 'string') {
                console.error('Invalid course name:', delCour);
                return;
            }

            update(cour => {
                const semester = get(currentSemester);
                if (!semester || !(semester in cour)) {
                    return cour;
                }

                const newState = { ...cour };
                newState[semester] = newState[semester]
                    .filter(course => course !== delCour)
                    .sort();

                return newState;
            });
        },
        setCourseList: (courseList) => {
            if (!Array.isArray(courseList)) {
                console.error('Invalid course list:', courseList);
                return;
            }

            update(cour => {
                const semester = get(currentSemester);
                if (!semester) {
                    console.error('No semester selected');
                    return cour;
                }

                // Filter out invalid courses
                const validCourses = courseList
                    .filter(course => typeof course === 'string' && course.trim())
                    .sort();

                return {
                    ...cour,
                    [semester]: validCourses
                };
            });
        },
        cleanupSemester: (semester) => {
            if (typeof semester !== 'string') return;
            
            update(cour => {
                const { [semester]: removed, ...rest } = cour;
                return rest;
            });
        },
        reset: () => set({})
    };
};

function createSelectedCourseNames() {
    const { subscribe, set, update } = writable([]);

    return {
        subscribe,
        addCourse: (newCour) => {
            update(cour => {
                cour.push(newCour);
                cour.sort();
                cour = cour;
                return cour
            })
        },
        delCourse: (delCour) => {
            update(cour => {
                const indexArr = cour.indexOf(delCour);
                cour.splice(indexArr, 1);
                cour.sort();
                cour = cour;
                return cour
            })
        },
        setCourseList: (courseList) => {
            set(courseList)
        },
        reset: () => set([])
    };
};

export const searchedCourseNames = derived([currentSemester, semesterData, searchQuery],
    ([$currentSemester, $semesterData, $searchQuery]) => {
        if (
            $currentSemester == "" ||
            !Object.prototype.hasOwnProperty.call(
                $semesterData,
                $currentSemester
            )
        ) {
            return [];
        }

        let data = $semesterData[$currentSemester];
        if (Object.keys(data).length === 0) {
            return [];
        }

        let regexString = $searchQuery
            .trim()
            .split(" ")
            .filter(str => str.length >= 2)
            .join("|");
        let courses = [];
        if (regexString != "") {
            const regex = new RegExp(regexString, "i"); // i: case insensitive
            courses = Object.keys(data).filter(key => regex.test(key));
        }
        if (courses.length == 0) {
            if (regexString != "") {
                const regex = new RegExp(regexString, "i"); // i: case insensitive
                courses = Object.keys(data).filter(key => regex.test(data[key]["name"]) || regex.test(data[key]["instructor"]));
            }
        }
        return courses;
    },
);

// Only the course data for currently selected semester
export const curSemesterData = derived([currentSemester, semesterData],
    ([$currentSemester, $semesterData]) => {
        try {
            // Validate semester selection
            if (!$currentSemester) {
                return null;
            }

            // Validate semester data exists
            if (!$semesterData || typeof $semesterData !== 'object') {
                console.error('Invalid semester data structure');
                return null;
            }

            // Get data for current semester
            const semData = $semesterData[$currentSemester];
            if (!semData) {
                return null;
            }

            // Validate semester data structure
            if (typeof semData !== 'object') {
                console.error(`Invalid data structure for semester: ${$currentSemester}`);
                return null;
            }

            // Validate course data format
            for (const [courseName, courseData] of Object.entries(semData)) {
                if (!courseData || typeof courseData !== 'object') {
                    console.error(`Invalid course data for ${courseName}`);
                    continue;
                }

                if (!Array.isArray(courseData.days) || !Array.isArray(courseData.hours)) {
                    console.error(`Missing required arrays for course ${courseName}`);
                    continue;
                }
            }

            return semData;
        } catch (e) {
            console.error('Error processing semester data:', e);
            return null;
        }
    }
);

export const selectedCourseNames = derived([currentSemester, selectedCourseNamesAll],
    ([$currentSemester, $selectedCourseNamesAll]) => {
        return $selectedCourseNamesAll[$currentSemester] || [];
    }
);

export const curSemCategories = derived([curSemesterData],
    ([$curSemesterData]) => {
        if (!$curSemesterData) {
            return [];
        }
        const cat = new Set();
        for (const [courseName, courseInfo] of Object.entries($curSemesterData)) {
            // Get course category by matching the longest letter sequence
            const re = /[$A-Za-z]+/g;
            const matchArray = courseName.match(re);
            if (matchArray.length > 0) {
                cat.add(matchArray[0]);
            }
        }
        return Array.from(cat);
    }
);