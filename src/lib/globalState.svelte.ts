let currentSemester = $state(""); // Currently selected semester

export function getCurrentSemester() {
  return currentSemester;
}

export function setCurrentSemester(value: string) {
  currentSemester = value;
}

let semesterData: Record<string, any> = $state({}); // Stores the course data for each downloaded semester

export function getSemesterData() {
  return semesterData;
}

export function setSemesterDataForSemester(semester: string, data: object) {
  semesterData[semester] = data;
}

let searchQuery = $state(""); // Search query for filtering courses by name or instructor

export function getSearchQuery() {
  return searchQuery;
}

export function setSearchQuery(value: string) {
  searchQuery = value;
}

let hoveredCourse = $state(""); // Course currently hovered by mouse

export function getHoveredCourse() {
  return hoveredCourse;
}

export function setHoveredCourse(value: string) {
  // Do not highlight the hovered course on mobile because touch is registed as mouseenter
  // and the course remains still highlighted when user no longer touches
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (!isMobile) {
    hoveredCourse = value;
  }
}

export function resetHoveredCourse() {
  hoveredCourse = "";
}

let selectedCourseNamesAll = $state(readSelectedCourseNames()); // selected course names for all semesters

export function getSelectedCourseNamesAll() {
  return selectedCourseNamesAll;
}

export function addCourse(newCour: string) {
  if (!(currentSemester in selectedCourseNamesAll)) {
    selectedCourseNamesAll[currentSemester] = [];
  }
  selectedCourseNamesAll[currentSemester].push(newCour);
  selectedCourseNamesAll[currentSemester].sort();
  persistSelectedCourseNames();
}

export function delCourse(delCour: string) {
  if (!(currentSemester in selectedCourseNamesAll)) {
    selectedCourseNamesAll[currentSemester] = [];
  }
  const indexArr = selectedCourseNamesAll[currentSemester].indexOf(delCour);
  selectedCourseNamesAll[currentSemester].splice(indexArr, 1);
  selectedCourseNamesAll[currentSemester].sort();
  persistSelectedCourseNames();
}

export function setCourseList(courseList: string[]) {
  selectedCourseNamesAll[currentSemester] = courseList;
  persistSelectedCourseNames();
}

function readSelectedCourseNames() {
  let selectedCoursesForSemesters = localStorage.getItem("semesterSelCourses2");
  if (!selectedCoursesForSemesters) {
    return {};
  }

  let parsedSelectedCoursesForSemesters;
  try {
    parsedSelectedCoursesForSemesters = JSON.parse(selectedCoursesForSemesters);
  } catch (error) {
    parsedSelectedCoursesForSemesters = {};
    // Reset storage if corrupted
    localStorage.setItem("semesterSelCourses2", "{}");
  }

  if (
    typeof parsedSelectedCoursesForSemesters !== "object" ||
    parsedSelectedCoursesForSemesters === null
  ) {
    parsedSelectedCoursesForSemesters = {};
  }
  return parsedSelectedCoursesForSemesters;
}

function persistSelectedCourseNames() {
  localStorage.setItem(
    "semesterSelCourses2",
    JSON.stringify(selectedCourseNamesAll)
  );
}

const searchedCourseNames: string[] = $derived.by(() => {
  if (currentSemester == "" || !(currentSemester in semesterData)) {
    return [];
  }

  let data = semesterData[currentSemester];
  if (Object.keys(data).length === 0) {
    return [];
  }

  let regexString = searchQuery
    .trim()
    .split(" ")
    .filter((str) => str.length >= 2)
    .join("|");
  let courses: string[] = [];
  if (regexString != "") {
    const regex = new RegExp(regexString, "i"); // i: case insensitive
    courses = Object.keys(data).filter((key) => regex.test(key));
  }
  if (courses.length == 0) {
    if (regexString != "") {
      const regex = new RegExp(regexString, "i"); // i: case insensitive
      courses = Object.keys(data).filter(
        (key) =>
          regex.test(data[key]["name"]) || regex.test(data[key]["instructor"])
      );
    }
  }
  return courses;
});

export function getSearchedCourseNames() {
  return searchedCourseNames;
}

// Only the course data for currently selected semester
const curSemesterData = $derived.by(() => {
  return semesterData[currentSemester] || null;
});

export function getCurSemesterData() {
  return curSemesterData;
}

const selectedCourseNames: string[] = $derived.by(() => {
  return selectedCourseNamesAll[currentSemester] || [];
});

export function getSelectedCourseNames() {
  return selectedCourseNames;
}

const curSemCategories = $derived.by(() => {
  if (!curSemesterData) {
    return [];
  }
  const cat: Set<string> = new Set();
  for (const [courseName, courseInfo] of Object.entries(curSemesterData)) {
    // Get course category by matching the longest letter sequence
    const re = /[$A-Za-z]+/g;
    const matchArray = courseName.match(re);
    if (matchArray && matchArray.length > 0) {
      cat.add(matchArray[0]);
    }
  }
  return Array.from(cat);
});

export function getCurSemCategories() {
  return curSemCategories;
}
