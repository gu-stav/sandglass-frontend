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
      'views/userSettings',
      'models/user',
      'collections/activity',
      'collections/project',
      'collections/task' ],
    function( _,
              Backbone,
              __cookie,
              LoginView,
              TrackView,
              SignupView,
              TimelineView,
              UserView,
              UserSettings,
              User,
              ActivityCollection,
              ProjectCollection,
              TaskCollection ) {

      /* check if the browser supports all the stuff we need */
      if( !'localStorage' in window || !'Promise' in window ) {
        alert('Your browser is not supported. For details see console.');
        throw new Error('No support for Promises or localStorage found.');

        return;
      }

      Backbone.collections = {};
      Backbone.user = $.cookie( 'user' ) ?
                        new User( JSON.parse( $.cookie( 'user' ) ) ) :
                        undefined;

      var Workspace = Backbone.Router.extend({
        routes: {
          '':        'start',
          'login':   'login',
          'logout':  'logout',
          'track':   'track',
          'user-settings': 'userSettings',
          'track/:id/edit': 'activity_edit'
        },

        _views: {},

        start: function() {
          Backbone.history.navigate('track', { trigger : true });
        },

        userSettings: function() {
          return new Promise(function( res, rej ) {
            if( !Backbone.user ) {
              Backbone.history.navigate( 'login', { trigger : true } );
              return res();
            }

            Backbone.user
              .login()
              .then(function() {
                _.forEach( [ 'timeline',
                             'track' ], function( item ) {
                  if( this._views.hasOwnProperty( item ) ) {
                    this._views[ item ].remove();
                    delete this._views[ item ];
                  }
                }.bind( this ));

                if( !this._views.user ) {
                  this._views
                    .user = new UserView({ model: Backbone.user });
                }

                /* render user settings */
                if( !this._views.userSettings ) {
                  this._views
                    .userSettings = new UserSettings({ model: Backbone.user });
                }

              }.bind( this ))
          }.bind( this ));
        },

        login: function() {
          if( !this._views.login ) {
            this._views.login = new LoginView();
          }

          if( !this._views.signup ) {
            this._views.signup = new SignupView();
          }

          _.forEach( [ 'timeline',
                       'track',
                       'user' ], function( item ) {
            if( this._views.hasOwnProperty( item ) ) {
              this._views[ item ].remove();
              delete this._views[ item ];
            }
          }.bind( this ));
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
                  if( this._views.hasOwnProperty( item ) ) {
                    this._views[ item ].remove();
                    delete this._views[ item ];
                  }
                }.bind( this ));

                if( !this._views.user ) {
                  this._views.user = new UserView({ model: Backbone.user });
                }

                Backbone.collections = {
                  activity: new ActivityCollection(),
                  project: new ProjectCollection(),
                  task: new TaskCollection()
                };

                this._views.track = new TrackView({
                  collection: Backbone.collections.activity
                });

                this._views.timeline = new TimelineView({
                  collection: Backbone.collections.activity
                });
              }.bind( this ),
              function() {
                user.logout();
              });
          }.bind( this ));
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