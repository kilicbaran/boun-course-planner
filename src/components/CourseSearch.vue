<template>
  <b-col lg="7" class="py-2 d-flex flex-column h-100-lg overflow-hidden">
    <b-form-input
      class="flex-shrink-0"
      type="text"
      v-model="searchQuery"
      placeholder="Search courses"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="none"
      @keyup.enter="blurInput()"
    ></b-form-input>
    <b-spinner class="mx-auto m-4" v-if="loading" label="Loading..."></b-spinner>
    <b-list-group
      v-if="searchedCourseNames.length"
      class="mt-2 overflow-y-auto striped"
      @mouseleave="setHoveredCourse('')"
    >
      <CourseInfo
        v-for="course in searchedCourseNames"
        :key="course"
        v-bind:course="semesterData[currentSemester][course]"
        v-bind:courseCode="course"
      />
    </b-list-group>
    <MyFooter class="d-block d-lg-none" />
  </b-col>
</template>

<script>
import { store, mutations } from "../store";
import CourseInfo from "./CourseInfo";
import MyFooter from "./MyFooter";

export default {
  name: "CourseSearch",
  props: {},
  components: {
    CourseInfo,
    MyFooter
  },
  computed: {
    searchQuery: {
      get() {
        return store.searchQuery;
      },
      set: mutations.setSearchQuery
    },

    semesterData() {
      return store.semesterData;
    },

    publicPath() {
      return store.publicPath;
    },

    currentSemester() {
      return store.currentSemester;
    },

    searchedCourseNames() {
      if (
        this.currentSemester == "" ||
        !Object.prototype.hasOwnProperty.call(
          this.semesterData,
          this.currentSemester
        )
      ) {
        return [];
      }

      let data = this.semesterData[this.currentSemester];
      if (Object.keys(data).length !== 0) {
        let regexString = this.searchQuery
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
      }
      return [];
    },
    loading() {
      return store.loading;
    },
    selectedCourseNames() {
      return store.selectedCourseNames;
    }
  },
  methods: {
    setSemesterData: mutations.setSemesterData,
    setSelectedCourseNames: mutations.setSelectedCourseNames,
    setHoveredCourse: mutations.setHoveredCourse,
    setLoading: mutations.setLoading,
    unsetLoading: mutations.unsetLoading,
    fetchSemesterData(semester) {
      this.setLoading();
      fetch(`${this.publicPath}data/${semester}.json`)
        .then(response => response.json())
        .then(semesterCourses => {
          // Deep Clone Object
          let semesterDataCopy = JSON.parse(JSON.stringify(this.semesterData));
          semesterDataCopy[semester] = semesterCourses;
          this.setSemesterData(semesterDataCopy); // load data
          this.loadPreviouslySelectedCourses(semester);
          this.unsetLoading();
        });
    },
    blurInput() {
      document.activeElement.blur();
    },
    loadPreviouslySelectedCourses(semester) {
      let selectedCoursesForSemesters =
        localStorage.getItem("semesterSelCourses") || "{}";
      selectedCoursesForSemesters = JSON.parse(selectedCoursesForSemesters);
      // If some courses are selected previously for this new semester load them
      if (
        Object.prototype.hasOwnProperty.call(
          selectedCoursesForSemesters,
          semester
        )
      ) {
        this.setSelectedCourseNames(selectedCoursesForSemesters[semester]);
      }
    }
  },
  watch: {
    // eslint-disable-next-line no-unused-vars
    currentSemester: function(newSemester, oldSemester) {
      // Save selected courses of old semester before change
      let selectedCoursesForSemesters =
        localStorage.getItem("semesterSelCourses") || "{}";
      selectedCoursesForSemesters = JSON.parse(selectedCoursesForSemesters);
      selectedCoursesForSemesters[oldSemester] = this.selectedCourseNames;
      localStorage.setItem(
        "semesterSelCourses",
        JSON.stringify(selectedCoursesForSemesters)
      );
      this.setHoveredCourse("");
      this.setSelectedCourseNames([]);

      // Load semester info if not already loaded
      if (
        !Object.prototype.hasOwnProperty.call(this.semesterData, newSemester)
      ) {
        this.fetchSemesterData(newSemester);
      } else {
        this.unsetLoading();
        this.loadPreviouslySelectedCourses(newSemester);
      }
    }
  }
};
</script>
