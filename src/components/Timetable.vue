<template>
  <b-card no-body class="border-0 mb-3 text-center">
    <b-table responsive small striped :items="tableItems" :fields="tableFields">
      <template v-slot:cell(M)="row">
        <div :key="`tableM${value}`" v-for="value in row.value">
          <CourseBadge :value="value" :conflict="row.value.length>1"></CourseBadge>
        </div>
      </template>
      <template v-slot:cell(T)="row">
        <div :key="`tableT${value}`" v-for="value in row.value">
          <CourseBadge :value="value" :conflict="row.value.length>1"></CourseBadge>
        </div>
      </template>
      <template v-slot:cell(W)="row">
        <div :key="`tableW${value}`" v-for="value in row.value">
          <CourseBadge :value="value" :conflict="row.value.length>1"></CourseBadge>
        </div>
      </template>
      <template v-slot:cell(Th)="row">
        <div :key="`tableTh${value}`" v-for="value in row.value">
          <CourseBadge :value="value" :conflict="row.value.length>1"></CourseBadge>
        </div>
      </template>
      <template v-slot:cell(F)="row">
        <div :key="`tableF${value}`" v-for="value in row.value">
          <CourseBadge :value="value" :conflict="row.value.length>1"></CourseBadge>
        </div>
      </template>
      <template v-slot:cell(St)="row">
        <div :key="`tableSt${value}`" v-for="value in row.value">
          <CourseBadge :value="value" :conflict="row.value.length>1"></CourseBadge>
        </div>
      </template>
    </b-table>
  </b-card>
</template>

<script>
import { store } from "../store";
import CourseBadge from "./CourseBadge";

export default {
  name: "Timetable",
  components: {
    CourseBadge
  },
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
    hoveredCourse() {
      return store.hoveredCourse;
    },
    loading() {
      return store.loading;
    },
    calculateTable() {
      return (
        this.currentSemester != "" &&
        !this.loading &&
        Object.prototype.hasOwnProperty.call(
          this.semesterData,
          this.currentSemester
        )
      );
    },
    courseOnSaturday() {
      if (!this.calculateTable) {
        return false;
      }
      for (let i = 0; i < this.selectedCourseNames.length; i++) {
        const courseName = this.selectedCourseNames[i];
        const days = this.semesterData[this.currentSemester][courseName].days;
        if (days) {
          for (let j = 0; j < days.length; j++) {
            if (days[j] == "St") {
              return true;
            }
          }
        }
      }
      if (this.hoveredCourse != "") {
        const days = this.semesterData[this.currentSemester][this.hoveredCourse]
          .days;
        if (days) {
          for (let j = 0; j < days.length; j++) {
            if (days[j] == "St") {
              return true;
            }
          }
        }
      }
      return false;
    },
    tableItems() {
      let table = [];
      let latestCourseHour;
      for (let i = 9; i < 23; i++) {
        table.push({
          hour: i,
          M: [],
          T: [],
          W: [],
          Th: [],
          F: [],
          St: []
        });
      }
      latestCourseHour = 16;
      if (this.calculateTable) {
        for (let i = 0; i < this.selectedCourseNames.length; i++) {
          const courseName = this.selectedCourseNames[i];
          const { hours, days } = this.semesterData[this.currentSemester][
            courseName
          ];
          if (days) {
            for (let j = 0; j < days.length; j++) {
              latestCourseHour = Math.max(latestCourseHour, hours[j] + 8);
              table[Number(hours[j]) - 1][days[j]].push(courseName);
            }
          }
        }
        if (
          this.hoveredCourse != "" &&
          !this.selectedCourseNames.includes(this.hoveredCourse)
        ) {
          const { hours, days } = this.semesterData[this.currentSemester][
            this.hoveredCourse
          ];
          if (days) {
            for (let j = 0; j < days.length; j++) {
              latestCourseHour = Math.max(latestCourseHour, hours[j] + 8);
              table[Number(hours[j]) - 1][days[j]].push(this.hoveredCourse);
            }
          }
        }
      }

      for (let i = latestCourseHour + 1; i < 23; i++) {
        table.pop();
      }
      return table;
    },
    tableFields() {
      let tableFields = [
        {
          key: "hour",
          label: "",
          isRowHeader: true
        },
        {
          key: "M",
          label: "Mon"
        },
        {
          key: "T",
          label: "Tue"
        },
        {
          key: "W",
          label: "Wed"
        },
        {
          key: "Th",
          label: "Thu"
        },
        {
          key: "F",
          label: "Fri"
        },
        {
          key: "St",
          label: "Sat",
          thClass: "",
          tdClass: ""
        }
      ];
      if (this.courseOnSaturday) {
        tableFields[tableFields.length - 1].thClass = "";
        tableFields[tableFields.length - 1].tdClass = "";
      } else {
        tableFields[tableFields.length - 1].thClass = "d-none";
        tableFields[tableFields.length - 1].tdClass = "d-none";
      }
      return tableFields;
    }
  },
  methods: {}
};
</script>

<style scoped>
</style>
