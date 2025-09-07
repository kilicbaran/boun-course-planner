<script lang="ts">
  import {
    getSelectedCourseNames,
    getCurSemesterData,
    getCurrentSemester,
  } from "./globalState.svelte";
  import IconDocument from "./icons/IconDocument.svelte";
  import { onMount } from "svelte";

  // Semester data with dates and holidays loaded from JSON
  type SemesterData = {
    start: string;
    end: string;
    holidays?: Holiday[];
  };
  let semesterDates: Record<string, SemesterData> = $state({});

  // Holidays data extracted from semester data
  type Holiday = {
    date: string;
    name: string;
    timeType?: "before" | "after" | "between";
    time?: string;
    endTime?: string; // For 'between' type
  };
  let holidaysData: Record<string, Holiday[]> = $state({});

  // State for showing import instructions
  let showInstructions = $state(false);

  // Load semester dates and holidays from JSON file
  onMount(async () => {
    try {
      const res = await fetch(
        `${import.meta.env.BASE_URL}data/semester-dates.json`
      );
      if (res.ok) {
        const data = await res.json();
        semesterDates = data;

        // Extract holidays from semester data
        Object.entries(data).forEach(
          ([semester, info]: [string, SemesterData]) => {
            if (info.holidays) {
              holidaysData[semester] = info.holidays;
            }
          }
        );
      } else {
        console.error("Failed to load semester dates:", res.statusText);
      }
    } catch (error) {
      console.error("Error loading semester dates:", error);
    }
  });

  // Day mapping for ICS format
  const dayMapping: Record<string, string> = {
    M: "MO",
    T: "TU",
    W: "WE",
    Th: "TH",
    F: "FR",
    St: "SA",
  };

  function formatDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  }

  function formatDateOnly(date: Date): string {
    return date.toISOString().split("T")[0].replace(/-/g, "");
  }

  function getFirstDayOfWeek(startDate: Date, targetDay: string): Date {
    const dayIndex = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"].indexOf(
      dayMapping[targetDay]
    );
    const startDayIndex = startDate.getDay();
    const diff = (dayIndex - startDayIndex + 7) % 7;
    const firstDay = new Date(startDate);
    firstDay.setDate(startDate.getDate() + diff);
    return firstDay;
  }

  function createCalendarEvent(
    courseName: string,
    courseInfo: any,
    startDate: Date,
    endDate: Date,
    currentSemester: string
  ): string[] {
    const events: string[] = [];

    if (!courseInfo.days || !courseInfo.hours) {
      return events;
    }

    // Get holidays for current semester
    const semesterHolidays = holidaysData[currentSemester] || [];

    // Group consecutive hours by day
    const dayGroups: Record<string, number[]> = {};
    for (let i = 0; i < courseInfo.days.length; i++) {
      const day = courseInfo.days[i];
      const hour = courseInfo.hours[i];
      if (!dayGroups[day]) {
        dayGroups[day] = [];
      }
      dayGroups[day].push(hour);
    }

    // Create events for each day
    Object.entries(dayGroups).forEach(([day, hours]) => {
      // Sort hours and group consecutive ones
      hours.sort((a, b) => a - b);
      const consecutiveGroups: number[][] = [];
      let currentGroup = [hours[0]];

      for (let i = 1; i < hours.length; i++) {
        if (hours[i] === hours[i - 1] + 1) {
          currentGroup.push(hours[i]);
        } else {
          consecutiveGroups.push(currentGroup);
          currentGroup = [hours[i]];
        }
      }
      consecutiveGroups.push(currentGroup);

      // Create a recurring event for each consecutive group
      consecutiveGroups.forEach((group, groupIndex) => {
        const startHour = group[0];
        const endHour = group[group.length - 1] + 1; // End time is start of next hour

        // Find the first occurrence of this day in the semester
        const firstOccurrence = getFirstDayOfWeek(startDate, day);

        // Create start and end DateTime objects for the first occurrence
        const eventStart = new Date(firstOccurrence);
        eventStart.setHours(8 + startHour, 0, 0, 0); // Hours start from 9am (index 1 = 9am)

        const eventEnd = new Date(firstOccurrence);
        eventEnd.setHours(8 + endHour, 0, 0, 0);

        // Generate EXDATE list for holidays that conflict with this class
        const excludeDates = generateExcludeDates(
          startDate,
          endDate,
          day,
          startHour,
          endHour,
          semesterHolidays
        );

        // Generate unique ID
        const uid = `${courseName}-${day}-${startHour}-${groupIndex}-${Date.now()}@boun-course-planner`;

        // Get location information
        let location = "Boğaziçi University";
        if (courseInfo.rooms && courseInfo.rooms.length > 0) {
          // If rooms info is available, use it
          if (courseInfo.rooms[0] === "Online") {
            location = "Online";
          } else {
            // Join multiple rooms with commas, or use the specific room info
            location = `${courseInfo.rooms.join(", ")}, Boğaziçi University`;
          }
        }

        // Create the recurring event
        const eventLines = [
          "BEGIN:VEVENT",
          `UID:${uid}`,
          `DTSTART:${formatDate(eventStart)}`,
          `DTEND:${formatDate(eventEnd)}`,
          `SUMMARY:${courseName}`,
          `DESCRIPTION:Course: ${courseInfo.name || courseName}\\nInstructor: ${courseInfo.instructor || "N/A"}\\nCredits: ${courseInfo.credits || "N/A"}`,
          `LOCATION:${location}`,
          `RRULE:FREQ=WEEKLY;UNTIL=${formatDate(new Date(endDate.getTime() + 24 * 60 * 60 * 1000))}`,
        ];

        // Add EXDATE if there are holidays to exclude
        if (excludeDates.length > 0) {
          eventLines.push(`EXDATE:${excludeDates.join(",")}`);
        }

        eventLines.push("END:VEVENT");

        events.push(eventLines.join("\r\n"));
      });
    });

    return events;
  }

  function generateExcludeDates(
    startDate: Date,
    endDate: Date,
    targetDay: string,
    classStartHour: number,
    classEndHour: number,
    holidays: Holiday[]
  ): string[] {
    const excludeDates: string[] = [];
    const firstOccurrence = getFirstDayOfWeek(startDate, targetDay);

    let currentDate = new Date(firstOccurrence);

    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split("T")[0];

      // Check if there's a holiday on this date
      const holiday = holidays.find((h) => h.date === dateString);

      if (holiday) {
        let shouldExclude = false;

        if (!holiday.timeType) {
          // Full day holiday
          shouldExclude = true;
        } else if (holiday.time) {
          // Holiday with time specification - check if class conflicts
          const [holidayHour, holidayMinute] = holiday.time
            .split(":")
            .map(Number);
          const holidayTimeInHours = holidayHour + holidayMinute / 60;

          // Convert class hours to actual time (assuming hour 1 = 9:00 AM)
          const classStartTime = 8 + classStartHour; // Hour 1 = 9:00 AM
          const classEndTime = 8 + classEndHour;

          if (holiday.timeType === "before") {
            // Holiday before specified time - class is cancelled if it starts before holiday time
            if (classStartTime < holidayTimeInHours) {
              shouldExclude = true;
            }
          } else if (holiday.timeType === "after") {
            // Holiday after specified time - class is cancelled if it ends after holiday time
            if (classEndTime > holidayTimeInHours) {
              shouldExclude = true;
            }
          } else if (holiday.timeType === "between" && holiday.endTime) {
            // Holiday between two times
            const [endHour, endMinute] = holiday.endTime.split(":").map(Number);
            const holidayEndTime = endHour + endMinute / 60;

            // Class is cancelled if it overlaps with holiday period
            if (
              !(
                classEndTime <= holidayTimeInHours ||
                classStartTime >= holidayEndTime
              )
            ) {
              shouldExclude = true;
            }
          }
        }

        if (shouldExclude) {
          // Create the exclude date in the same format as the event start time
          const excludeDate = new Date(currentDate);
          excludeDate.setHours(8 + classStartHour, 0, 0, 0);
          excludeDates.push(formatDate(excludeDate));
        }
      }

      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }

    return excludeDates;
  }

  function generateICS(): string {
    const currentSemester = getCurrentSemester();
    const selectedCourses = getSelectedCourseNames();
    const semesterData = getCurSemesterData();

    if (!currentSemester || !semesterData || selectedCourses.length === 0) {
      return "";
    }

    const semesterDateRange = semesterDates[currentSemester];
    if (!semesterDateRange) {
      alert(
        "Semester dates not available for " +
          currentSemester +
          ". Please try again in a moment."
      );
      return "";
    }

    const startDate = new Date(semesterDateRange.start);
    const endDate = new Date(semesterDateRange.end);

    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//BOUN Course Planner//Course Schedule//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:BOUN Course Schedule",
      "X-WR-CALDESC:Course schedule for " + currentSemester,
      "X-WR-TIMEZONE:Europe/Istanbul",
      "BEGIN:VTIMEZONE",
      "TZID:Europe/Istanbul",
      "BEGIN:STANDARD",
      "DTSTART:20071028T040000",
      "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
      "TZNAME:+03",
      "TZOFFSETFROM:+0400",
      "TZOFFSETTO:+0300",
      "END:STANDARD",
      "BEGIN:DAYLIGHT",
      "DTSTART:20070325T030000",
      "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
      "TZNAME:+04",
      "TZOFFSETFROM:+0300",
      "TZOFFSETTO:+0400",
      "END:DAYLIGHT",
      "END:VTIMEZONE",
    ].join("\r\n");

    // Generate events for each selected course
    selectedCourses.forEach((courseName) => {
      if (semesterData[courseName]) {
        const events = createCalendarEvent(
          courseName,
          semesterData[courseName],
          startDate,
          endDate,
          currentSemester
        );
        icsContent += "\r\n" + events.join("\r\n");
      }
    });

    icsContent += "\r\nEND:VCALENDAR";
    return icsContent;
  }

  function downloadCalendar() {
    const icsContent = generateICS();
    if (!icsContent) {
      alert("No courses selected or semester data not available.");
      return;
    }

    // Create filename
    const filename = `BOUN-${getCurrentSemester()}-schedule.ics`;

    // Create blob with proper MIME type
    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });

    // For modern browsers, use the standard download approach
    // Other browsers
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.style.display = "none";

    // Add to DOM, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the blob URL after a short delay
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  }

  const hasSelectedCourses = $derived(
    getSelectedCourseNames().length > 0 &&
      getCurrentSemester() &&
      getCurSemesterData() &&
      Object.keys(semesterDates).length > 0
  );

  const isFutureSemester = $derived(
    getCurrentSemester() && semesterDates[getCurrentSemester()]
  );

  const canExportCalendar = $derived(hasSelectedCourses && isFutureSemester);
</script>

<div class="flex flex-col gap-2">
  <div class="flex items-center gap-3">
    <button
      type="button"
      class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      onclick={downloadCalendar}
      disabled={!canExportCalendar}
      title={canExportCalendar
        ? "Download calendar file (.ics)"
        : !hasSelectedCourses
          ? "Select courses to enable calendar export"
          : "Calendar export is only available for future semesters"}
    >
      <IconDocument />
      Add to Calendar
    </button>

    <button
      type="button"
      class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline cursor-pointer"
      onclick={() => (showInstructions = !showInstructions)}
    >
      How to import?
    </button>
  </div>

  {#if showInstructions}
    <div
      class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm"
    >
      <div class="flex justify-between items-start mb-2">
        <h4 class="font-medium text-gray-900 dark:text-gray-100">
          Import Calendar Instructions:
        </h4>
        <button
          type="button"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onclick={() => (showInstructions = false)}
        >
          ✕
        </button>
      </div>
      <ul class="space-y-1 text-gray-700 dark:text-gray-300">
        <li>
          <strong>macOS:</strong> Double-click the .ics file to open in Calendar
          app
        </li>
        <li>
          <strong>Windows:</strong> Double-click to open in Outlook or Calendar app
        </li>
        <li>
          <strong>Google Calendar:</strong> Go to Settings → Import & Export → Import
        </li>
        <li>
          <strong>Outlook Web:</strong> Click 'Add calendar' → 'Upload from file'
        </li>
      </ul>
    </div>
  {/if}
</div>
