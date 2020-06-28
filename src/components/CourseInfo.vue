<template>
  <b-list-group-item class="border-0">
    <div @mouseenter="setHoveredCourse(courseCode)">
      <div class="d-flex justify-content-between flex-wrap align-items-center">
        <div class="d-flex flex-wrap align-items-center mr-auto">
          <h5 class="mb-1 mb-lg-0 mr-3">{{courseCode}}</h5>
          <div>{{course.name}}</div>
        </div>
        <div class="d-flex">
          <small v-if="haveCredit" class="text-muted mr-2">Credits: {{course.credits}}</small>
          <small v-if="haveEcts" class="text-muted mr-2">ECTS: {{course.ects}}</small>
        </div>
        <b-button
          v-if="!isSelectedCourse(courseCode)"
          class="ml-auto ml-lg-0"
          variant="success"
          @click="selectCourse(courseCode)"
        >
          <b-icon icon="plus" scale="1.5"></b-icon>
        </b-button>
        <b-button
          v-else
          variant="danger"
          class="ml-auto ml-lg-0"
          @click="unselectCourse(courseCode)"
        >
          <b-icon icon="dash" scale="1.5"></b-icon>
        </b-button>
      </div>
      <div>
        <span
          class="mr-2 mb-2 conflict"
          :key="`search${courseCode}conf${conflict.title}${conflict.count}`"
          v-for="conflict in calcConflict(courseCode)"
        >{{conflict.count + (conflict.count == 1 ? " conflict" : " conflicts") +" with "+conflict.title}}</span>
      </div>
      <div>
        <b-button class="mr-4" @click="openLink(course.code)" variant="secondary">
          <b-icon icon="file-earmark-text" scale="1.5"></b-icon>
        </b-button>
        <span class="mr-4">{{course.instructor}}</span>
        <span v-if="course.days" class="mr-4">
          Days:
          <span
            :key="`search${courseCode}day${index}`"
            v-for="(day,index) in course.days"
          >{{day}}</span>
        </span>
        <span v-if="course.hours" class="mr-4">
          Hours:
          <span
            :key="`search${courseCode}hour${index}`"
            v-for="(hour,index) in course.hours"
          >{{hour}}</span>
        </span>
        <span v-if="course.rooms" class="mr-4">
          Rooms:
          <span
            class="mr-2"
            :key="`search${courseCode}room${index}`"
            v-for="(room,index) in course.rooms"
          >{{room}}</span>
        </span>
      </div>
      <div>
        <small v-if="course.requiredForDept" class="text-muted">
          Required for department:
          <span
            class="mr-1"
            :key="`search${courseCode}reqForDept${index}`"
            v-for="(dept,index) in course.requiredForDept"
          >{{dept}}</span>
        </small>
      </div>
      <div>
        <small v-if="course.dept" class="text-muted">
          Departments:
          <span
            class="mr-1"
            :key="`search${courseCode}dept${index}`"
            v-for="(dept,index) in course.dept"
          >{{dept}}</span>
        </small>
      </div>
    </div>
  </b-list-group-item>
</template>

<script>
import { store, mutations } from "../store";

export default {
  name: "CourseInfo",
  props: {
    course: Object,
    courseCode: String
  },
  computed: {
    selectedCourseNames() {
      return store.selectedCourseNames;
    },
    currentSemester() {
      return store.currentSemester;
    },
    semesterData() {
      return store.semesterData;
    },
    haveCredit() {
      return Object.prototype.hasOwnProperty.call(this.course, "credits");
    },
    haveEcts() {
      return Object.prototype.hasOwnProperty.call(this.course, "ects");
    }
  },
  methods: {
    selectCourse: mutations.selectCourse,
    unselectCourse: mutations.unselectCourse,
    setHoveredCourse: mutations.setHoveredCourse,
    isSelectedCourse(courseName) {
      const indexArr = this.selectedCourseNames.indexOf(courseName);
      return indexArr > -1;
    },
    openLink(course) {
      const [code, section] = course.split(".");
      const term = this.currentSemester.replace("-", "%2F");
      window.open(
        `http://registration.boun.edu.tr/scripts/schedule/coursedescription.asp?course=${code}&section=${section}&term=${term}`,
        "_blank"
      );
    },
    calcConflict(course) {
      const { hours, days } = this.semesterData[this.currentSemester][course];
      let conflicts = [];
      for (let i = 0; i < this.selectedCourseNames.length; i++) {
        let conflictCount = 0;
        const otherCourse = this.selectedCourseNames[i];
        if (otherCourse != course) {
          const { hours: hours2, days: days2 } = this.semesterData[
            this.currentSemester
          ][otherCourse];
          if (hours && hours2) {
            for (let j = 0; j < hours2.length; j++) {
              for (let k = 0; k < hours.length; k++) {
                if (hours2[j] == hours[k] && days2[j] == days[k]) {
                  conflictCount++;
                }
              }
            }
          }
          if (conflictCount > 0) {
            conflicts.push({ title: otherCourse, count: conflictCount });
          }
        }
      }
      return conflicts;
    }
  }
};
</script>

<style scoped>
.conflict {
  color: #dc3545;
  font-size: 75%;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
}
</style>
