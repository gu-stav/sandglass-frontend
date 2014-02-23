# Sandglass #
A frontend for the [Sandglass API https://bitbucket.org/sandglass/sandglass.time/commits]
based on python, supporting offline usage.

## Installation ##
Install the express app:

``npm install``

Get all required dependencies with:

``cd sandglass/public && bower install``

To start the application run:

``node app``

## Roadmap ##
Changes will be done in the master branch.

0.1 release 02/25/2014
 - merge api into master branch
 - will be released after internal meeting

0.2 mid of 03/2014
 - Tag Managment
 - Add activities to other days
 - Change date of existing activities
 - Error handling for editing & adding activities

0.3 end of 03/2014
 - Code cleanup
 - Frontend builds (gulp)
 - npm setup command (unify bower, npm install)
 - Tests, travis integration

0.4 begin of 04/2014
 - User settings (dateformat, timeformat, ...)
 - Chart (view hours per project or task on daily base)

0.5 end of 04/2014
  - Responsive views
  - Styling enhancements

0.6 end of 05/2014
  - Offline usage (localStorage)