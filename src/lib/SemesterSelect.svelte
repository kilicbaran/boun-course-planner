<script>
    import {
        base_url,
        currentSemester,
        selectedCourseNamesAll,
        semesterData,
    } from "./stores.js";
    import { onMount } from "svelte";
    import IconSelector from "./IconSelector.svelte";

    let semesters = [];

    /**
     * @param {string} semester
     */
    async function getSemesterData(semester) {
        if (semester in $semesterData) {
            // return if semester data is already loaded
            return;
        }
        if (semester === "") {
            // return if semester list is not loaded yet
            return;
        }
        const res = await fetch(`${$base_url}data/${semester}.json`);
        if (!res.ok) {
            throw new Error(res.statusText);
        }
        const semesterCourses = await res.json();
        const tempselectedCourseNames = $selectedCourseNamesAll[semester] || [];
        // Remove the unlisted courses from selectedCourseNamesAll
        // This can happen when a user selectes a course, but then, the course is 
        // removed by university from the course list.
        const availableCourses = tempselectedCourseNames.filter((courseName) => {
            return Object.prototype.hasOwnProperty.call(semesterCourses,courseName);
        });
        selectedCourseNamesAll.setCourseList(availableCourses);
        $semesterData[semester] = semesterCourses;
    }

    $: {
        getSemesterData($currentSemester);
    }

    onMount(async () => {
        const res = await fetch(`${$base_url}data/semesters.json`);
        if (res.ok) {
            const semestersRaw = await res.json();
            semesters = semestersRaw.map((s) => s.replace("/", "-"));
            currentSemester.update(() => semesters[0]);
        } else {
            throw new Error(res.statusText);
        }
    });

    function saveSelectedCoursesBeforeUnload(e) {
        localStorage.setItem(
            "semesterSelCourses2",
            JSON.stringify($selectedCourseNamesAll)
        );
    }
</script>

<div class="relative">
    <select
        class="text-black dark:text-white bg-white dark:bg-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 p-1 pr-5 rounded-sm"
        bind:value={$currentSemester}
    >
        {#each semesters as semester}
            <option value={semester}>
                {semester}
            </option>
        {:else}
            <option value="">Loading</option>
        {/each}
    </select>
    <div class="ml-3 absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none text-gray-500 dark:text-gray-400">
        <IconSelector />
    </div>
    
</div>


<svelte:window on:beforeunload={saveSelectedCoursesBeforeUnload} />
