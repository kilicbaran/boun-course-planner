# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- New course data

### Changes

- Update dependencies

## [1.1.0] - 2022-04-04

### Added

- Course categories as badges below search bar

### Changes

- Update dependencies

## [1.0.2] - 2022-02-05

### Changes

- Update dependencies
- Migrate from Tailwind CSS 2 to 3

## [1.0.1] - 2022-02-05

### Added

- New course data

### Fixed

- Fix bug related to removed courses
- Fix Google Analytics

## [1.0.0] - 2021-10-23

### Added

- Dark theme.

### Changed

- Migrate from Vue to Svelte and from Bootstrap-Vue to Tailwind CSS.
- Change timetable from an auto layout to a fixed layout.

### Fixed

- Fix course detail overflow bug on small screens.

## [0.2.0] - 2020-06-28

### Changed

- Divide the monolithic code in App.vue into components to make it more readable.
- Change course data format. The labs and p.s. are no longer inside their parent course.

### Fixed

- Fix the problem where the course descriptions open wrong link. The reason was some course codes did contain a whitespace and some did not and I was removing the whitespace to make them uniform.
- Fix the problem where the keyboard did not close upon pressing return on mobile.
- The search bar should now not be autocorrected on mobile.

### Removed

- Remove the debounce that was applied to search bar and course hover actions. It only made the UI slow. It did not improved the performance much.

## [0.1.0] - 2019-02-17

### Added

- Add a badge for conflicting courses.

### Changed

- Migrate from React to Vue

## [0.0.0] - 2018-09-11

### Added

- Course search.
- Timetable of selected courses.
- Display individual and total credit of selected courses.

[unreleased]: https://github.com/kilicbaran/boun-course-planner/compare/v1.0.0...HEAD
[1.1.0]: https://github.com/kilicbaran/boun-course-planner/compare/v1.0.2...v1.1.0
[1.0.2]: https://github.com/kilicbaran/boun-course-planner/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/kilicbaran/boun-course-planner/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/kilicbaran/boun-course-planner/compare/v0.2.0...v1.0.0
[0.2.0]: https://github.com/kilicbaran/boun-course-planner/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/kilicbaran/boun-course-planner/releases/tag/v0.1.0
