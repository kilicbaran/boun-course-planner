<script lang="ts">
  import {
    setSelectedDayHourFilter,
    setShowCoursesWithoutSchedule,
  } from "./globalState.svelte";
  import IconFilter from "./icons/IconFilter.svelte";
  import IconX from "./icons/IconX.svelte";

  let dialog: HTMLDialogElement;

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = Array.from({ length: 14 }, (_, i) => i + 9); // 9..22 inclusive

  let selectedDayHourFilter: boolean[][] = $state(initSelectedDayHourFilter());
  let showCoursesWithoutSchedule = $state(true);

  function initSelectedDayHourFilter(): boolean[][] {
    // selection state: rows = days, cols = hours
    return days.map(() => new Array(hours.length).fill(true));
  }

  function toggleSelectedDayHourFilter(dayIdx: number, hourIdx: number) {
    selectedDayHourFilter[dayIdx][hourIdx] =
      !selectedDayHourFilter[dayIdx][hourIdx];
  }

  function toggleDaySelectedDayHourFilter(dayIdx: number) {
    const allSelected = selectedDayHourFilter[dayIdx].every((val) => val);
    selectedDayHourFilter[dayIdx] = selectedDayHourFilter[dayIdx].map(
      () => !allSelected
    );
  }

  function toggleHourSelectedDayHourFilter(hourIdx: number) {
    const allSelected = selectedDayHourFilter.every((day) => day[hourIdx]);
    selectedDayHourFilter = selectedDayHourFilter.map((day) => {
      const newDay = [...day];
      newDay[hourIdx] = !allSelected;
      return newDay;
    });
  }

  function toggleAllSelectedDayHourFilter() {
    selectedDayHourFilter = selectedDayHourFilter.map((day) =>
      day.map(() => true)
    );
  }

  function toggleNoneSelectedDayHourFilter() {
    selectedDayHourFilter = selectedDayHourFilter.map((day) =>
      day.map(() => false)
    );
  }

  function saveFilters() {
    // Save to global state
    setShowCoursesWithoutSchedule($state.snapshot(showCoursesWithoutSchedule));
    setSelectedDayHourFilter($state.snapshot(selectedDayHourFilter));
    dialog.close();
  }
</script>

<div class="shrink-0">
  <button
    type="button"
    aria-label="Filter Courses"
    onclick={() => dialog.showModal()}
    class="ml-2 p-2 text-zinc-600 bg-white dark:text-zinc-300 dark:bg-zinc-800 cursor-pointer rounded-lg shadow"
  >
    <IconFilter />
  </button>
</div>

<dialog
  bind:this={dialog}
  class="rounded-lg p-4 max-w-lg m-auto backdrop:bg-black/50 bg-zinc-100 dark:bg-black shadow"
>
  <form method="dialog">
    <div class="flex justify-end">
      <button class="cursor-pointer ml-auto text-zinc-400 dark:text-zinc-300"
        ><IconX /></button
      >
    </div>
  </form>

  <div class="dark:text-white mt-2">
    <div class="overflow-auto">
      <div class="mb-2">
        <label for="show-courses-without-schedule" class="mr-3">
          <input
            id="show-courses-without-schedule"
            type="checkbox"
            checked={showCoursesWithoutSchedule}
            onchange={() => {
              showCoursesWithoutSchedule = !showCoursesWithoutSchedule;
            }}
            class="cursor-pointer"
          />
          Show courses without schedule
        </label>

        <label for="chk-all" class="mr-3">
          <input
            id="chk-all"
            type="checkbox"
            checked={true}
            onclick={(e) => {
              toggleAllSelectedDayHourFilter();
              e.preventDefault();
              return false;
            }}
            class="cursor-pointer"
          />
          Select all
        </label>

        <label for="chk-none">
          <input
            id="chk-none"
            type="checkbox"
            checked={false}
            onclick={(e) => {
              toggleNoneSelectedDayHourFilter();
              e.preventDefault();
              return false;
            }}
            class="cursor-pointer"
          />
          Unselect all
        </label>
      </div>

      <table
        class="w-full table-fixed text-sm lg:text-base rounded-lg bg-white dark:bg-gray-800 tracking-tight sm:tracking-normal"
      >
        <thead>
          <tr>
            <th class="text-left p-1"></th>
            {#each days as day, dIdx}
              <th
                class="p-1 text-center select-none cursor-pointer"
                onclick={() => toggleDaySelectedDayHourFilter(dIdx)}>{day}</th
              >
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each hours as h, hIdx}
            <tr class={hIdx % 2 == 0 ? "bg-gray-50 dark:bg-gray-700" : ""}>
              <td
                class="p-1 select-none cursor-pointer"
                onclick={() => toggleHourSelectedDayHourFilter(hIdx)}>{h}</td
              >
              {#each days as day, dIdx}
                <td class="p-1 text-center">
                  <input
                    id={`chk-${dIdx}-${h}`}
                    type="checkbox"
                    aria-label={`${day} ${h}`}
                    checked={selectedDayHourFilter[dIdx][hIdx]}
                    onchange={() => toggleSelectedDayHourFilter(dIdx, hIdx)}
                    class="cursor-pointer"
                  />
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>

      <button
        type="button"
        onclick={() => saveFilters()}
        class="mt-2 float-right cursor-pointer rounded-lg bg-white dark:bg-zinc-800 py-1 px-2"
      >
        Apply
      </button>
    </div>
  </div>
</dialog>
