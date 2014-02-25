(function() {
  var BOWER_PATH = '../../bower_components/';

  require.config({
    noGlobal: true,
    paths: {
      'moment':                 BOWER_PATH + 'momentjs/min/moment-with-langs',
      'lodash':                 BOWER_PATH + 'lodash/dist/lodash.min',
      'underscore':             BOWER_PATH + 'underscore/underscore',
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
          deps: [ 'underscore',
                  'jquery' ]
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

      /* check if the browser supports all the stuff we need */
      if( !'localStorage' in window || !'Promise' in window ) {
        alert('Your browser is not supported. For details see console.');
        throw new Error('No support for Promises or localStorage found.');

        return;
      }

      Backbone.collections = {};
      Backbone.views = {};
      Backbone.user = $.cookie( 'user' ) ?
                        new User( JSON.parse( $.cookie( 'user' ) ) ) :
                        undefined;

      var Workspace = Backbone.Router.extend({
        routes: {
          '':        'start',
          'login':   'login',
          'logout':  'logout',
          'track':   'track',

          'track/:id/edit': 'activity_edit'
        },

        start: function() {
          Backbone.history.navigate('track', { trigger : true });
        },

        login: function() {
          if( !Backbone.views.login ) {
            Backbone.views.login = new LoginView();
          }

          if( !Backbone.views.signup ) {
            Backbone.views.signup = new SignupView();
          }

          _.forEach( [ 'timeline',
                       'track',
                       'user' ], function( item ) {
            if( Backbone.views.hasOwnProperty( item ) ) {
              Backbone.views[ item ].remove();
              delete Backbone.views[ item ];
            }
          });
        },

        logout: function() {
          Backbone.user.logout();
        },

        track: function() {
          return new Promise(function( res, rej ) {
            /* no valid session exists */
            if( !Backbone.user ) {
              Backbone.history.navigate( 'login', { trigger : true } );
              return res();
            }

            Backbone.user
              .login()
              .then( function() {
                _.forEach( [ 'login',
                             'signup',
                             'track' ], function( item ) {
                  if( Backbone.views.hasOwnProperty( item ) ) {
                    Backbone.views[ item ].remove();
                    delete Backbone.views[ item ];
                  }
                });

                if( !Backbone.views.user ) {
                  Backbone.views.user = new UserView({ model: Backbone.user });
                }

                Backbone.collections = {
                  activity: new ActivityCollection(),
                  project: new ProjectCollection(),
                  task: new TaskCollection()
                };

                Backbone.views.track = new TrackView({
                  collection: Backbone.collections.activity
                });

                Backbone.views.timeline = new TimelineView({
                  collection: Backbone.collections.activity
                });

                /* load recent data */
                async.parallel([
                  function( cb ) {
                    Backbone.collections.project
                      .loadAll()
                      .then( cb );
                  },
                  function( cb ) {
                    Backbone.collections.task
                      .loadAll()
                      .then( cb );
                  }
                ], function( err, data ) {
                  Backbone.collections.activity
                    .loadRecent()
                    .then( res, rej );
                });
              },
              function() {
                user.logout();
              });
          });
        },

        activity_edit: function( id ) {
          this.track()
            .then(function() {
              Backbone.collections.activity
                .get( id )
                  ._view
                  .edit();
            });
        }
      });

      /* handle login/logout on route change */
      new Workspace();

      Backbone.history
        .start( { pushState: true, start: '/' } );
  });
})();