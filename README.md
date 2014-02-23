# Sandglass #
A fast frontend for the Python API, supporting localstorage and offline
usage. Basic reports are included via nvd3-Charts.

## Installation ##
Install the express app:

``npm install``

Get all required dependencies with:

``cd sandglass/public && bower install``

To start the application run:

``node app``

## Roadmap ##
0.0.2
 - Tag Managment
 - Add activities to other days
 - Error handling for editing activities

0.0.3
 - Code cleanup
 - Tests, travis integration

0.0.4
 - User settings (dateformat, timeformat, ...)
 - Chart (view hours per project or task on daily base)

0.0.5
  - Responsive views
  - Styling enhancements

0.0.6
  - Offline usage (localStorage)