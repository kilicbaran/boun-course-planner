<template>
  <b-navbar type="dark" variant="dark" class="flex-shrink-0">
    <b-navbar-brand class="py-0">BOUN Course Planner</b-navbar-brand>

    <b-navbar-nav class="ml-auto">
      <b-nav-form>
        <b-form-select :options="semesterList" v-model="currentSemester"></b-form-select>
      </b-nav-form>
    </b-navbar-nav>
  </b-navbar>
</template>

<script>
import { store, mutations } from "../store";

export default {
  name: "NavigationBar",
  props: {},
  computed: {
    semesterList() {
      return store.semesterList;
    },

    currentSemester: {
      get() {
        return store.currentSemester;
      },
      set: mutations.setCurrentSemester
    },

    publicPath() {
      return store.publicPath;
    }
  },
  methods: {
    setSemesterList: mutations.setSemesterList,
    setCurrentSemester: mutations.setCurrentSemester,
    fetchSemesterList() {
      fetch(`${this.publicPath}data/semesters.json`)
        .then(response => response.json())
        .then(semesterList => {
          semesterList = semesterList.map(s => s.replace("/","-"));
          this.setSemesterList(semesterList);
          this.setCurrentSemester(semesterList[0]);
        });
    }
  },
  created() {
    this.fetchSemesterList();
  }
};
</script>

<style scoped>
</style>
