<script>
  import Course from "./Course.svelte";
  import Footer from "./Footer.svelte";
  import IconSearch from "./IconSearch.svelte";
  import TimeSelection from "./TimeSelection.svelte";
  import {
    searchQuery,
    searchedCourseNames,
    selectedCourseNames,
    hoveredCourse,
    currentSemester,
    curSemesterData,
    curSemCategories,
    selectedTimes,
    conflictTolerance,
    showUnknownHours,
    minCredits,
    maxGrade,
  } from "./stores.js";

  let input;

  function blurOnEnter(e) {
    if (e.code === "Enter") {
      input.blur();
    }
  }

  // Filter courses by selected times
  $: filteredCourseNames = $searchQuery === "ALL"
    ? Object.keys($curSemesterData).filter(courseName => {
        const course = $curSemesterData[courseName];
        const hours = Array.isArray(course?.hours) ? course.hours : (course?.hours ? [course.hours] : []);
        if (!$showUnknownHours && hours.length === 0) return false;
        if (!course || !course.days || !course.hours) return true;
        // Min. Credits filter
        if ($minCredits > 0) {
          const cr = Number(course.credits);
          if ($minCredits === 3) {
            if (cr !== 3 && cr !== 4) return false;
          } else if (!cr || cr < $minCredits) {
            return false;
          }
        }
        // Max. Grade filter (only first digit)
        const match = courseName.match(/^\D*(\d)/);
        if (match) {
          const grade = Number(match[1]);
          if (grade > $maxGrade) return false;
        }
        let conflicts = 0;
        for (let i = 0; i < course.days.length; i++) {
          const key = `${getDayName(course.days[i])}-${formatHour(course.hours[i])}`;
          if (!$selectedTimes.has(key)) {
            conflicts++;
          }
        }
        return conflicts <= $conflictTolerance;
      })
    : $searchedCourseNames.filter(courseName => {
        const course = $curSemesterData[courseName];
        const hours = Array.isArray(course?.hours) ? course.hours : (course?.hours ? [course.hours] : []);
        if (!$showUnknownHours && hours.length === 0) return false;
        if (!course || !course.days || !course.hours) return true;
        // Min. Credits filter
        if ($minCredits > 0) {
          const cr = Number(course.credits);
          if ($minCredits === 3) {
            if (cr !== 3 && cr !== 4) return false;
          } else if (!cr || cr < $minCredits) {
            return false;
          }
        }
        // Max. Grade filter (only first digit)
        const match = courseName.match(/^\D*(\d)/);
        if (match) {
          const grade = Number(match[1]);
          if (grade > $maxGrade) return false;
        }
        let conflicts = 0;
        for (let i = 0; i < course.days.length; i++) {
          const key = `${getDayName(course.days[i])}-${formatHour(course.hours[i])}`;
          if (!$selectedTimes.has(key)) {
            conflicts++;
          }
        }
        return conflicts <= $conflictTolerance;
      });

  function getDayName(dayCode) {
    // Map your day codes to full names as needed
    if (dayCode === "M") return "Monday";
    if (dayCode === "T") return "Tuesday";
    if (dayCode === "W") return "Wednesday";
    if (dayCode === "Th") return "Thursday";
    if (dayCode === "F") return "Friday";
    if (dayCode === "St") return "Saturday";
    return dayCode;
  }

  function formatHour(hour) {
    // Convert hour to "09:00" etc.
    const h = typeof hour === "number" ? hour + 8 : parseInt(hour) + 8;
    return `${h.toString().padStart(2, "0")}:00`;
  }
</script>

<div class="grow-0 shrink-0 relative w-full shadow rounded-lg overflow-hidden">
  <div
    class="text-zinc-400 dark:text-zinc-300 absolute top-1/2 transform -translate-y-1/2 left-3"
  >
    <IconSearch />
  </div>

  <input
    bind:this={input}
    class="pl-10 py-1 px-2 w-full   dark:text-white dark:bg-zinc-800 placeholder-zinc-500 dark:placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500 antialiased"
    type="text"
    bind:value={$searchQuery}
    placeholder="Search courses"
    autocomplete="off"
    autocorrect="off"
    autocapitalize="none"
    spellcheck="false"
    on:keyup={blurOnEnter}
  />
</div>

{#if filteredCourseNames.length > 0}
  <div
    class="mt-4 md:overflow-y-auto overflow-x-hidden flex flex-col md:min-h-0  shrink shadow rounded-lg bg-white dark:bg-zinc-800 divide-y dark:divide-zinc-500"
    on:mouseleave={() => hoveredCourse.set("")}
  >
    {#each filteredCourseNames as courseName, i}
      <Course
        {courseName}
        course={$curSemesterData[courseName]}
        striped={i % 2 == 0}
        currentSemester={$currentSemester}
        selected={$selectedCourseNames.includes(courseName)}
      />
    {/each}
  </div>
{/if}

{#if $curSemCategories.length > 0 && $searchQuery == ""}
  <div class="mt-4">
    {#each $curSemCategories as category}
      <button
        class="rounded-full mr-2 mb-2 px-2.5 py-1 text-sm font-semibold bg-white dark:bg-zinc-800 dark:text-white"
        on:click={() => {
          $searchQuery = category;
        }}>{category}</button
      >
    {/each}
    <!-- Add ALL button here -->
    <button
      class="rounded-full mr-2 mb-2 px-2.5 py-1 text-sm font-semibold bg-white dark:bg-zinc-800 dark:text-white"
      on:click={() => {
        $searchQuery = "ALL";
      }}>ALL</button>
    <div class="mt-4 shadow-lg rounded-lg bg-white dark:bg-zinc-800 p-4">
      <h3 class="font-semibold mb-2 text-zinc-700 dark:text-zinc-200">Time Selection</h3>
      <TimeSelection />
    </div>
  </div>
{/if}

<!-- {#if $searchedCourseNames.length > 0}
    <div class="mt-2 grow shrink min-h-0 shadow rounded-lg bg-white divide-y overflow-hidden">
        <VirtualList items={$searchedCourseNames} let:item={courseName}>
            <Course
                courseName={courseName}
                course={$curSemesterData[courseName]}
                striped={2 % 2 == 0}
                currentSemester={$currentSemester}
                selected={$selectedCourseNames.includes(courseName)}
            />
        </VirtualList>
    </div>
{/if} -->

<div class="block md:hidden">
  <Footer />
</div>
