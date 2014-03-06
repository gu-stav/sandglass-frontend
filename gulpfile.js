var gulp = require('gulp'),
    less = require('gulp-less');

var paths = {
  less: [ 'sandglass/public/css/less/**/*.less' ],
  lessOut: 'sandglass/public/css'
};

gulp.task('less', function () {
  gulp.src( paths.less )
    .pipe( less({
      dumpLineNumbers: 'all'
    }) )
    .pipe( gulp.dest( paths.lessOut ) );
});

gulp.task('watch', function() {
  gulp.watch( paths.less, ['less'] );
});

gulp.task( 'default', ['watch'] );
gulp.task( 'build', ['less'] );