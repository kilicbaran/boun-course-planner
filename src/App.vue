<template>
  <div id="app" class="d-flex flex-column">
    <!-- Navigation Bar -->
    <b-navbar type="dark" variant="dark" class="flex-shrink-0">
      <b-navbar-brand class="py-0">BOUN Course Planner</b-navbar-brand>

      <b-navbar-nav class="ml-auto">
        <b-nav-form>
          <b-form-select :options="semesterOptions" v-model="semester"></b-form-select>
        </b-nav-form>
      </b-navbar-nav>
    </b-navbar>
    <!-- Container -->
    <b-container fluid class="pt-1 d-lg-flex flex-column flex-grow-1 flex-shrink-1 h-100-lg overflow-hidden">
      <b-row class="d-lg-flex flex-grow-1 flex-shrink-1 h-100-lg">
        <!-- Left Half -->
        <b-col lg="5" class="py-2 overflow-y-auto h-100-lg flex-grow-1">
          <b-card no-body class="border-0 mb-3 text-center">
            <b-table responsive small bordered :items="tableItems" :fields="tableFields">
              <template slot="M" slot-scope="row">
                <div :key="`tableM${value}`" v-for="value in row.value">
                  <CourseBadge
                    :value="value"
                    :hoveredCourse="hoveredCourse"
                    :conflict="row.value.length>1"
                  ></CourseBadge>
                </div>
              </template>
              <template slot="T" slot-scope="row">
                <div :key="`tableT${value}`" v-for="value in row.value">
                  <CourseBadge
                    :value="value"
                    :hoveredCourse="hoveredCourse"
                    :conflict="row.value.length>1"
                  ></CourseBadge>
                </div>
              </template>
              <template slot="W" slot-scope="row">
                <div :key="`tableW${value}`" v-for="value in row.value">
                  <CourseBadge
                    :value="value"
                    :hoveredCourse="hoveredCourse"
                    :conflict="row.value.length>1"
                  ></CourseBadge>
                </div>
              </template>
              <template slot="Th" slot-scope="row">
                <div :key="`tableTh${value}`" v-for="value in row.value">
                  <CourseBadge
                    :value="value"
                    :hoveredCourse="hoveredCourse"
                    :conflict="row.value.length>1"
                  ></CourseBadge>
                </div>
              </template>
              <template slot="F" slot-scope="row">
                <div :key="`tableF${value}`" v-for="value in row.value">
                  <CourseBadge
                    :value="value"
                    :hoveredCourse="hoveredCourse"
                    :conflict="row.value.length>1"
                  ></CourseBadge>
                </div>
              </template>
              <template slot="St" slot-scope="row">
                <div :key="`tableSt${value}`" v-for="value in row.value">
                  <CourseBadge
                    :value="value"
                    :hoveredCourse="hoveredCourse"
                    :conflict="row.value.length>1"
                  ></CourseBadge>
                </div>
              </template>
            </b-table>
          </b-card>
          <b-card no-body class="mb-3 flex-shrink-0">
            <strong slot="header">Courses
              <b-badge variant="primary">{{courseCount}}</b-badge>
            </strong>
            <b-list-group flush>
              <b-list-group-item
                :key="`selCourseList${c}`"
                v-for="(c,index) in decodeSelectedCourses"
              >
                {{c}}
                <b-badge
                  v-if="!c.endsWith('LAB') && !c.endsWith('P.S.')"
                >{{"Cr. "+ semesterData[c].credits}}</b-badge>
                <button
                  type="button"
                  class="close px-2"
                  aria-label="Close"
                  @click="delSelCourse(index)"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </b-list-group-item>
            </b-list-group>
            <b-card-footer>
              <strong class="text-success">{{"Total credits: "+courseTotalCredit}}</strong>
            </b-card-footer>
          </b-card>
        </b-col>
        <!-- Right Half -->
        <b-col lg="7" class="py-2 d-flex flex-column h-100-lg overflow-hidden">
          <b-form-input class="flex-shrink-0" type="text" v-model="searchQuery" placeholder="Search courses"></b-form-input>
          <b-list-group
            v-if="filteredCourses.length"
            class="mt-2 overflow-y-auto striped border rounded"
            @mouseleave="setHovered('')"
          >
            <b-list-group-item class="border-0" :key="`search${c}`" v-for="c in filteredCourses">
              <div @mouseenter="setHovered(c)">
                <div class="d-flex justify-content-between flex-wrap align-items-center">
                  <div class="d-flex flex-wrap align-items-center mr-auto">
                    <h5 class="mb-1 mb-lg-0 mr-3">{{semesterData[c].code}}</h5>
                    <div>{{semesterData[c].name}}</div>
                  </div>
                  <div class="d-flex">
                    <small class="text-muted mr-2">Credits: {{semesterData[c].credits}}</small>
                    <small class="text-muted mr-2">ECTS: {{semesterData[c].ects}}</small>
                  </div>
                  <b-button
                    v-if="!inSelectedCourse(c)"
                    class="ml-auto ml-lg-0"
                    variant="success"
                    @click="add(c)"
                  >
                    <font-awesome-icon icon="plus"></font-awesome-icon>
                  </b-button>
                  <b-button v-else variant="danger" class="ml-auto ml-lg-0" @click="remove(c)">
                    <font-awesome-icon icon="minus"></font-awesome-icon>
                  </b-button>
                </div>
                <div>
                  <b-badge
                    class="mr-1 mb-1"
                    variant="danger"
                    :key="`search${c}conf${conflict.title}${conflict.count}`"
                    v-for="conflict in calcConflict(c)"
                  >{{conflict.count + (conflict.count == 1 ? " conflict" : " conflicts") +" with "+conflict.title}}</b-badge>
                </div>
                <div>
                  <b-button class="mr-4" @click="openLink(c)" variant="secondary">
                    <font-awesome-icon icon="file-alt"></font-awesome-icon>
                  </b-button>
                  <span class="mr-4">{{semesterData[c].instructor}}</span>
                  <span v-if="semesterData[c].days" class="mr-4">
                    Days:
                    <span
                      :key="`search${c}day${index}`"
                      v-for="(day,index) in semesterData[c].days"
                    >{{day}}</span>
                  </span>
                  <span v-if="semesterData[c].hours" class="mr-4">
                    Hours:
                    <span
                      :key="`search${c}hour${index}`"
                      v-for="(hour,index) in semesterData[c].hours"
                    >{{hour}}</span>
                  </span>
                  <span v-if="semesterData[c].rooms" class="mr-4">
                    Rooms:
                    <span
                      class="mr-2"
                      :key="`search${c}room${index}`"
                      v-for="(room,index) in semesterData[c].rooms"
                    >{{room}}</span>
                  </span>
                </div>
                <div>
                  <small v-if="semesterData[c].requiredForDept" class="text-muted">
                    Required for department:
                    <span
                      class="mr-1"
                      :key="`search${c}reqForDept${index}`"
                      v-for="(dept,index) in semesterData[c].requiredForDept"
                    >{{dept}}</span>
                  </small>
                </div>
                <div>
                  <small v-if="semesterData[c].dept" class="text-muted">
                    Departments:
                    <span
                      class="mr-1"
                      :key="`search${c}dept${index}`"
                      v-for="(dept,index) in semesterData[c].dept"
                    >{{dept}}</span>
                  </small>
                </div>
              </div>
              <div
                :key="`search${c}lab${labIndex}`"
                v-for="(lab,labIndex) in semesterData[c]['LAB']"
                @mouseenter="setHovered(c,'LAB',labIndex)"
              >
                <hr>
                <div class>
                  <span class="mr-4">LAB</span>
                  <span class="mr-4">{{lab.instructor}}</span>
                  <span v-if="lab.days" class="mr-4">
                    Days:
                    <span
                      :key="`search${c}lab${labIndex}day${index}`"
                      v-for="(day,index) in lab.days"
                    >{{day}}</span>
                  </span>
                  <span v-if="lab.hours" class="mr-4">
                    Hours:
                    <span
                      :key="`search${c}lab${labIndex}hour${index}`"
                      v-for="(hour,index) in lab.hours"
                    >{{hour}}</span>
                  </span>
                  <span v-if="lab.rooms" class="mr-4">
                    Rooms:
                    <span
                      class="mr-2"
                      :key="`search${c}lab${labIndex}room${index}`"
                      v-for="(room,index) in lab.rooms"
                    >{{room}}</span>
                  </span>
                  <b-button
                    v-if="!inSelectedCourse(c,'LAB',labIndex)"
                    class="float-right"
                    variant="success"
                    @click="add(c,'LAB',labIndex)"
                  >
                    <font-awesome-icon icon="plus"></font-awesome-icon>
                  </b-button>
                  <b-button
                    v-else
                    variant="danger"
                    class="float-right"
                    @click="remove(c,'LAB',labIndex)"
                  >
                    <font-awesome-icon icon="minus"></font-awesome-icon>
                  </b-button>
                </div>
                <div>
                  <b-badge
                    class="mr-1"
                    variant="danger"
                    :key="`search${c}conf${conflict.title}lab${labIndex}${conflict.count}`"
                    v-for="conflict in calcConflict(c,'LAB',labIndex)"
                  >{{conflict.count + (conflict.count == 1 ? " conflict" : " conflicts") +" with "+conflict.title}}</b-badge>
                </div>
                <div>
                  <small v-if="lab.requiredForDept" class="text-muted">
                    Required for department:
                    <span
                      class="mr-1"
                      :key="`search${c}lab${labIndex}reqForDept${index}`"
                      v-for="(dept,index) in lab.requiredForDept"
                    >{{dept}}</span>
                  </small>
                </div>
                <div>
                  <small v-if="lab.dept" class="text-muted">
                    Departments:
                    <span
                      class="mr-1"
                      :key="`search${c}lab${labIndex}dept${index}`"
                      v-for="(dept,index) in lab.dept"
                    >{{dept}}</span>
                  </small>
                </div>
              </div>
              <div
                :key="`search${c}ps${psIndex}`"
                v-for="(ps,psIndex) in semesterData[c]['P.S.']"
                @mouseenter="setHovered(c,'P.S.',psIndex)"
              >
                <hr>
                <div>
                  <span class="mr-4">P.S.</span>
                  <span class="mr-4">{{ps.instructor}}</span>
                  <span v-if="ps.days" class="mr-4">
                    Days:
                    <span
                      :key="`search${c}ps${psIndex}day${index}`"
                      v-for="(day,index) in ps.days"
                    >{{day}}</span>
                  </span>
                  <span v-if="ps.hours" class="mr-4">
                    Hours:
                    <span
                      :key="`search${c}ps${psIndex}hour${index}`"
                      v-for="(hour,index) in ps.hours"
                    >{{hour}}</span>
                  </span>
                  <span v-if="ps.rooms" class="mr-4">
                    Rooms:
                    <span
                      class="mr-2"
                      :key="`search${c}ps${psIndex}room${index}`"
                      v-for="(room,index) in ps.rooms"
                    >{{room}}</span>
                  </span>
                  <b-button
                    v-if="!inSelectedCourse(c,'P.S.',psIndex)"
                    class="float-right"
                    variant="success"
                    @click="add(c,'P.S.',psIndex)"
                  >
                    <font-awesome-icon icon="plus"></font-awesome-icon>
                  </b-button>
                  <b-button
                    v-else
                    variant="danger"
                    class="float-right"
                    @click="remove(c,'P.S.',psIndex)"
                  >
                    <font-awesome-icon icon="minus"></font-awesome-icon>
                  </b-button>
                </div>
                <div>
                  <b-badge
                    class="mr-1"
                    variant="danger"
                    :key="`search${c}conf${conflict.title}ps${psIndex}${conflict.count}`"
                    v-for="conflict in calcConflict(c,'P.S.',psIndex)"
                  >{{conflict.count + (conflict.count == 1 ? " conflict" : " conflicts") +" with "+conflict.title}}</b-badge>
                </div>
                <div>
                  <small v-if="ps.requiredForDept" class="text-muted">
                    Required for department:
                    <span
                      class="mr-1"
                      :key="`search${c}ps${psIndex}reqForDept${index}`"
                      v-for="(dept,index) in ps.requiredForDept"
                    >{{dept}}</span>
                  </small>
                </div>
                <div>
                  <small v-if="ps.dept" class="text-muted">
                    Departments:
                    <span
                      class="mr-1"
                      :key="`search${c}ps${psIndex}dept${index}`"
                      v-for="(dept,index) in ps.dept"
                    >{{dept}}</span>
                  </small>
                </div>
              </div>
            </b-list-group-item>
          </b-list-group>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import CourseBadge from "./components/CourseBadge.vue";
import debounce from "lodash.debounce";

export default {
  name: "app",
  components: {
    CourseBadge
  },
  data() {
    return {
      publicPath: process.env.BASE_URL,
      semester: "2018-2019-2",
      semesterOptions: [
        "2018-2019-2",
        "2018-2019-1",
        "2017-2018-3",
        "2017-2018-2",
        "2017-2018-1",
        "2016-2017-3",
        "2016-2017-2"
      ],
      searchQuery: "",
      semesterData: {},
      tableFields: [
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
      ],
      tableItems: [],
      selectedCourses: [],
      filteredCourses: [],
      hoveredCourse: "",
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    };
  },
  created() {
    this.initTable();
    this.fetchData();
    this.setHovered = debounce(this.setHoveredCourse, 200);
    this.setFilteredCoursesDebounce = debounce(this.setFilteredCourses, 300);
    window.addEventListener("beforeunload", this.beforeUnload);
  },
  mounted() {},
  computed: {
    courseCount: function() {
      return this.selectedCourses.filter(c => !/[-;]/.test(c)).length;
    },
    courseTotalCredit: function() {
      return this.selectedCourses
        .filter(c => !/[-;]/.test(c))
        .map(c => {
          return Number(this.semesterData[c].credits);
        })
        .reduce((a, b) => a + b, 0);
    },
    decodeSelectedCourses: function() {
      return this.selectedCourses.map(c => this.decodeCourse(c));
    },
    hoveredAndSelectedCourses: function() {
      if (this.selectedCourses.includes(this.hoveredCourse)) {
        return this.selectedCourses.concat([""]);
      } else {
        return this.selectedCourses.concat([this.hoveredCourse]);
      }
    }
  },
  watch: {
    // eslint-disable-next-line
    hoveredAndSelectedCourses: function(newCourses, oldCourses) {
      this.resetTable();
      const [hoveredCourse] = newCourses.slice(-1);
      const selectedCourses = newCourses.slice(0, -1);
      let courseOnSaturday = false;
      let latestCourseHour = 16;
      for (let i = 0; i < selectedCourses.length; i++) {
        const course = selectedCourses[i];
        const { hours, days, title } = this.getHourDayTitle(course);
        for (let j = 0; j < days.length; j++) {
          if (days[j] == "St") {
            courseOnSaturday = true;
          }
          latestCourseHour = Math.max(latestCourseHour, hours[j] + 8);
          this.tableItems[Number(hours[j]) - 1][days[j]].push(title);
        }
      }
      if (hoveredCourse != "") {
        const { hours, days, title } = this.getHourDayTitle(hoveredCourse);
        for (let j = 0; j < days.length; j++) {
          if (days[j] == "St") {
            courseOnSaturday = true;
          }
          latestCourseHour = Math.max(latestCourseHour, hours[j] + 8);
          this.tableItems[Number(hours[j]) - 1][days[j]].push(title);
        }
      }
      for (let i = latestCourseHour + 1; i <= 22; i++) {
        this.tableItems.pop();
      }
      if (!courseOnSaturday) {
        this.tableFields[this.tableFields.length - 1].thClass = "d-none";
        this.tableFields[this.tableFields.length - 1].tdClass = "d-none";
      }
    },
    // eslint-disable-next-line
    searchQuery: function(newQuery, oldQuery) {
      const query = newQuery;
      this.setFilteredCoursesDebounce(query);
    },
    // eslint-disable-next-line
    semester: function(newSemester, oldSemester) {
      this.fetchData();
    }
  },
  methods: {
    initTable() {
      this.resetTable();
      this.tableFields[this.tableFields.length - 1].thClass = "d-none";
      this.tableFields[this.tableFields.length - 1].tdClass = "d-none";
      let latestCourseHour = 16;
      for (let i = latestCourseHour + 1; i <= 22; i++) {
        this.tableItems.pop();
      }
    },
    resetTable() {
      this.tableFields[this.tableFields.length - 1].thClass = "";
      this.tableFields[this.tableFields.length - 1].tdClass = "";
      this.tableItems = [];
      for (let i = 9; i < 23; i++) {
        this.tableItems.push({
          hour: i,
          M: [],
          T: [],
          W: [],
          Th: [],
          F: [],
          St: []
        });
      }
    },
    fetchData() {
      fetch(`${this.publicPath}data/${this.semester}.json`)
        .then(response => response.json())
        .then(semesterJson => {
          this.searchQuery = ""; // reset variables
          this.selectedCourses = [];
          this.filteredCourses = [];
          this.hoveredCourse = "";
          this.initTable();
          this.semesterData = semesterJson; // load data
          // load previous selectec courses
          const semester = localStorage.getItem("semester") || "";
          if (semester != "" && semester == this.semester) {
            this.selectedCourses = JSON.parse(
              localStorage.getItem("selectedCourses") || "[]"
            );
          }
        });
    },
    delSelCourse(index) {
      this.selectedCourses.splice(index, 1);
    },
    getHourDayTitle(course) {
      let hours, days, title;
      if (course.includes("-")) {
        // lab
        const [courseCode, index] = course.split("-");
        ({ hours = [], days = [] } = this.semesterData[courseCode]["LAB"][
          index
        ]);
        title = this.semesterData[courseCode].code + " LAB";
      } else if (course.includes(";")) {
        // p.s.
        const [courseCode, index] = course.split(";");
        ({ hours = [], days = [] } = this.semesterData[courseCode]["P.S."][
          index
        ]);
        title = this.semesterData[courseCode].code + " P.S.";
      } else {
        hours = this.semesterData[course].hours || [];
        days = this.semesterData[course].days || [];
        title = this.semesterData[course].code;
      }
      return { hours, days, title };
    },
    encodeCourse(course = "", labps = "", index = -1) {
      if (labps == "LAB") {
        return course + "-" + index;
      } else if (labps == "P.S.") {
        return course + ";" + index;
      } else {
        return course;
      }
    },
    decodeCourse(c) {
      if (c.includes("-")) {
        return c.split("-")[0] + " LAB";
      } else if (c.includes(";")) {
        return c.split(";")[0] + " P.S.";
      } else {
        return c;
      }
    },
    setHoveredCourse(course = "", labps = "", index = -1) {
      if(!this.isMobile){
        this.hoveredCourse = this.encodeCourse(course, labps, index);
      }
    },
    add(course, labps = "", index = -1) {
      this.selectedCourses.push(this.encodeCourse(course, labps, index));
    },
    remove(course, labps = "", index = -1) {
      const encoded = this.encodeCourse(course, labps, index);
      const indexArr = this.selectedCourses.indexOf(encoded);
      this.selectedCourses.splice(indexArr, 1);
    },
    toggle(course, labps = "", index = -1) {
      const encoded = this.encodeCourse(course, labps, index);
      const indexArr = this.selectedCourses.indexOf(encoded);
      if (indexArr > -1) {
        this.remove(course, labps, index);
      } else {
        this.add(course, labps, index);
      }
    },
    inSelectedCourse(course, labps = "", index = -1) {
      const encoded = this.encodeCourse(course, labps, index);
      const indexArr = this.selectedCourses.indexOf(encoded);
      return indexArr > -1;
    },
    calcConflict(course, labps = "", index = -1) {
      const encoded = this.encodeCourse(course, labps, index);
      // eslint-disable-next-line
      const { hours, days, title } = this.getHourDayTitle(encoded);
      let conflicts = [];
      for (let i = 0; i < this.selectedCourses.length; i++) {
        let conflictCount = 0;
        const otherCourse = this.selectedCourses[i];
        if (otherCourse != encoded) {
          const {
            hours: hours2,
            days: days2,
            title: title2
          } = this.getHourDayTitle(otherCourse);
          for (let j = 0; j < hours2.length; j++) {
            for (let k = 0; k < hours.length; k++) {
              if (hours2[j] == hours[k] && days2[j] == days[k]) {
                conflictCount++;
              }
            }
          }
          if (conflictCount > 0) {
            conflicts.push({ title: title2, count: conflictCount });
          }
        }
      }
      return conflicts;
    },
    setFilteredCourses(query) {
      if (Object.keys(this.semesterData).length !== 0) {
        const regexString = query
          .trim()
          .split(" ")
          .filter(str => str.length >= 2)
          .join("|");
        if (regexString != "") {
          const regex = new RegExp(regexString, "i"); // i: case insensitive
          this.filteredCourses = Object.keys(this.semesterData).filter(key =>
            regex.test(key)
          );
        } else {
          this.filteredCourses = [];
        }
      }
    },
    // eslint-disable-next-line
    beforeUnload(e) {
      localStorage.setItem("semester", this.semester);
      localStorage.setItem(
        "selectedCourses",
        JSON.stringify(this.selectedCourses.slice())
      );
    },
    openLink(course) {
      window.open(
        `http://registration.boun.edu.tr/scripts/schedule/coursedescription.asp?course=${
          course.split(".")[0]
        }&section=${course.split(".")[1]}&term=${this.semester.replace(
          "-",
          "%2F"
        )}`,
        "_blank"
      );
    }
  }
};
</script>

<style>
html {
  font-size: 0.875rem;
}

html,
body {
  background-color: #f8f9fa !important;
}

.table {
  margin-bottom: 0px !important;
}

b-row {
  flex: 1 1 0;
}

.list-group.striped .list-group-item:nth-of-type(odd) {
  background-color: rgba(0, 0, 0, 0.04);
}

input,
select {
  font-size: 16px !important; /* to prevent zoom on safari*/
}

@media screen and (min-width: 992px) {
  html,
  body,
  #app {
    height: 100vh;
    width: 100vw;
    max-width: 100vw;
    max-height: 100vh;
  }
  .h-100-lg {
    height: 100%;
  }
  .overflow-y-auto {
    flex: 1 1 auto !important;
    min-height: 0px;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .overflow-hidden {
    overflow: hidden;
  }
}
</style>
