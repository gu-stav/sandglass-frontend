define([ 'lodash',
         'backbone',
         'defaults' ],
  function( _,
            Backbone,
            defaults ) {

  var User = Backbone.Model.extend({
    url: defaults.urlRoot + 'users/',

    create: function() {
      if( this.get('id') ) {
        throw new Error('there is already a user. Please reload the page.');
        return this.logout();
      }

      return new Promise(function( res, rej ) {
        var rawName = this.get('name').split(' '),
          firstName = rawName[0],
          lastName = rawName[1],
          password = this.get('password');

        this.save( {
          email: this.get('email'),
          first_name: firstName,
          last_name: lastName,
          password: password
        }, {
          url: this.url + '@signup',
          silent: true
        })
          .done(function() {
            this.login()
              .then( res );
          }.bind( this ));
      }.bind( this ));
    },

    load: function() {
      return new Promise(function( res, rej ) {
        var basicAuth,
            _user = Backbone.user,
            token = _user.get('token'),
            key = _user.get('key');

        /* no credentials found - login first */
        if( !_user ) {
          Backbone.history.navigate( 'login', { trigger : true } );
          return res();
        }

        /* user and token, key found */
        if( _user && token && key ) {
          /* if this.saveAuthHeader() was already called, there is no
             need to reparse the information */
          basicAuth = _user.get( 'basic_auth' );

          if( !basicAuth ) {
            basicAuth = this.getAuthHeader( token, key );
          }
        } else {
          /* invalid or non existent login data */
          Backbone.history.navigate( 'login', { trigger : true } );
          return res( _user );
        }

        /* in this case the user at least logged in */
        this.setupAuthentication( basicAuth );
        this.saveAuthHeader( token, key );

        /* user data was already loaded */
        if( _user.get('id') ) {
          this.addListener();
          return res( _user );
        } else {
          Backbone.$.getJSON( this.url + '@search?token=' +
                              token + '&key=' + key )
            .done(function( userData ) {

              this.set( userData );
              this.addListener();

              return res( this );

            }.bind( this ))
            .fail(function() {
              Backbone.history.navigate( 'login', { trigger : true } );
              return rej();
            })
        }
      }.bind( this ));
    },

    /* set basic_auth property of user, for reuse */
    saveAuthHeader: function( token, key ) {
      this.set( 'basic_auth',
                 this.getAuthHeader( token, key ),
                 { silent: true } );

      return this;
    },

    /* setup auth for every following request */
    setupAuthentication: function( hash ) {
      Backbone.$.ajaxSetup({
        headers: { 'Authorization': 'Basic ' + hash }
      });

      return this;
    },

    getAuthHeader: function( token, key ) {
      return btoa( token + ':' + key );
    },

    addListener: function() {
      this
        .off( 'change' )
        .on( 'change', function() {
          this.save( {
            /* TODO: find a better solution than this */
            password: undefined,
            key: undefined,
            email_md5: undefined,
            basic_auth: undefined,
            token: undefined,
            modified: undefined
          }, {
            url: this.url + this.get('id') + '/',
            silent: true
          })
            .then(function() {
              this.trigger( 'updated' );
            }.bind( this ));
      }.bind( this ));
    },

    login: function() {
      return new Promise(function( res, rej ) {
        $.ajax({
          type: "POST",
          url: this.url + '@signin',
          data: JSON.stringify( this.attributes ),
          processData: false,
          contentType: 'application/json'
        })
        .done(function( userData ) {
          var cookieAttributes = [ 'token',
                                   'key' ];

          this.saveAuthHeader( userData.token, userData.key );
          this.set( userData );
          this.unset( 'password' );

          Backbone.user = this;

          /* only save basic auth informations to cookie */
          $.cookie( 'user',
                    JSON.stringify( _.pick( this.attributes,
                                            cookieAttributes ) ) );

          this.setupAuthentication( this.get('basic_auth') );
          this.addListener();

          return res( this );
        }.bind( this ))
        .fail( rej );
      }.bind( this ));
    },

    logout: function() {
      return new Promise(function( res, rej ) {
        if( Backbone.hasOwnProperty('user') ) {
          Backbone.user = undefined;
        }

        $.removeCookie('user');
        res();
      });
    }
  });

  return User;
});