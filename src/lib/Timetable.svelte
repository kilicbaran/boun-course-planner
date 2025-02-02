<script>
    import {
        selectedCourseNames,
        currentSemester,
        hoveredCourse,
        curSemesterData,
    } from "./stores.js";

    // Loading and error states
    let isLoading = true;
    let error = null;

    // Validate semester data is properly loaded
    $: isDataValid = $currentSemester !== "" &&
        $curSemesterData !== undefined &&
        $curSemesterData !== null &&
        typeof $curSemesterData === 'object';

    // Only calculate table when data is valid
    $: calculateTable = isDataValid && !error;

    // Reset error state when semester changes
    $: if ($currentSemester) {
        error = null;
        isLoading = true;
        // Add small delay to ensure data is loaded
        setTimeout(() => {
            isLoading = false;
        }, 100);
    }

    // Safely access course data with validation
    function getCourseData(courseName, semesterData) {
        try {
            if (!semesterData || typeof semesterData !== 'object') {
                throw new Error('Invalid semester data');
            }
            
            const courseData = semesterData[courseName];
            if (!courseData) {
                throw new Error(`Course ${courseName} not found`);
            }

            if (!Array.isArray(courseData.days) || !Array.isArray(courseData.hours)) {
                throw new Error(`Invalid course data format for ${courseName}`);
            }

            return courseData;
        } catch (e) {
            error = e.message;
            return null;
        }
    }

    $: courseOnSaturday = getCourseOnSaturday(
        calculateTable,
        $selectedCourseNames,
        $curSemesterData,
        $hoveredCourse
    );

    $: tableItems = getTableItems(
        calculateTable,
        $selectedCourseNames,
        $hoveredCourse,
        $curSemesterData
    );

    function getCourseOnSaturday(
        calculateTable,
        selectedCourseNames,
        curSemesterData,
        hoveredCourse
    ) {
        if (!calculateTable || !curSemesterData) {
            return false;
        }

        try {
            // Check selected courses
            for (const courseName of selectedCourseNames) {
                const courseData = getCourseData(courseName, curSemesterData);
                if (courseData && courseData.days.includes("St")) {
                    return true;
                }
            }

            // Check hovered course
            if (hoveredCourse !== "") {
                const hoveredData = getCourseData(hoveredCourse, curSemesterData);
                if (hoveredData && hoveredData.days.includes("St")) {
                    return true;
                }
            }

            return false;
        } catch (e) {
            error = e.message;
            return false;
        }
    }

    function getTableItems(
        calculateTable,
        selectedCourseNames,
        hoveredCourse,
        curSemesterData
    ) {
        try {
            let table = [];
            let latestCourseHour = 16;

            // Initialize empty table
            for (let i = 9; i < 23; i++) {
                table.push({
                    hour: i,
                    M: [],
                    T: [],
                    W: [],
                    Th: [],
                    F: [],
                    St: [],
                });
            }

            if (calculateTable && curSemesterData) {
                // Process selected courses
                for (const courseName of selectedCourseNames) {
                    const courseData = getCourseData(courseName, curSemesterData);
                    if (!courseData) continue;

                    const { hours, days } = courseData;
                    for (let j = 0; j < days.length; j++) {
                        const hour = Number(hours[j]);
                        if (isNaN(hour) || hour < 1 || hour > 14) {
                            throw new Error(`Invalid hour value for course ${courseName}`);
                        }

                        latestCourseHour = Math.max(latestCourseHour, hour + 8);
                        table[hour - 1][days[j]].push(courseName);
                    }
                }

                // Process hovered course
                if (hoveredCourse !== "" && !selectedCourseNames.includes(hoveredCourse)) {
                    const hoveredData = getCourseData(hoveredCourse, curSemesterData);
                    if (hoveredData) {
                        const { hours, days } = hoveredData;
                        for (let j = 0; j < days.length; j++) {
                            const hour = Number(hours[j]);
                            if (isNaN(hour) || hour < 1 || hour > 14) {
                                throw new Error(`Invalid hour value for course ${hoveredCourse}`);
                            }

                            latestCourseHour = Math.max(latestCourseHour, hour + 8);
                            table[hour - 1][days[j]].push(hoveredCourse);
                        }
                    }
                }
            }

            // Trim table to latest course hour
            for (let i = latestCourseHour + 1; i < 23; i++) {
                table.pop();
            }

            return table;
        } catch (e) {
            error = e.message;
            // Return minimal table on error
            return [{
                hour: 9,
                M: [],
                T: [],
                W: [],
                Th: [],
                F: [],
                St: [],
            }];
        }
    }
</script>

<div
    class="bg-white dark:bg-gray-800 dark:text-white shadow rounded-lg w-full shrink-0  overflow-x-auto"
>
    <table
        class="table-fixed text-center w-full text-sm lg:text-base antialiased tracking-tight sm:tracking-normal"
    >
        <thead>
            <tr>
                <th class="w-4 md:w-6" />
                <th class="w-20"> Mon </th>
                <th class="w-20"> Tue </th>
                <th class="w-20"> Wed </th>
                <th class="w-20"> Thu </th>
                <th class="w-20"> Fri </th>
                <th class="w-20 {courseOnSaturday ? '' : 'hidden'}"> Sat </th>
            </tr>
        </thead>
        <tbody>
            {#each tableItems as row, i}
                <tr
                    class={i % 2 == 0
                        ? "bg-gray-50 dark:bg-gray-700"
                        : ""}
                >
                    <th class="md:p-1"> {row["hour"]} </th>
                    <td
                        class={row["M"].length > 1
                            ? "bg-red-100 dark:bg-red-900"
                            : ""}
                        >{#each row["M"] as course}<div
                                class="leading-tight p-px {course ==
                                $hoveredCourse
                                    ? 'bg-green-200 text-green-700 dark:bg-green-800 dark:text-green-300 rounded'
                                    : ''}"
                            >
                                {course}
                            </div>{/each}</td
                    >
                    <td
                        class={row["T"].length > 1
                            ? "bg-red-100 dark:bg-red-900"
                            : ""}
                        >{#each row["T"] as course}<div
                                class="leading-tight p-px {course ==
                                $hoveredCourse
                                    ? 'bg-green-200 text-green-700 dark:bg-green-800 dark:text-green-300 rounded'
                                    : ''}"
                            >
                                {course}
                            </div>{/each}</td
                    >
                    <td
                        class={row["W"].length > 1
                            ? "bg-red-100 dark:bg-red-900"
                            : ""}
                        >{#each row["W"] as course}<div
                                class="leading-tight p-px {course ==
                                $hoveredCourse
                                    ? 'bg-green-200 text-green-700 dark:bg-green-800 dark:text-green-300 rounded'
                                    : ''}"
                            >
                                {course}
                            </div>{/each}</td
                    >
                    <td
                        class={row["Th"].length > 1
                            ? "bg-red-100 dark:bg-red-900"
                            : ""}
                        >{#each row["Th"] as course}<div
                                class="leading-tight p-px {course ==
                                $hoveredCourse
                                    ? 'bg-green-200 text-green-700 dark:bg-green-800 dark:text-green-300 rounded'
                                    : ''}"
                            >
                                {course}
                            </div>{/each}</td
                    >
                    <td
                        class={row["F"].length > 1
                            ? "bg-red-100 dark:bg-red-900"
                            : ""}
                        >{#each row["F"] as course}<div
                                class="leading-tight p-px {course ==
                                $hoveredCourse
                                    ? 'bg-green-200 text-green-700 dark:bg-green-800 dark:text-green-300 rounded'
                                    : ''}"
                            >
                                {course}
                            </div>{/each}</td
                    >
                    <td
                        class="{courseOnSaturday ? '' : 'hidden'} {row['St']
                            .length > 1
                            ? 'bg-red-100 dark:bg-red-900'
                            : ''}"
                        >{#each row["St"] as course}<div
                                class="leading-tight p-px {course ==
                                $hoveredCourse
                                    ? 'bg-green-200 text-green-700 dark:bg-green-800 dark:text-green-300 rounded'
                                    : ''}"
                            >
                                {course}
                            </div>{/each}</td
                    >
                </tr>
            {/each}
        </tbody>
    </table>
    
    {#if isLoading}
        <div class="p-4 text-center text-gray-600 dark:text-gray-400">
            Loading timetable...
        </div>
    {:else if error}
        <div class="p-4 text-center text-red-600 dark:text-red-400">
            Error: {error}
        </div>
    {/if}
</div>
