<template>
  <div class="bg-success text-white rounded" v-if="value == hoveredCourse">{{value}}</div>
  <div class="bg-danger text-white rounded mb-1" v-else-if="conflict">{{value}}</div>
  <div v-else>{{value}}</div>
</template>

<script>
import { store } from "../store";

export default {
  name: "CourseBadge",
  props: { value: String, conflict: Boolean },
  computed: {
    hoveredCourse() {
      return store.hoveredCourse;
    }
  },
  methods: {}
};
</script>
