<script>
    import IconPlus from "./IconPlus.svelte";
    import IconMinus from "./IconMinus.svelte";
    import IconDocument from "./IconDocument.svelte";
    import {
        selectedCourseNamesAll,
        selectedCourseNames,
        hoveredCourse,
        curSemesterData,
    } from "./stores.js";
    export let course;
    export let courseName;
    export let striped;
    export let currentSemester;
    export let selected;

    let syllabusLink = getSyllabusLink();
    $: conflicts = calcConflict(
        courseName,
        $selectedCourseNames,
        $curSemesterData
    );

    function getSyllabusLink() {
        const [code, section] = course.code.split(".");
        const term = currentSemester.replace("-", "%2F");
        return `https://registration.boun.edu.tr/scripts/schedule/coursedescription.asp?course=${code}&section=${section}&term=${term}`;
    }

    function calcConflict(course, selectedCourseNames, curSemesterData) {
        const { hours, days } = curSemesterData[course];
        let conflicts = [];
        for (let i = 0; i < selectedCourseNames.length; i++) {
            let conflictCount = 0;
            const otherCourse = selectedCourseNames[i];
            if (otherCourse != course) {
                const { hours: hours2, days: days2 } =
                    curSemesterData[otherCourse];
                if (hours && hours2) {
                    for (let j = 0; j < hours2.length; j++) {
                        for (let k = 0; k < hours.length; k++) {
                            if (hours2[j] == hours[k] && days2[j] == days[k]) {
                                conflictCount++;
                            }
                        }
                    }
                }
                if (conflictCount > 0) {
                    conflicts.push({
                        title: otherCourse,
                        count: conflictCount,
                    });
                }
            }
        }
        conflicts = conflicts;
        return conflicts;
    }
</script>

<div
    class="py-2 px-4 flex flex-row dark:text-white {striped
        ? 'bg-coolGray-50 dark:bg-coolGray-700'
        : 'bg-white dark:bg-gray-800'}"
    on:mouseenter={() => hoveredCourse.set(courseName)}
>
    <div
        class="flex-grow {conflicts.length > 0
            ? 'text-gray-400 dark:text-gray-500'
            : ''}"
    >
        <div class="flex items-center flex-wrap">
            <span class="text-lg font-medium mr-3">
                {courseName}
            </span>
            <span class="text-sm break-all">{course.name}</span>
            <span class="ml-auto mr-2">
                {#if conflicts.length > 0}
                    <span class="text-red-500 text-xs font-medium p-1"
                        >Conflict</span
                    >
                {/if}
                <span
                    class="text-xs {conflicts.length > 0
                        ? 'text-gray-400 dark:text-gray-500'
                        : 'text-gray-500 dark:text-gray-400'}"
                >
                    {#if "credits" in course}
                        <span class="mr-2">{course.credits} Cr</span>
                    {/if}
                    {#if "ects" in course}
                        <span>{course.ects} ECTS</span>
                    {/if}
                </span>
                
            </span>
        </div>
        <div>
            <span class="mr-2">{course.instructor}</span>
            {#if "days" in course}
                <!-- <span class="mr-2">Days: {course.days.join("")}</span> -->
                <span class="mr-2">📅 {course.days.join("")}</span>
            {/if}
            {#if "hours" in course}
                <!-- <span class="mr-2">Hours: {course.hours.join("")}</span> -->
                <span class="mr-2">⏱️ {course.hours.join("")}</span>
            {/if}
            {#if "rooms" in course}
                <!-- <span class="">Rooms: {course.rooms.join(" ")}</span> -->
                <span class="">🏠 {course.rooms.join(" ")}</span>
            {/if}
        </div>
        {#if "requiredForDept" in course}
            <div
                class="text-sm {conflicts.length > 0
                    ? 'text-gray-400 dark:text-gray-500'
                    : 'text-gray-500'}"
            >
                Required for department: {course.requiredForDept.join(", ")}
            </div>
        {/if}
        {#if "dept" in course}
            <div
                class="text-sm {conflicts.length > 0
                    ? 'text-gray-400 dark:text-gray-500'
                    : 'text-gray-500'}"
            >
                Departments: {course.dept.join(", ")}
            </div>
        {/if}
    </div>
    <div class="flex flex-col items-end flex-shrink-0">
        <div class="flex flex-col-reverse sm:flex-row ">
            <a
                href={syllabusLink}
                target="_blank"
                rel="noopener noreferrer"
                class="block mr-0 mt-2 sm:mr-2 sm:mt-0 bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-800 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-400 dark:hover:text-blue-200  p-2 text-center"
            >
                <IconDocument />
            </a>
            {#if selected}
                <button
                    type="button"
                    class="bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-400 dark:hover:text-red-200 p-2 text-center"
                    on:click={() =>
                        selectedCourseNamesAll.delCourse(courseName)}
                >
                    <IconMinus />
                </button>
            {:else}
                <button
                    type="button"
                    class="bg-green-100 hover:bg-green-200 text-green-600 hover:text-green-800 dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-400 dark:hover:text-green-200 p-2 text-center"
                    on:click={() =>
                        selectedCourseNamesAll.addCourse(courseName)}
                >
                    <IconPlus />
                </button>
            {/if}
        </div>
    </div>
</div>
