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
          lastName = rawName[1];

        this.save( {
          email: this.get('email'),
          first_name: firstName,
          last_name: lastName
        })
          .done(function() {
            Sandglass.User = this;
            return res( this );
          }.bind( this ));
      }.bind( this ));
    },

    login: function() {
      return new Promise(function( res, rej ) {
        this.fetch({
          data: {
            'search': '',
            'email' : this.get('email')
          }
        })
        .done(function( userData ) {
          $.cookie('user', JSON.stringify( this.attributes ) );
          return res( this );
        }.bind( this ))
        .fail( rej );
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