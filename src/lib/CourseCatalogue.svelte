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
    getIsDayHourFilterApplied,
  } from "./globalState.svelte";
  import { setHoveredCourse, setSearchQuery } from "./globalState.svelte";
  import { onMount } from "svelte";
  import CourseFilters from "./CourseFilters.svelte";

  let input: HTMLInputElement;
  let courseCatalogue: HTMLDivElement | null = $state(null);

  function blurOnEnter(e: KeyboardEvent) {
    if (e.code === "Enter") {
      input.blur();
    }
  }

  function searchFormSubmit(e: Event) {
    e.preventDefault();
    input.blur();
  }

  const pageSize = 20;
  let page = $state(1);
  let isLoading = $state(false);
  const hasMorePages = $derived(
    getSearchedCourseNames().length > page * pageSize
  );

  let isLargeScreen = $state(false);
  let isExpanded = $state(true);

  function loadMore() {
    if (isLoading || !hasMorePages) return;

    isLoading = true;
    page += 1;
    isLoading = false;
  }

  function infiniteScroll(node: HTMLElement, rootEl: HTMLElement | null) {
    const createObserver = (root: HTMLElement | null) => {
      return new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !isLoading && hasMorePages) {
            loadMore();
          }
        },
        {
          root: root,
          // Trigger when the element is 300px from the bottom of the viewport
          rootMargin: "0px 0px 300px 0px",
        }
      );
    };

    let observer = createObserver(rootEl);
    observer.observe(node);

    return {
      // This function runs whenever the `rootEl` parameter changes
      update(newRootEl: HTMLElement | null) {
        observer.disconnect();
        observer = createObserver(newRootEl);
        observer.observe(node);
      },
      destroy() {
        observer.disconnect();
      },
    };
  }

  onMount(() => {
    // Corresponds to Tailwind's `md` breakpoint
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    // Handler to update the state
    const handleResize = (e: MediaQueryListEvent) => {
      isLargeScreen = e.matches;
    };

    // Set the initial value
    isLargeScreen = mediaQuery.matches;

    // Listen for changes
    mediaQuery.addEventListener("change", handleResize);

    // Cleanup on component destroy
    return () => {
      mediaQuery.removeEventListener("change", handleResize);
    };
  });
</script>

<div class="grow-0 shrink-0 w-full flex items-center">
  <div class="relative shadow rounded-lg overflow-hidden grow">
    <div
      class="text-zinc-400 dark:text-zinc-300 absolute top-1/2 transform -translate-y-1/2 left-3"
    >
      <IconSearch />
    </div>

    <form onsubmit={searchFormSubmit}>
      <input
        bind:this={input}
        class="pl-10 py-1 px-2 w-full bg-white dark:text-white dark:bg-zinc-800 placeholder-zinc-500 dark:placeholder-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 antialiased"
        type="text"
        value={getSearchQuery()}
        oninput={(e) => {
          setSearchQuery((e.currentTarget as HTMLInputElement).value ?? "");
          page = 1;
        }}
        placeholder="Search courses"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="none"
        spellcheck="false"
        enterkeyhint="search"
        onkeyup={blurOnEnter}
      />
    </form>
  </div>

  <CourseFilters />
</div>

{#if getCurSemCategories().length > 0 && getSearchQuery() == "" && getIsDayHourFilterApplied() == false}
  <div class="mt-4 relative">
    <div
      class={{
        "h-[32px] overflow-hidden": !isExpanded,
        "pb-7": isExpanded,
        'transition-all duration-200"': true,
      }}
    >
      {#each getCurSemCategories() as category}
        <button
          class="rounded-full mr-2 mb-2 px-2.5 py-1 text-sm font-semibold bg-white dark:bg-zinc-800 dark:text-white"
          onclick={() => {
            setSearchQuery(category);
          }}>{category}</button
        >
      {/each}
    </div>
    {#if getCurSemCategories().length > 5}
      <button
        class={{
          "absolute left-1/2 -translate-x-1/2 rounded-full shadow px-2.5 py-1 bg-white dark:bg-zinc-800 dark:text-white": true,
          "translate-y-1/2 bottom-4": isExpanded,
          "bottom-0": !isExpanded,
        }}
        onclick={() => (isExpanded = !isExpanded)}
      >
        {isExpanded ? "Show less ▲" : "Show more ▼"}
      </button>
    {/if}
  </div>
{/if}

<div
  class="mt-4 md:overflow-y-auto overflow-x-hidden flex flex-col md:min-h-0 shrink shadow rounded-lg bg-white dark:bg-zinc-800 divide-y divide-gray-200 dark:divide-zinc-500"
  onmouseleave={() => setHoveredCourse("")}
  role="list"
  bind:this={courseCatalogue}
>
  {#each getSearchedCourseNames().slice(0, pageSize * page) as courseName, i}
    <Course
      {courseName}
      course={getCurSemesterData()[courseName]}
      striped={i % 2 == 0}
      currentSemester={getCurrentSemester()}
      selected={getSelectedCourseNames().includes(courseName)}
    />
  {/each}

  {#if hasMorePages}
    <div use:infiniteScroll={isLargeScreen ? courseCatalogue : null}>
      {#if isLoading}
        <p>Loading...</p>
      {/if}
    </div>
  {/if}
</div>

<div class="block md:hidden">
  <Footer />
</div>
