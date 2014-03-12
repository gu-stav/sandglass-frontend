(function() {
  var BOWER_PATH = '../../bower_components/';

  require.config({
    noGlobal: true,
    paths: {
      'moment':                 BOWER_PATH + 'momentjs/min/moment-with-langs',
      'lodash':                 BOWER_PATH + 'lodash/dist/lodash.min',
      'underscore':             BOWER_PATH + 'underscore/underscore',
      'hogan':                  BOWER_PATH + 'hogan/web/builds/2.0.0/hogan-2.0.0.amd',
      'jquery':                 BOWER_PATH + 'jquery/dist/jquery',
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
      'routes',
      'jquery.cookie',
      'views/user',
      'models/user',
      'defaults' ],
    function( _,
              Backbone,
              ROUTES,
              __cookie,
              UserView,
              User,
              defaults ) {

      /* check if the browser supports all the stuff we need */
      if( !'localStorage' in window || !'Promise' in window ) {
        throw new Error('No support for Promises or localStorage found.');
        return;
      }

      Backbone.collections = {};

      Backbone.user = $.cookie( 'user' ) ?
                        new User( JSON.parse( $.cookie( 'user' ) ) ) :
                        undefined;

      Backbone.promiseGenerator = function( callback ) {
        return new Promise( callback );
      };

      var Workspace = Backbone.Router.extend({
        _currentRoute: undefined,
        _views: {},

        /* create all routes & setup their methods */
        initialize: function() {
          _.forEach( ROUTES, function( data, route ) {
            this.route( data.route, route, function() {
              var ARGUMENTS = arguments;

              var callback = function( router ) {
                if( data.hasOwnProperty( 'mapTo' ) ) {
                  ROUTES[ data.mapTo ]
                    .initialize( router, ARGUMENTS )
                    .then(function() {
                      if( data.hasOwnProperty( 'initialize' ) ) {
                        data.initialize( router, ARGUMENTS );
                      }
                    });
                } else {
                  if( data.hasOwnProperty( 'initialize' ) ) {
                    data.initialize( router, ARGUMENTS );
                  }
                }
              };

              /* if the login property is set, make sure the user logs in
                 before */
              if( data.hasOwnProperty( 'login' ) && data.login === true ) {
                if( !Backbone.user ) {
                  return Backbone.history.navigate( 'login', { trigger : true } );
                }

                Backbone.user
                  .load()
                  .then(function( _user ) {
                    if( !this._views.user ) {
                      this._views.user = new UserView({ model: _user });
                    }

                    callback( this );
                  }.bind( this ));
              } else {
                callback( this );
              }
            });
          }.bind( this ));

          /* provide "teardown" functionality */
          this.on( 'route', function( route ) {
            /* call destroy method of the last active route */
            if( this._currentRoute ) {
              if( ROUTES[ this._currentRoute ].hasOwnProperty( 'destroy' ) ) {
                ROUTES[ this._currentRoute ].destroy( this );
              } else {
                this.destroyViews();
              }
            }

            /* when switching from a login to a non-login view, destroy
               the user explicitly */
            if( ROUTES.hasOwnProperty( route ) ) {
              if( !ROUTES[ route ].hasOwnProperty( 'login' ) ||
                  ( ROUTES[ route ].hasOwnProperty( 'login' ) &&
                    ROUTES[ route ].login !== true ) ) {
                this.destroyViews( ['user'] );
              }
            }

            /* save the current route */
            this._currentRoute = route;
          }.bind( this ));
        },

        /* destroys a set of given views or all */
        destroyViews: function( names ) {
          var _views = names || _.keys( this._views );

          _.forEach( _views, function( item ) {
            if( this._views.hasOwnProperty( item ) ) {
              this._views[ item ].remove();
              delete this._views[ item ];
            }
          }.bind( this ));
        }
      });

      new Workspace();

      Backbone.history
        .start( { pushState: true,
                  start: '/' } );
  });
})();