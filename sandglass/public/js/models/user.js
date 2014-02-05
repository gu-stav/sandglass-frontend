define([ 'lodash',
         'backbone',
         'defaults',
         'models/Notification' ],
  function( _,
            Backbone,
            defaults,
            Notification ) {

  var User = Backbone.Model.extend({
    url: defaults.urlRoot + 'users/',

    create: function() {
      var rawName = this.get('name').split(' '),
          firstName = rawName[0],
          lastName = rawName[1];

      return new Promise(function( res, rej ) {
        this.save( {
          email: this.get('email'),
          first_name: firstName,
          last_name: lastName
        })
          .done(function() {
            Sandglass.User = this;

            return res();
          }.bind( this ));
      }.bind( this ));
    },

    login: function() {
      return new Promise(function( res, rej ) {
        this.fetch( {
          data: {
            'call': 'user_by_credential',
            'email' : this.get('email')
          }
        })
        .done(function( userData ) {
          Sandglass.User = this;
          $.cookie('user', JSON.stringify( this.attributes ) );
          Backbone.history.navigate('track', { trigger : true });

          return res();
        }.bind( this ));
      }.bind( this ));
    },

    logout: function() {
      return new Promise(function( res, rej ) {
        window.Sandglass.User = undefined;
        $.removeCookie('user');
        Backbone.history.navigate('/', { trigger : true });
      }.bind( this ));
    }
  });

  return User;
});