<script>
    import Course from "./Course.svelte";
    import Footer from "./Footer.svelte";
    import IconSearch from "./IconSearch.svelte";
    import {
        searchQuery,
        searchedCourseNames,
        selectedCourseNames,
        hoveredCourse,
        currentSemester,
        curSemesterData,
    } from "./stores.js";

    // import VirtualList from '@sveltejs/svelte-virtual-list';

    let input;

    function blurOnEnter(e) {
        if(e.code === "Enter"){
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
        bind:this="{input}"
        class="pl-10 py-1 px-2 w-full   dark:text-white dark:bg-zinc-800 placeholder-zinc-500 dark:placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500 antialiased"
        type="text"
        bind:value={$searchQuery}
        placeholder="Search courses"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="none"
        spellcheck="false"
        on:keyup="{blurOnEnter}"
    />
</div>

{#if $searchedCourseNames.length > 0}
    <div
        class="mt-2 md:overflow-y-auto overflow-x-hidden flex flex-col md:min-h-0  shrink shadow rounded-lg bg-white dark:bg-zinc-800 divide-y dark:divide-zinc-500"
        on:mouseleave={() => hoveredCourse.set("")}
    >
        {#each $searchedCourseNames as courseName, i}
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
