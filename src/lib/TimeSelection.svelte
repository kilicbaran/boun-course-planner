<script>
  import { onMount } from "svelte";
  import { selectedTimes, initializeSelectedTimes, conflictTolerance, selectedCourseNames, curSemesterData, showUnknownHours, minCredits, maxGrade } from "./stores.js";
  import { writable } from "svelte/store";

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const hours = Array.from({ length: 11 }, (_, i) => `${(i + 9).toString().padStart(2, "0")}:00`);

  function getDayName(dayCode) {
    if (dayCode === "M") return "Monday";
    if (dayCode === "T") return "Tuesday";
    if (dayCode === "W") return "Wednesday";
    if (dayCode === "Th") return "Thursday";
    if (dayCode === "F") return "Friday";
    if (dayCode === "St") return "Saturday";
    return dayCode;
  }

  function formatHour(hour) {
    // If hour is already in "09:00" format, return as is
    if (typeof hour === "string" && hour.includes(":")) return hour;
    // Otherwise, convert to "09:00"
    const h = typeof hour === "number" ? hour + 8 : parseInt(hour) + 8;
    return `${h.toString().padStart(2, "0")}:00`;
  }

  onMount(() => {
    const storedTimes = sessionStorage.getItem("selectedTimes");
    const parsedTimes = storedTimes ? JSON.parse(storedTimes) : null;
    if (parsedTimes && parsedTimes.length > 0) {
      selectedTimes.set(new Set(parsedTimes));
    } else {
      initializeSelectedTimes(days, hours); // This checks all by default
    }

    const stored = sessionStorage.getItem("conflictTolerance");
    if (stored !== null) {
      conflictTolerance.set(Number(stored));
    }

    const storedMinCredits = sessionStorage.getItem("minCredits");
    if (storedMinCredits !== null) {
      minCredits.set(Number(storedMinCredits));
    }

    const storedMaxGrade = sessionStorage.getItem("maxGrade");
    if (storedMaxGrade !== null) {
      maxGrade.set(Number(storedMaxGrade));
    }
  });

  // Save selectedTimes to sessionStorage whenever it changes
  $: sessionStorage.setItem("selectedTimes", JSON.stringify(Array.from($selectedTimes)));
  $: sessionStorage.setItem("conflictTolerance", $conflictTolerance);
  $: sessionStorage.setItem("minCredits", $minCredits);
  $: sessionStorage.setItem("maxGrade", $maxGrade);

  function toggleTime(day, hour, checked) {
    selectedTimes.update(times => {
      const key = `${day}-${hour}`;
      if (checked) {
        times.add(key);
      } else {
        times.delete(key);
      }
      return times;
    });
  }

  function excludeFullHours() {
    let occupied = new Set();
    for (const courseName of $selectedCourseNames) {
      const course = $curSemesterData[courseName];
      if (!course || !course.days || !course.hours) continue;
      for (let i = 0; i < course.days.length; i++) {
        const key = `${getDayName(course.days[i])}-${formatHour(course.hours[i])}`;
        occupied.add(key);
      }
    }
    selectedTimes.update(times => {
      for (const key of occupied) {
        times.delete(key);
      }
      return times;
    });
  }

  function deactivateRow(hour) {
    const allUnchecked = days.every(day => !$selectedTimes.has(`${day}-${hour}`));
    selectedTimes.update(times => {
      for (const day of days) {
        if (allUnchecked) {
          times.add(`${day}-${hour}`); // Reactivate all if all are unchecked
        } else {
          times.delete(`${day}-${hour}`); // Deactivate all if any are checked
        }
      }
      return times;
    });
  }

  function deactivateColumn(day) {
    const allUnchecked = hours.every(hour => !$selectedTimes.has(`${day}-${hour}`));
    selectedTimes.update(times => {
      for (const hour of hours) {
        if (allUnchecked) {
          times.add(`${day}-${hour}`); // Reactivate all if all are unchecked
        } else {
          times.delete(`${day}-${hour}`); // Deactivate all if any are checked
        }
      }
      return times;
    });
  }
</script>

<style>
  body, :global(body) {
    background: #18181b; /* Tailwind zinc-900 */
  }
  .planner-flex {
    display: flex;
    align-items: flex-start;
    gap: 2rem;
    flex-wrap: wrap;
    width: 100%;
  }
  table {
    border-collapse: collapse;
    width: 60%;
    min-width: 320px;
    max-width: 700px;
    font-size: 0.95em;
    background: #18181b;
    color: #e5e7eb;
  }
  th, td {
    border: 0.3px solid #3f3f46; /* Tailwind zinc-700 */
    padding: 0;
    text-align: center;
    min-width: 40px;
    height: 36px;
    color: #e5e7eb; /* zinc-200 */
    background: #18181b;
  }
  th {
    background: #27272a; /* Tailwind zinc-800 */
    font-weight: bold;
    color: #fafafa;      /* zinc-50 */
  }
  tbody tr:nth-child(even) {
    background: #232326; /* slightly lighter for even rows */
  }
  td:first-child {
    background: #27272a;
    font-weight: bold;
    text-align: center;
    vertical-align: middle;
    color: #fafafa;
  }
  .checkbox-cell {
    padding: 0;
    position: relative;
    min-width: 40px;
    height: 36px;
  }
  .checkbox-label {
    display: block;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
  .full-checkbox {
    display: none;
  }
  .checkbox-bg {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 36px;
    background: #27272a;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
    font-size: 1.3em;
    color: #22c55e; /* green-500 */
    border-radius: 0;
    border: 1px solid #3f3f46; /* zinc-700 */
    user-select: none;
  }
  .full-checkbox:checked + .checkbox-bg {
    background: #14532D; /* green-900 */
    color: #fff;
  }
  .checkbox-label:hover .checkbox-bg {
    background: #14532D; /* green-900 */
    color: #22c55e; /* green-500 */
  }
  .corner-signature {
    color: #343438; /* Tailwind zinc-500 */
    font-size: 0.95em;
    font-family: monospace;
    letter-spacing: 1px;
    user-select: none;
  }
  .conflict-tolerance-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;      /* Center horizontally */
    margin-left: auto;            /* Push to the right */
    margin-right: auto;           /* Center in leftover space */
    color: #e5e7eb;
    background: #18181b;
    padding: 0.3rem 0.7rem;
    border-radius: 6px;
    border: 1px solid #3f3f46;
    min-width: unset;
    max-width: unset;
    font-size: 0.85em;
    height: 2.8em;
    gap: 1em;
  }
  .conflict-tolerance-label {
    font-weight: bold;
    margin-bottom: 0;
    margin-right: 0.7em;
    color: #fafafa;
    font-size: 1.05em;
  }
  .conflict-tolerance-controls {
    display: flex;
    align-items: center;
    gap: 0.5em;
    margin-bottom: 0;
  }
  .conflict-tolerance-btn {
    background: #232326;
    color: #fafafa;
    border: 1px solid #3f3f46;
    border-radius: 4px;
    padding: 0.15em 0.5em;
    font-size: 1em;
    cursor: pointer;
    transition: background 0.2s;
  }
  .conflict-tolerance-btn:active {
    background: #27272a;
  }
  .conflict-tolerance-value {
    min-width: 2em;
    text-align: center;
    font-weight: bold;
    color: #22c55e; /* green-500 */
    font-size: 1em;
  }
  .conflict-tolerance-info {
    font-size: 0.85em;
    color: #a1a1aa;
    margin-left: 1em;
    margin-bottom: 0;
    white-space: nowrap;
  }
  @media (max-width: 900px) {
    .planner-flex {
      flex-direction: column;
      gap: 1rem;
    }
    table, .planner-flex > div {
      width: 100%;
      min-width: 0;
      max-width: 100%;
    }
    th, td {
      font-size: 0.95em;
      min-width: 32px;
      height: 32px;
      padding: 0;
    }
    .conflict-tolerance-container {
      font-size: 0.95em;
      padding: 0.2rem 0.4rem;
    }
  }
  @media (max-width: 600px) {
    table, .planner-flex > div {
      width: 100%;
      min-width: 0;
      max-width: 100%;
    }
    th, td {
      font-size: 0.85em;
      min-width: 24px;
      height: 28px;
      padding: 0;
    }
    .conflict-tolerance-container {
      font-size: 0.85em;
      padding: 0.1rem 0.2rem;
    }
  }
  /* ...rest of your styles... */
</style>

<div class="planner-flex">
  <table>
    <thead>
      <tr>
        <th>
          <span class="corner-signature">@mil3ri</span>
        </th>
        {#each days as day}
          <th
            on:click={() => deactivateColumn(day)}
            style="cursor:pointer;"
            title="Deactivate this day"
          >
            {day.slice(0,3)}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each hours as hour}
        <tr>
          <td
            on:click={() => deactivateRow(hour)}
            style="cursor:pointer;"
            title="Deactivate this hour"
          >
            {hour}
          </td>
          {#each days as day}
            <td class="checkbox-cell">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  checked={$selectedTimes.has(`${day}-${hour}`)}
                  on:change={e => toggleTime(day, hour, e.target.checked)}
                  id={`${day}-${hour}`}
                  class="full-checkbox"
                />
                <span class="checkbox-bg">
                  {$selectedTimes.has(`${day}-${hour}`) ? "✓" : ""}
                </span>
              </label>
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
  <div>
    <div class="conflict-tolerance-container">
      <span class="conflict-tolerance-label">Conflict Tolerance</span>
      <span class="conflict-tolerance-controls">
        <button
          class="conflict-tolerance-btn"
          on:click={() => {
            conflictTolerance.set(Math.max(0, $conflictTolerance - 1));
            sessionStorage.setItem("conflictTolerance", $conflictTolerance);
          }}
          aria-label="Decrease conflict tolerance"
        >-</button>
        <span class="conflict-tolerance-value">{$conflictTolerance}</span>
        <button
          class="conflict-tolerance-btn"
          on:click={() => {
            conflictTolerance.set($conflictTolerance + 1);
            sessionStorage.setItem("conflictTolerance", $conflictTolerance);
          }}
          aria-label="Increase conflict tolerance"
        >+</button>
      </span>
    </div>
    <div class="conflict-tolerance-container" style="margin-top:0.7em;">
      <span class="conflict-tolerance-label">Min. Credits</span>
      <span class="conflict-tolerance-controls">
        <button
          class="conflict-tolerance-btn"
          on:click={() => minCredits.set(Math.max(0, $minCredits - 1))}
          aria-label="Decrease min credits"
        >-</button>
        <span class="conflict-tolerance-value">{$minCredits}</span>
        <button
          class="conflict-tolerance-btn"
          on:click={() => minCredits.set(Math.min(4, $minCredits + 1))}
          aria-label="Increase min credits"
        >+</button>
      </span>
    </div>
    <div class="conflict-tolerance-container" style="margin-top:0.7em;">
      <span class="conflict-tolerance-label">Max. Grade</span>
      <span class="conflict-tolerance-controls">
        <button
          class="conflict-tolerance-btn"
          on:click={() => maxGrade.set(Math.max(1, $maxGrade - 1))}
          aria-label="Decrease max grade"
        >-</button>
        <span class="conflict-tolerance-value">{$maxGrade}</span>
        <button
          class="conflict-tolerance-btn"
          on:click={() => maxGrade.set(Math.min(6, $maxGrade + 1))}
          aria-label="Increase max grade"
        >+</button>
      </span>
    </div>
    <button
      class="conflict-tolerance-container"
      style="margin-top: 0.7em; width: 100%; font-weight: bold; font-size: 0.95em;"
      on:click={excludeFullHours}
    >
      Exclude Full Hours
    </button>
    <div style="margin-top: 0.7em; width: 100%;">
      <label
        class="conflict-tolerance-container"
        style="
          display: flex;
          align-items: center;
          gap: 0.7em;
          font-size: 0.95em;
          color: #fafafa;
          border: 1px solid #3f3f46;
          border-radius: 4px;
          padding: 0.15em 0.5em;
          font-weight: bold;
          cursor: pointer;
          width: 100%;
        "
      >
        <input
          type="checkbox"
          bind:checked={$showUnknownHours}
          style="accent-color: #14532D; width: 1.2em; height: 2.2em; margin: 0; cursor: pointer;"
        />
        Show Lessons That Have Unknown Hours
      </label>
    </div>
  </div>
</div>