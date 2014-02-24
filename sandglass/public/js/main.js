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

      Sandglass = {
        views: {}
      };

      /* TODO: Sandglass = new Workspace() */
      Sandglass.getUserData = function() {
        return $.cookie( 'user' );
      };

      Sandglass.setUserData = function( data ) {
        $.cookie('user', JSON.stringify( data ) );
      };

      Sandglass.deleteUserData = function() {
        return new Promise(function( res, rej ) {

          if( Sandglass.hasOwnProperty('User') ) {
            Sandglass.User = undefined;
          }

          $.removeCookie('user');
          res();
        });
      };

      /* check if the browser supports all the stuff we need */
      if( !'localStorage' in window || !'Promise' in window ) {
        alert('Your browser is not supported. For details see console.');
        throw new Error('No support for Promises or localStorage found.');

        return;
      }

      var userCookie = Sandglass.getUserData(),
          user;

      if( userCookie ) {
        user = new User( JSON.parse( userCookie ) );
      }

      var Workspace = Backbone.Router.extend({
        routes: {
          '':        'start',
          'login':   'login',
          'logout':  'logout',
          'track':   'track',

          'track/:id/edit': 'activity_edit'
        },

        _views: {},

        /* check for localStorage support */
        hasLocalStorage: function() {
          return 'localStorage' in window;
        },

        /* Storage abstraction to support localStorage & cookieFallback */
        storageSet: function( index, data ) {
          /* when data is undefined, delete key */
          if( typeof( data ) === 'undefined' ) {
            localStorage.removeItem( index );
          }

          /* make sure we always use (json)strings */
          if( typeof( data ) !== 'string' ) {
            data = JSON.stringify( data );
          }

          if( this.hasLocalStorage() ) {
            return localStorage.setItem( index, data );
          } else {
            return $.cookie( index, data );
          }
        },

        /* Storage abstraction to support localStorage & cookieFallback */
        storageGet: function( index ) {
          var _return;

          if( this.hasLocalStorage() ) {
            _return = localStorage.getItem( index );
          } else {
            _return = $.cookie( index );
          }

          return JSON.parse( _return );
        },

        getUserData: function() {
          return this.storageGet( 'user' );
        },

        setUserData: function( data ) {
          return this.storageSet( 'user', data );
        },

        deleteUserData: function() {
          $.storageSet( 'user', undefined );
        },

        start: function() {
          Backbone.history.navigate('track', { trigger : true });
        },

        login: function() {
          if( !Sandglass.views.login ) {
            Sandglass.views.login = new LoginView();
          }

          if( !Sandglass.views.signup ) {
            Sandglass.views.signup = new SignupView();
          }

          _.forEach( [ 'timeline',
                       'track',
                       'user' ], function( item ) {
            if( Sandglass.views.hasOwnProperty( item ) ) {
              Sandglass.views[ item ].remove();
              delete Sandglass.views[ item ];
            }
          });
        },

        logout: function() {
          Sandglass.User.logout();
        },

        track: function() {
          return new Promise(function( res, rej ) {
            /* no valid session exists */
            if( !user && !Sandglass.User ) {
              Backbone.history.navigate( 'login', { trigger : true } );
              return res();
            }

            /* login occured in the meantime */
            if( !user && Sandglass.User ) {
              user = Sandglass.User;
            }

            user
              .login()
              .then( function() {
                _.forEach( [ 'login',
                             'signup',
                             'track' ], function( item ) {
                  if( Sandglass.views.hasOwnProperty( item ) ) {
                    Sandglass.views[ item ].remove();
                    delete Sandglass.views[ item ];
                  }
                });

                if( !Sandglass.views.user ) {
                  Sandglass.views.user = new UserView({ model: user });
                }

                Sandglass.collections = {
                  activity: new ActivityCollection(),
                  project: new ProjectCollection(),
                  task: new TaskCollection()
                };

                Sandglass.views.track = new TrackView();
                Sandglass.views.timeline = new TimelineView();

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
              Sandglass.collections.activity
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