<script lang="ts">
  import {
    getCurrentSemester,
    getSelectedCourseNamesAll,
    getSemesterData,
    setCourseList,
    setCurrentSemester,
    setSemesterDataForSemester,
  } from "./globalState.svelte";
  import { onMount } from "svelte";
  import IconSelector from "./IconSelector.svelte";

  let semesters: string[] = $state([]);

  /**
   * @param {string} semester
   */
  async function fetchSemesterData(semester: string) {
    if (semester in getSemesterData()) {
      // return if semester data is already loaded
      return;
    }
    if (semester === "") {
      // return if semester list is not loaded yet
      return;
    }
    const res = await fetch(`${import.meta.env.BASE_URL}data/${semester}.json`);
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    const semesterCourses = await res.json();
    const tempselectedCourseNames = getSelectedCourseNamesAll()[semester] || [];
    // Remove the unlisted courses from selectedCourseNamesAll
    // This can happen when a user selectes a course, but then, the course is
    // removed by university from the course list.
    const availableCourses = tempselectedCourseNames.filter(
      (courseName: string) => {
        return Object.prototype.hasOwnProperty.call(
          semesterCourses,
          courseName
        );
      }
    );
    setCourseList(availableCourses);
    setSemesterDataForSemester(semester, semesterCourses);
  }

  $effect(() => {
    fetchSemesterData(getCurrentSemester());
  });

  onMount(async () => {
    const res = await fetch(`${import.meta.env.BASE_URL}data/semesters.json`);
    if (res.ok) {
      const semestersRaw: string[] = await res.json();
      semesters = semestersRaw.map((s: string) => s.replace("/", "-"));
      setCurrentSemester(semesters[0]);
    } else {
      throw new Error(res.statusText);
    }
  });

  function saveSelectedCoursesBeforeUnload() {
    localStorage.setItem(
      "semesterSelCourses2",
      JSON.stringify(getSelectedCourseNamesAll())
    );
  }
</script>

<div class="relative">
  <select
    class="text-black dark:text-white bg-white dark:bg-zinc-700 appearance-none focus:outline-hidden focus:ring-2 focus:ring-blue-500 p-1 pr-5 rounded-xs"
    value={getCurrentSemester()}
    oninput={(e) =>
      setCurrentSemester((e.currentTarget as HTMLSelectElement).value ?? "")}
  >
    {#each semesters as semester}
      <option value={semester}>
        {semester}
      </option>
    {:else}
      <option value="">Loading</option>
    {/each}
  </select>
  <div
    class="ml-3 absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none text-zinc-500 dark:text-zinc-400"
  >
    <IconSelector />
  </div>
</div>

<svelte:window onbeforeunload={saveSelectedCoursesBeforeUnload} />
