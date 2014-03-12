define( [ 'backbone',
          'lodash',
          'views/login',
          'views/track',
          'views/signup',
          'views/timeline',
          'views/user',
          'views/userSettings',
          'collections/activity',
          'collections/project',
          'collections/task' ],
        function( Backbone,
                  lodash,
                  LoginView,
                  TrackView,
                  SignupView,
                  TimelineView,
                  UserView,
                  UserSettings,
                  ActivityCollection,
                  ProjectCollection,
                  TaskCollection ) {

var ROUTES = {
      'start': {
        route: '',
        login: false,
        initialize: function() {
          return Backbone.promiseGenerator(function( res, rej ) {
            Backbone.history.navigate( 'track', { trigger : true } );
            res();
          });
        }
      },

      'login': {
        route: 'login',
        initialize: function( router ) {
          return Backbone.promiseGenerator(function( res, rej ) {
            if( !router._views.login ) {
              router._views.login = new LoginView();
            }

            if( !router._views.signup ) {
              router._views.signup = new SignupView();
            }

            if( !router._views.login ) {
              router._views.login = new LoginView();
            }

            res();
          });
        },

        destroy: function( router ) {
          router.destroyViews( [ 'login', 'signup' ] );
        }
      },

      'logout': {
        route: 'logout',
        login: false
      },

      'activity_edit': {
        route: 'track/:id/edit',
        login: true,
        mapTo: 'track',
        initialize: function( router, args ) {
          return Backbone.promiseGenerator(function( res, rej ) {

            Backbone.collections.activity
              .get( args[0] )
                ._view
                .edit();

            res();
          });
        }
      },

      'track': {
        route: 'track',
        login: true,
        initialize: function( router ) {
          return Backbone.promiseGenerator(function( res, rej ) {
            Backbone.collections = {
              activity: new ActivityCollection(),
              project: new ProjectCollection(),
              task: new TaskCollection()
            };

            router._views.track = new TrackView({
              collection: Backbone.collections.activity
            });

            router._views.timeline = new TimelineView({
              collection: Backbone.collections.activity
            });

            router._views.timeline
              .setup()
              .then(function() {
                res();
              });
          });
        },

        destroy: function( router ) {
          router.destroyViews( [ 'track', 'timeline' ] );
        }
      },

      'userSettings': {
        route: 'user-settings',
        login: true,
        initialize: function( router ) {
          return Backbone.promiseGenerator(function( res, rej ) {
            router._views.userSettings = new UserSettings({
              model: Backbone.user
            });
          });
        },

        destroy: function( router ) {
          router.destroyViews( [ 'userSettings' ] );
        }
      }
  };

  return ROUTES;
});