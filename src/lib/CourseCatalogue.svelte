<script lang="ts">
  import Course from "./Course.svelte";
  import Footer from "./Footer.svelte";
  import IconSearch from "./icons/IconSearch.svelte";
  import {
    getSearchedCourseNames,
    getSelectedCourseNames,
    getCurSemesterData,
    getCurSemCategories,
    getSearchQuery,
    getCurrentSemester,
  } from "./globalState.svelte";
  import { setHoveredCourse, setSearchQuery } from "./globalState.svelte";

  let input: HTMLInputElement;

  function blurOnEnter(e: KeyboardEvent) {
    if (e.code === "Enter") {
      input.blur();
    }
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
    class="pl-10 py-1 px-2 w-full bg-white dark:text-white dark:bg-zinc-800 placeholder-zinc-500 dark:placeholder-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 antialiased"
    type="text"
    value={getSearchQuery()}
    oninput={(e) =>
      setSearchQuery((e.currentTarget as HTMLInputElement).value ?? "")}
    placeholder="Search courses"
    autocomplete="off"
    autocorrect="off"
    autocapitalize="none"
    spellcheck="false"
    onkeyup={blurOnEnter}
  />
</div>

{#if getSearchedCourseNames().length > 0}
  <div
    class="mt-4 md:overflow-y-auto overflow-x-hidden flex flex-col md:min-h-0 shrink shadow rounded-lg bg-white dark:bg-zinc-800 divide-y divide-gray-200 dark:divide-zinc-500"
    onmouseleave={() => setHoveredCourse("")}
    role="list"
  >
    {#each getSearchedCourseNames() as courseName, i}
      <Course
        {courseName}
        course={getCurSemesterData()[courseName]}
        striped={i % 2 == 0}
        currentSemester={getCurrentSemester()}
        selected={getSelectedCourseNames().includes(courseName)}
      />
    {/each}
  </div>
{/if}

{#if getCurSemCategories().length > 0 && getSearchQuery() == ""}
  <div class="mt-4">
    {#each getCurSemCategories() as category}
      <button
        class="rounded-full mr-2 mb-2 px-2.5 py-1 text-sm font-semibold bg-white dark:bg-zinc-800 dark:text-white"
        onclick={() => {
          setSearchQuery(category);
        }}>{category}</button
      >
    {/each}
  </div>
{/if}

<div class="block md:hidden">
  <Footer />
</div>
