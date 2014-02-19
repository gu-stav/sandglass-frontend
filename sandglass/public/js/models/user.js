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
          url: this.url + '?signup'
        })
          .done(function() {
            Sandglass.User = this;
            return res( this );
          }.bind( this ));
      }.bind( this ));
    },

    login: function() {
      return new Promise(function( res, rej ) {
        $.ajax({
          type: "POST",
          url: this.url + '?signin',
          data: JSON.stringify( this.attributes ),
          processData: false,
          contentType: 'application/json'
        })
        .done(function( userData ) {
          var pick = [ 'first_name',
                       'last_name',
                       'email_md5',
                       'id' ];

          this.set( _.pick( userData, pick ) );
          this.set( 'basic_auth', btoa( userData.token + ':' +
                                        userData.key ) );

          Sandglass.User = this;

          /* setup auth for every following request */
          Backbone.$.ajaxSetup({
            headers: { 'Authorization': 'Basic ' + this.get('basic_auth') }
          });

          if( !Sandglass.getUserData() ) {
            /* TODO: save user to localstorage */
            Sandglass.setUserData( this.attributes );
          }

          Backbone.history.navigate('/track', { trigger : true });

          return res( this );
        }.bind( this ))
        .fail( rej );
      }.bind( this ));
    },

    logout: function() {
      return new Promise(function( res, rej ) {

        Sandglass.User = undefined;

        Sandglass.deleteUserData();
        Backbone.history.navigate('/', { trigger : true });

      }.bind( this ));
    }
  });

  return User;
});