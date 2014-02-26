define([ 'lodash',
         'backbone',
         'defaults' ],
  function( _,
            Backbone,
            defaults ) {

  var User = Backbone.Model.extend({
    url: defaults.urlRoot + 'users/',

    create: function() {
      return new Promise(function( res, rej ) {
        var rawName = this.get('name').split(' '),
          firstName = rawName[0],
          lastName = rawName[1],
          password = this.get('password');

        this.save( {
          email: this.get('email'),
          first_name: firstName,
          last_name: lastName
        }, {
          url: this.url + '@signup',
          silent: true
        })
          .done(function() {
            Backbone.user = this;
            return res( this );
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
          var pick = [ 'first_name',
                       'last_name',
                       'email_md5',
                       'id' ];

          this.set( _.pick( userData, pick ), { silent: true } );
          this.set( 'basic_auth', btoa( userData.token + ':' +
                                        userData.key ) );

          Backbone.user = this;
          $.cookie('user', JSON.stringify( this.attributes ) );

          /* setup auth for every following request */
          Backbone.$.ajaxSetup({
            headers: { 'Authorization': 'Basic ' + this.get('basic_auth') }
          });

          /* from now on listen to changes and save them */
          this.on( 'change', function() {
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