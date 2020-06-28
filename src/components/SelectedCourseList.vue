<template>
  <b-card v-if="showSelectedCourseList" no-body class="mb-3 flex-shrink-0">
    <strong slot="header">
      Courses
      <b-badge variant="primary">{{courseCount}}</b-badge>
    </strong>
    <b-list-group flush>
      <b-list-group-item :key="`selCourseList${c}`" v-for="(c,index) in selectedCourseNames">
        {{c}}
        <b-badge
          v-if="!/ (LAB|P.S.) \d+/.test(c)"
        >{{"Cr. "+ semesterData[currentSemester][c].credits}}</b-badge>
        <button
          type="button"
          class="close px-2"
          aria-label="Close"
          @click="unselectCourseByIndex(index)"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </b-list-group-item>
    </b-list-group>
    <b-card-footer>
      <strong class="text-success">{{"Total credits: "+courseTotalCredit}}</strong>
    </b-card-footer>
  </b-card>
</template>

<script>
import { store, mutations } from "../store";

export default {
  name: "SelectedCourseList",
  props: {},
  computed: {
    selectedCourseNames() {
      return store.selectedCourseNames;
    },
    semesterData() {
      return store.semesterData;
    },
    currentSemester() {
      return store.currentSemester;
    },
    courseCount: function() {
      if (!this.showSelectedCourseList) {
        return 0;
      }
      return this.selectedCourseNames.filter(c => !/(LAB|P.S.)/.test(c)).length;
    },
    loading() {
      return store.loading;
    },
    showSelectedCourseList() {
      return (
        this.selectedCourseNames.length &&
        this.currentSemester != "" &&
        !this.loading &&
        Object.prototype.hasOwnProperty.call(
          this.semesterData,
          this.currentSemester
        )
      );
    },
    courseTotalCredit: function() {
      if (!this.showSelectedCourseList) {
        return 0;
      }
      return this.selectedCourseNames
        .filter(c => !/(LAB|P.S.)/.test(c))
        .map(c => {
          return Number(this.semesterData[this.currentSemester][c].credits);
        })
        .reduce((a, b) => a + b, 0);
    }
  },
  methods: {
    unselectCourseByIndex: mutations.unselectCourseByIndex
  }
};
</script>

<style scoped>
</style>
