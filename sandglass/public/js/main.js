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
      'backbone':              BOWER_PATH + 'backbone/backbone',
      'async':                 BOWER_PATH + 'async/lib/async'
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
      'views/track',
      'views/signup',
      'views/timeline',
      'views/user',
      'models/user',
      'collections/activity',
      'collections/project',
      'collections/task',
      'async' ],
    function( _,
              Backbone,
              __cookie,
              LoginView,
              TrackView,
              SignupView,
              TimelineView,
              UserView,
              User,
              ActivityCollection,
              ProjectCollection,
              TaskCollection,
              async ) {

      var cookieData = $.cookie( 'user' ),
          User = cookieData ? new User( JSON.parse( cookieData ) ) : undefined;

      window.Sandglass = {};

      window.Sandglass.User = User;

      window.Sandglass.collections = {
        activity: new ActivityCollection(),
        project: new ProjectCollection(),
        task: new TaskCollection()
      };

      window.Sandglass.views = {
        login: new LoginView(),
        track: new TrackView(),
        signup: new SignupView(),
        timeline: new TimelineView(),
        user: new UserView()
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
            if( Sandglass.User ) {
              Backbone.history.navigate('track', { trigger : true });
            } else {
              Backbone.history.navigate('signup', { trigger : true });
            }
          },

          logout: function() {
            Sandglass.User.logout();
          },

          track: function() {
            if( !Sandglass.User ) {
              return Backbone.history.navigate('signup', { trigger : true });
            }

            Sandglass.views.track.show();

            /* load recent data */
            async.parallel([
              function( cb ) {
                Sandglass.collections.project
                  .loadAll()
                  .then( cb );
              },
              function( cb ) {
                Sandglass.collections.task
                  .loadAll()
                  .then( cb );
              }
            ], function( err, data ) {
              Sandglass.collections.activity
                .loadRecent();
            });
          },

          signup: function() {}
        });

        /* handle login/logout on route change */
        new Workspace()
          .bind('route', function( route ) {
            _.forEach( Sandglass.views, function( view, index ) {
              if( index === 'timeline' ) {
                return;
              }

              if( view.hasOwnProperty('hide') ) {
                view.hide();
              }
            });

            if( Sandglass.views[ route ] ) {
              Sandglass.views[ route ].show();
            } else {
              Sandglass.views.signup.show();
            }

            if( Sandglass.User ) {
              Sandglass.views.login.hide();
              Sandglass.views.user.render().$el.appendTo( 'header' )
              return;
            } else {
              Sandglass.views.login.show();
              Sandglass.views.user.hide();
            }
          });

        Backbone.history
          .start( { pushState: true,
                    start: '/' } );
      });
  });
})();