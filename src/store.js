import Vue from "vue";

export const store = Vue.observable({
  publicPath: process.env.BASE_URL,
  semesterList: [{ value: '', text: 'Semester options loading' }],
  currentSemester: "",
  searchQuery: "",
  semesterData: {},
  selectedCourseNames: [],
  hoveredCourse: "",
  isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
  loading: true
});

export const mutations = {
  setSemesterList(semesterList) {
    store.semesterList = semesterList
  },
  setCurrentSemester(currentSemester) {
    store.loading = true;
    store.currentSemester = currentSemester
  },
  setSearchQuery(searchQuery) {
    store.searchQuery = searchQuery;
    store.hoveredCourse = ""
  },
  setSemesterData(v) {
    store.semesterData = v;
  },
  selectCourse(course) {
    store.selectedCourseNames.push(course);
    store.selectedCourseNames.sort();
  },
  unselectCourse(course) {
    const indexArr = store.selectedCourseNames.indexOf(course);
    store.selectedCourseNames.splice(indexArr, 1);
    store.selectedCourseNames.sort();
  },
  unselectCourseByIndex(courseIndex) {
    store.selectedCourseNames.splice(courseIndex, 1);
    store.selectedCourseNames.sort();
  },
  setSelectedCourseNames(selCourseNames) {
    store.selectedCourseNames = selCourseNames;
  },
  setHoveredCourse(course) {
    if (!store.isMobile) {
      store.hoveredCourse = course;
    }
  },
  setLoading() {
    store.loading = true;
  },
  unsetLoading() {
    store.loading = false;
  }
};