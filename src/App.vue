<template>
  <div id="app" class="d-flex flex-column">
    <NavigationBar />
    <b-container
      fluid
      class="pt-1 d-lg-flex flex-column flex-grow-1 flex-shrink-1 h-100-lg overflow-hidden"
    >
      <b-row class="d-lg-flex flex-grow-1 flex-shrink-1 h-100-lg">
        <b-col lg="5" class="py-2 overflow-y-auto h-100-lg flex-grow-1">
          <Timetable />
          <SelectedCourseList />
          <MyFooter class="d-none d-lg-block" />
        </b-col>
        <CourseSearch />
      </b-row>
    </b-container>
  </div>
</template>

<script>
import NavigationBar from "./components/NavigationBar.vue";
import SelectedCourseList from "./components/SelectedCourseList.vue";
import Timetable from "./components/Timetable.vue";
import CourseSearch from "./components/CourseSearch.vue";
import MyFooter from "./components/MyFooter.vue";
import { store } from "./store";
import "./main.css";

export default {
  name: "App",
  components: {
    NavigationBar,
    SelectedCourseList,
    Timetable,
    CourseSearch,
    MyFooter
  },
  created() {
    window.addEventListener("beforeunload", this.beforeUnload);
  },
  computed: {
    currentSemester() {
      return store.currentSemester;
    },
    selectedCourseNames() {
      return store.selectedCourseNames;
    }
  },
  methods: {
    // eslint-disable-next-line no-unused-vars
    beforeUnload(e) {
      let selectedCoursesForSemesters =
        localStorage.getItem("semesterSelCourses") || "{}";
      selectedCoursesForSemesters = JSON.parse(selectedCoursesForSemesters);
      selectedCoursesForSemesters[
        this.currentSemester
      ] = this.selectedCourseNames;
      localStorage.setItem(
        "semesterSelCourses",
        JSON.stringify(selectedCoursesForSemesters)
      );
    }
  }
};
</script>

<style>
</style>
