<template>
  <div class="bg-success text-white rounded" v-if="value == decodeCourse(hoveredCourse)">{{value}}</div>
  <div class="bg-danger text-white rounded mb-1" v-else-if="conflict">{{value}}</div>
  <div v-else>{{value}}</div>
</template>

<script>
export default {
  name: "CourseBadge",
  props: ["value", "hoveredCourse", "conflict"],
  methods: {
    decodeCourse(c) {
      if (c.includes("-")) {
        return c.split("-")[0] + " LAB";
      } else if (c.includes(";")) {
        return c.split(";")[0] + " P.S.";
      } else {
        return c;
      }
    }
  }
};
</script>
