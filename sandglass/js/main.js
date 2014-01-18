(function() {
  var BOWER_PATH = '../../bower_components/';

  require.config({
    noGlobal: true,
    paths: {
      'moment':                 BOWER_PATH + 'momentjs/moment',
      'lodash':                 BOWER_PATH + 'lodash/dist/lodash.min',
      'hogan':                  BOWER_PATH + 'hogan/web/builds/2.0.0/hogan-2.0.0.amd',
      'jquery':                 BOWER_PATH + 'jquery/jquery',
      'jquery.ui.autocomplete': BOWER_PATH + 'jquery-ui/ui/jquery.ui.autocomplete',
      'jquery.ui.core':         BOWER_PATH + 'jquery-ui/ui/jquery.ui.core',
      'jquery.ui.widget':       BOWER_PATH + 'jquery-ui/ui/jquery.ui.widget',
      'jquery.ui.position':     BOWER_PATH + 'jquery-ui/ui/jquery.ui.position',
      'jquery.ui.menu':         BOWER_PATH + 'jquery-ui/ui/jquery.ui.menu',
      'template.track':        '../templates/track',
      'template.grain':        '../templates/grain'
    },

    shim: {
        'sandglass': [ 'jquery',
                       'jquery.ui.autocomplete' ],

        'jquery': {
          exports: 'jQuery'
        },

        'jquery.ui.autocomplete': [ 'jquery',
                                    'jquery.ui.core',
                                    'jquery.ui.widget',
                                    'jquery.ui.position',
                                    'jquery.ui.menu' ]
    }
  });

  require(
    [ 'jquery',
      'sandglass' ],
    function( $, Sandglass ) {
      $( document ).ready(function() {
        new Sandglass().init();
      });
  });
})();