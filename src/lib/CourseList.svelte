<script lang="ts">
  import {
    getSelectedCourseNames,
    getCurSemesterData,
    setHoveredCourse,
    delCourse,
    resetHoveredCourse,
  } from "./globalState.svelte";
  import IconX from "./icons/IconX.svelte";
  import Footer from "./Footer.svelte";
  import CalendarExport from "./CalendarExport.svelte";

  const courseCount = $derived(
    getSelectedCourseNames().filter(
      (courseName: string) => !/(LAB|P.S.)/.test(courseName)
    ).length
  );

  const totalCredit = $derived.by(() => {
    if (!getCurSemesterData()) {
      return 0;
    }
    return getSelectedCourseNames()
      .filter((c) => !/(LAB|P.S.)/.test(c))
      .map((c) => {
        if (!getCurSemesterData()) {
          return 0;
        }
        if (!Object.prototype.hasOwnProperty.call(getCurSemesterData(), c)) {
          return 0;
        }
        if (
          !Object.prototype.hasOwnProperty.call(
            getCurSemesterData()[c],
            "credits"
          )
        ) {
          return 0;
        }
        return Number(getCurSemesterData()[c].credits);
      })
      .reduce((a, b) => a + b, 0);
  });
</script>

<div
  class="mt-4 shadow bg-white dark:bg-zinc-800 dark:text-white divide-y divide-gray-200 dark:divide-zinc-500 rounded-lg overflow-hidden shrink-0"
  onmouseleave={() => setHoveredCourse("")}
  role="region"
>
  <div class="py-2 px-4 bg-zinc-50 dark:bg-zinc-700 flex items-center">
    <span class="font-medium">Courses</span>
    <span
      class="ml-2 text-xs bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border border-blue-600/50 dark:border-blue-400/50 rounded-full px-1"
      >{courseCount}</span
    >
  </div>
  <div
    class="divide-y divide-gray-200 dark:divide-zinc-500"
    onmouseleave={() => setHoveredCourse("")}
    role="list"
  >
    {#if getCurSemesterData() && getSelectedCourseNames() && getSelectedCourseNames().length > 0}
      {#each getSelectedCourseNames() as courseName}
        <div
          class="py-1 px-2 flex items-center"
          onmouseenter={() => setHoveredCourse(courseName)}
          role="listitem"
        >
          <button
            type="button"
            class="cursor-pointer text-zinc-600 dark:text-zinc-400"
            onclick={() => {
              delCourse(courseName);
              resetHoveredCourse();
            }}
          >
            <IconX />
          </button><span class="ml-1">{courseName}</span>
          {#if "credits" in getCurSemesterData()[courseName]}
            <span
              class="ml-2 text-xs border rounded-full px-1 bg-green-50 text-green-700 border-green-700/50 dark:bg-green-900 dark:text-green-300 dark:border-green-300/50"
              >{getCurSemesterData()[courseName].credits} Cr</span
            >
          {/if}
        </div>
      {/each}
    {:else}
      <div
        class="text-zinc-500 text-sm h-8 flex flex-col justify-center items-center"
      >
        You have no selected course
      </div>
    {/if}
  </div>
  <div
    class="py-2 px-4 bg-zinc-50 dark:bg-zinc-700 text-green-700 dark:text-green-300 font-medium"
  >
    Total Credits: {totalCredit}
  </div>
  <div class="py-2 px-4 bg-zinc-50 dark:bg-zinc-700">
    <CalendarExport />
  </div>
</div>

<div class="hidden md:block">
  <Footer />
</div>
