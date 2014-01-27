(function() {
  var BOWER_PATH = '../../bower_components/';

  require.config({
    noGlobal: true,
    paths: {
      'moment':                 BOWER_PATH + 'momentjs/min/moment-with-langs',
      'lodash':                 BOWER_PATH + 'lodash/dist/lodash.min',
      'hogan':                  BOWER_PATH + 'hogan/web/builds/2.0.0/hogan-2.0.0.amd',
      'jquery':                 BOWER_PATH + 'jquery/jquery',
      'jquery.ui.autocomplete': BOWER_PATH + 'jquery-ui/ui/jquery.ui.autocomplete',
      'jquery.ui.datepicker'  : BOWER_PATH + 'jquery-ui/ui/jquery.ui.datepicker',
      'jquery.ui.core':         BOWER_PATH + 'jquery-ui/ui/jquery.ui.core',
      'jquery.ui.widget':       BOWER_PATH + 'jquery-ui/ui/jquery.ui.widget',
      'jquery.ui.position':     BOWER_PATH + 'jquery-ui/ui/jquery.ui.position',
      'jquery.ui.menu':         BOWER_PATH + 'jquery-ui/ui/jquery.ui.menu',
      'template.track':         '../templates/track',
      'template.grain':         '../templates/grain',
      'defaults':               'defaults',
      'raphael':                BOWER_PATH + 'raphael/raphael',
      'graphael':               BOWER_PATH + 'g.raphael/g.raphael',
      'graphaelbar':            BOWER_PATH + 'g.raphael/g.bar'
    },

    shim: {
        'sandglass': [ 'jquery',
                       'jquery.ui.autocomplete',
                       'jquery.ui.datepicker' ],

        'jquery': {
          exports: 'jQuery'
        },

        'raphael': {
          deps: [ 'jquery' ],
          exports: 'Raphael'
        },

        'graphaelbar': {
          deps: [ 'graphael' ],
          exports: 'Raphael'
        },

        'jquery.ui.autocomplete': [ 'jquery',
                                    'jquery.ui.core',
                                    'jquery.ui.widget',
                                    'jquery.ui.position',
                                    'jquery.ui.menu' ],

        'jquery.ui.datepicker': [ 'jquery',
                                  'jquery.ui.position',
                                  'jquery.ui.core' ]
    }
  });

  require(
    [ 'jquery',
      'sandglass',
      'raphael' ],
    function( $, Sandglass, Raphael ) {
      $( document ).ready(function() {
        new Sandglass();
      });
  });
})();