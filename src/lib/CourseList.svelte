<script>
    import {
        selectedCourseNamesAll,
        selectedCourseNames,
        curSemesterData,
        hoveredCourse,
    } from "./stores.js";
    import IconX from "./IconX.svelte";
    import Footer from "./Footer.svelte";

    $: courseCount = getCourseCount($selectedCourseNames);
    $: totalCredit = getTotalCredit($selectedCourseNames, $curSemesterData);

    function getTotalCredit(selectedCourseNames, curSemesterData) {
        if (!curSemesterData) {
            return 0;
        }
        return selectedCourseNames
            .filter((c) => !/(LAB|P.S.)/.test(c))
            .map((c) => {
                if (!curSemesterData) {
                    return 0;
                }
                if (!Object.prototype.hasOwnProperty.call(curSemesterData,c)) {
                    return 0;
                }
                if (!Object.prototype.hasOwnProperty.call(curSemesterData[c],"credits")) {
                    return 0;
                }
                return Number(curSemesterData[c].credits);
            })
            .reduce((a, b) => a + b, 0);
    }

    function getCourseCount(selectedCourseNames) {
        return selectedCourseNames.filter((c) => !/(LAB|P.S.)/.test(c)).length;
    }
</script>

<div
    class="mt-4 shadow bg-white dark:bg-zinc-800 dark:text-white divide-y dark:divide-zinc-500 rounded-lg overflow-hidden shrink-0"
    on:mouseleave={() => hoveredCourse.set("")}
>
    <div class="py-2 px-4 bg-zinc-50 dark:bg-zinc-700 flex items-center">
        <span class="font-medium">Courses</span>
        <span
            class="ml-2 text-xs bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 border-opacity-50 rounded-full px-1"
            >{courseCount}</span
        >
    </div>
    <div class="divide-y dark:divide-zinc-500" on:mouseleave={() => hoveredCourse.set("")}>
        {#if $curSemesterData && $selectedCourseNames && $selectedCourseNames.length > 0}
            {#each $selectedCourseNames as courseName}
                <div
                    class="py-1 px-2 flex items-center"
                    on:mouseenter={() => hoveredCourse.set(courseName)}
                >
                    <span
                        class="cursor-pointer text-zinc-600 dark:text-zinc-400"
                        on:click={() =>
                            {selectedCourseNamesAll.delCourse(courseName);hoveredCourse.reset()}}
                    >
                        <IconX />
                    </span><span class="ml-1">{courseName}</span>
                    {#if "credits" in $curSemesterData[courseName]}
                        <span
                            class="ml-2 text-xs border rounded-full px-1 bg-green-50 text-green-700 border-green-700 dark:bg-green-900 dark:text-green-300 dark:border-green-300 border-opacity-50"
                            >{$curSemesterData[courseName].credits} Cr</span
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
    <div class="py-2 px-4  bg-zinc-50 dark:bg-zinc-700 text-green-700 dark:text-green-300 font-medium">
        Total Credits: {totalCredit}
    </div>
</div>

<div class="hidden md:block">
    <Footer />
</div>
