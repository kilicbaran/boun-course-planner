<script>
  import Header from "./lib/Header.svelte";
  import CourseCatalogue from "./lib/CourseCatalogue.svelte";
  import Timetable from "./lib/Timetable.svelte";
  import CourseList from "./lib/CourseList.svelte";
  import GoogleAnalytics from "./lib/GoogleAnalytics.svelte";
</script>

<main class="md:max-h-screen min-h-screen md:h-screen flex flex-col bg-gray-100 dark:bg-black">
  <Header />

  <div class="flex flex-col md:flex-row flex-grow md:overflow-hidden">
    <div class="w-full md:w-5/12 p-2 flex flex-col flex-shrink-0 md:flex-grow md:overflow-y-auto md:min-h-0">
      <Timetable />
      <CourseList />
    </div>
    <div class="w-full md:w-7/12 p-2 flex flex-col flex-grow h-full">
      <CourseCatalogue />
    </div>
  </div>
</main>

<GoogleAnalytics />

<!-- 
  TODO
  - maybe show quota page?
  - add search by day-hour, credit
  - add description modal for hours, rooms
  - export timetable as image
  - handle the case when some courses are deleted and the code cannot find course e.g. curSemesterData[courseName].days this will be null
 -->
