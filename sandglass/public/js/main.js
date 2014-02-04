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
      'template.track':        '../templates/track',
      'template.grain':        '../templates/grain',
      'defaults':              'defaults',
      'nvd3':                  BOWER_PATH + 'nvd3/nv.d3',
      'd3':                    BOWER_PATH + 'd3/d3',
      'backbone':              BOWER_PATH + 'backbone/backbone'
    },

    shim: {
        'jquery': {
          exports: '$'
        },

        'jquery.cookie': {
          exports: '$',
          deps: [ 'jquery' ]
        },

        'backbone': {
          exports: 'Backbone',
          deps: [ 'lodash',
                  'jquery' ]
        },

        'd3': {
          exports: 'd3'
        },

        'nvd3': {
          exports: 'nv',
          deps: [ 'd3' ]
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
    [ 'lodash',
      'backbone',
      'jquery.cookie',
      'views/login',
      'views/logout',
      'views/track',
      'views/signup',
      'models/user',
      'models/notification',
      'collections/notification' ],
    function( _,
              Backbone,
              __cookie,
              LoginView,
              LogoutView,
              TrackView,
              SignupView,
              User,
              Notification,
              NotificationCollection ) {

      var cookieData = $.cookie( 'user' ),
          User = cookieData ? new User( JSON.parse( cookieData ) ) : undefined;

      window.Sandglass = {
        User: User,
        collections: {
          notification: NotificationCollection
        },
        views: {
          login: new LoginView(),
          logout: new LogoutView(),
          track: new TrackView(),
          signup: new SignupView()
        }
      };

      $(function() {
        var Workspace = Backbone.Router.extend({
          routes: {
            '':        'start',
            'logout':  'logout',
            'track':   'track',
            'signup':  'signup'
          },

          start: function() {
            if( window.Sandglass.User ) {
              Backbone.history.navigate('track', { trigger : true });
            }
          },

          logout: function() {
            window.Sandglass.User.logout();
          },

          track: function() {
            if( !window.Sandglass.User ) {
              new Notification({
                type: 'warning',
                message: 'Please login before tracking!'
              });
            }

            window.Sandglass.views.track.show();
          },

          signup: function() {}
        });

        /* handle login/logout on route change */
        new Workspace()
          .bind('route', function( route ) {
            _.forEach( Sandglass.views, function( view, index ) {
              if( index === route ) {
                view.show();
              } else {
                view.hide();
              }
            });

            if( window.Sandglass.User ) {
              window.Sandglass.views.login.hide();
              window.Sandglass.views.logout.show();
              return;
            } else {
              window.Sandglass.views.login.show();
              window.Sandglass.views.logout.hide();
            }

            new Notification( { type: 'success',
                                text: 'Changed route ' + route } );
          });

        Backbone.history
          .start( { pushState: true,
                    start: '/' } );
      });
  });
})();