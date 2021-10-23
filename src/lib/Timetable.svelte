<script>
    import {
        selectedCourseNames,
        currentSemester,
        hoveredCourse,
        curSemesterData,
    } from "./stores.js";

    $: calculateTable =
        $currentSemester != "" &&
        $curSemesterData !== undefined &&
        $curSemesterData !== null;

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
        if (!calculateTable) {
            return false;
        }

        for (let i = 0; i < selectedCourseNames.length; i++) {
            const courseName = selectedCourseNames[i];
            if (courseName in curSemesterData) {
                const days = curSemesterData[courseName].days;
                if (days) {
                    for (let j = 0; j < days.length; j++) {
                        if (days[j] == "St") {
                            return true;
                        }
                    }
                }
            }
        }
        if (hoveredCourse != "") {
            const days = curSemesterData[hoveredCourse].days;
            if (days) {
                for (let j = 0; j < days.length; j++) {
                    if (days[j] == "St") {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function getTableItems(
        calculateTable,
        selectedCourseNames,
        hoveredCourse,
        curSemesterData
    ) {
        let table = [];
        let latestCourseHour;
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
        latestCourseHour = 16;
        if (calculateTable) {
            for (let i = 0; i < selectedCourseNames.length; i++) {
                const courseName = selectedCourseNames[i];
                if(!(courseName in curSemesterData)){
                    continue;
                }
                const { hours, days } = curSemesterData[courseName];
                if (days) {
                    for (let j = 0; j < days.length; j++) {
                        latestCourseHour = Math.max(
                            latestCourseHour,
                            hours[j] + 8
                        );
                        table[Number(hours[j]) - 1][days[j]].push(courseName);
                    }
                }
            }
            if (
                hoveredCourse != "" &&
                !selectedCourseNames.includes(hoveredCourse)
            ) {
                const { hours, days } = curSemesterData[hoveredCourse];
                if (days) {
                    for (let j = 0; j < days.length; j++) {
                        latestCourseHour = Math.max(
                            latestCourseHour,
                            hours[j] + 8
                        );
                        table[Number(hours[j]) - 1][days[j]].push(
                            hoveredCourse
                        );
                    }
                }
            }
        }

        for (let i = latestCourseHour + 1; i < 23; i++) {
            table.pop();
        }
        return table;
    }
</script>

<div
    class="bg-white dark:bg-gray-800 dark:text-white shadow rounded-lg w-full flex-shrink-0  overflow-x-auto"
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
                        ? "bg-coolGray-50 dark:bg-coolGray-700"
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
</div>
