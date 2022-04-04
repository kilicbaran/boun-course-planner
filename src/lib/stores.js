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
    let selectedCoursesForSemesters = localStorage.getItem("semesterSelCourses2") || "{}";
    return JSON.parse(selectedCoursesForSemesters);
}

function createSelectedCourseNamesAll() {
    const { subscribe, set, update } = writable(readSelectedCourseNames());

    //console.log(readSelectedCourseNames());

    return {
        subscribe,
        addCourse: (newCour) => {
            update(cour => {
                if (!(get(currentSemester) in cour)) {
                    cour[get(currentSemester)] = [];
                }
                cour[get(currentSemester)].push(newCour);
                cour[get(currentSemester)].sort();
                cour = cour;
                return cour
            })
        },
        delCourse: (delCour) => {
            update(cour => {
                if (!(get(currentSemester) in cour)) {
                    cour[get(currentSemester)] = [];
                }
                const indexArr = cour[get(currentSemester)].indexOf(delCour);
                cour[get(currentSemester)].splice(indexArr, 1);
                cour[get(currentSemester)].sort();
                cour = cour;
                return cour
            })
        },
        setCourseList: (courseList) => {
            update(cour => {
                cour[get(currentSemester)] = courseList;
                return cour
            })
        },
        reset: () => set([])
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
        return $semesterData[$currentSemester] || null;
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