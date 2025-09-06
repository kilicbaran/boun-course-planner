<script lang="ts">
  import {
    getSelectedCourseNames,
    getCurSemesterData,
    getCurrentSemester,
  } from "./globalState.svelte";
  import IconDocument from "./icons/IconDocument.svelte";
  import { onMount } from "svelte";

  // Semester date mappings loaded from JSON
  let semesterDates: Record<string, { start: string; end: string }> = $state({});
  
  // Holidays data loaded from JSON
  type Holiday = {
    date: string;
    name: string;
    timeType?: 'before' | 'after' | 'between';
    time?: string;
    endTime?: string; // For 'between' type
  };
  let holidaysData: Record<string, Holiday[]> = $state({});

  // Load semester dates from JSON file
  onMount(async () => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}data/semester-dates.json`);
      if (res.ok) {
        semesterDates = await res.json();
      } else {
        console.error("Failed to load semester dates:", res.statusText);
      }
    } catch (error) {
      console.error("Error loading semester dates:", error);
    }

    // Load holidays data
    try {
      const holidaysRes = await fetch(`${import.meta.env.BASE_URL}data/holidays.json`);
      if (holidaysRes.ok) {
        holidaysData = await holidaysRes.json();
      } else {
        console.error("Failed to load holidays:", holidaysRes.statusText);
      }
    } catch (error) {
      console.error("Error loading holidays:", error);
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

      // Create an event for each consecutive group
      consecutiveGroups.forEach((group) => {
        const startHour = group[0];
        const endHour = group[group.length - 1] + 1; // End time is start of next hour

        // Generate all occurrences for this day/time combination, excluding holidays
        const occurrences = generateOccurrences(startDate, endDate, day, startHour, endHour, semesterHolidays);
        
        occurrences.forEach((occurrenceDate, index) => {
          // Create start and end DateTime objects for this occurrence
          const eventStart = new Date(occurrenceDate);
          eventStart.setHours(8 + startHour, 0, 0, 0); // Hours start from 9am (index 1 = 9am)
          
          const eventEnd = new Date(occurrenceDate);
          eventEnd.setHours(8 + endHour, 0, 0, 0);

          // Generate unique ID
          const uid = `${courseName}-${day}-${startHour}-${index}-${Date.now()}@boun-course-planner`;

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

          const event = [
            "BEGIN:VEVENT",
            `UID:${uid}`,
            `DTSTART:${formatDate(eventStart)}`,
            `DTEND:${formatDate(eventEnd)}`,
            `SUMMARY:${courseName}`,
            `DESCRIPTION:Course: ${courseInfo.name || courseName}\\nInstructor: ${courseInfo.instructor || 'N/A'}\\nCredits: ${courseInfo.credits || 'N/A'}`,
            `LOCATION:${location}`,
            "END:VEVENT",
          ].join("\r\n");

          events.push(event);
        });
      });
    });

    return events;
  }

  function generateOccurrences(
    startDate: Date, 
    endDate: Date, 
    targetDay: string, 
    classStartHour: number,
    classEndHour: number,
    holidays: Holiday[]
  ): Date[] {
    const occurrences: Date[] = [];
    const firstOccurrence = getFirstDayOfWeek(startDate, targetDay);
    
    let currentDate = new Date(firstOccurrence);
    
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Check if there's a holiday on this date
      const holiday = holidays.find(h => h.date === dateString);
      
      if (!holiday) {
        // No holiday, add the occurrence
        occurrences.push(new Date(currentDate));
      } else if (holiday.timeType && holiday.time) {
        // Holiday with time specification - check if class conflicts
        const [holidayHour, holidayMinute] = holiday.time.split(':').map(Number);
        const holidayTimeInHours = holidayHour + (holidayMinute / 60);
        
        // Convert class hours to actual time (assuming hour 1 = 9:00 AM)
        const classStartTime = 8 + classStartHour; // Hour 1 = 9:00 AM
        const classEndTime = 8 + classEndHour;
        
        let shouldInclude = true;
        
        if (holiday.timeType === 'before') {
          // Holiday before specified time - class is cancelled if it starts before holiday time
          if (classStartTime < holidayTimeInHours) {
            shouldInclude = false;
          }
        } else if (holiday.timeType === 'after') {
          // Holiday after specified time - class is cancelled if it ends after holiday time
          if (classEndTime > holidayTimeInHours) {
            shouldInclude = false;
          }
        } else if (holiday.timeType === 'between' && holiday.endTime) {
          // Holiday between two times
          const [endHour, endMinute] = holiday.endTime.split(':').map(Number);
          const holidayEndTime = endHour + (endMinute / 60);
          
          // Class is cancelled if it overlaps with holiday period
          if (!(classEndTime <= holidayTimeInHours || classStartTime >= holidayEndTime)) {
            shouldInclude = false;
          }
        }
        
        if (shouldInclude) {
          occurrences.push(new Date(currentDate));
        }
      } else {
        // Holiday without time specification - treat as full day holiday
        // Don't add the occurrence
      }
      
      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }
    
    return occurrences;
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
      alert("Semester dates not available for " + currentSemester + ". Please try again in a moment.");
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
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    
    // For modern browsers, use the standard download approach
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      // IE/Edge
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
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
    
    // Show user instruction for manual import if needed
    setTimeout(() => {
      if (confirm("Calendar file downloaded! Would you like instructions on how to import it into your calendar app?")) {
        alert("To import the calendar:\n\n" +
              "• macOS: Double-click the .ics file to open in Calendar app\n" +
              "• Windows: Double-click to open in Outlook or Calendar app\n" +
              "• Google Calendar: Go to Settings > Import & Export > Import\n" +
              "• Outlook Web: Click 'Add calendar' > 'Upload from file'\n\n" +
              "The file is saved as: " + filename);
      }
    }, 500);
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

  const canExportCalendar = $derived(
    hasSelectedCourses && isFutureSemester
  );
</script>

<button
  type="button"
  class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
  onclick={downloadCalendar}
  disabled={!canExportCalendar}
  title={canExportCalendar 
    ? "Open schedule in your calendar app" 
    : !hasSelectedCourses 
      ? "Select courses to enable calendar export"
      : "Calendar export is only available for future semesters"}
>
  <IconDocument />
  Add to Calendar
</button>
