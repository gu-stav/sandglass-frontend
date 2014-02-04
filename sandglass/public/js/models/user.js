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
      var _this = this;

      this.save( {
        email: this.get('email'),
        first_name: this.get('name').split(' ')[0],
        last_name: this.get('name').split(' ')[1]
      } )
        .done(function() {

          window.Sandglass.User = _this;
        })
        .fail(function( xhr, type, error ) {
          new Notification( { type: 'error',
                              text: error } );
        });
    },

    login: function() {
      var _this = this;

      this.fetch( {
        data: {
          'get_by_email': this.get('email')
        }
      })
        .done(function( userData ) {
          /* nothing was found */
          if( !userData.length ) {
            new Notification( { type: 'warning',
                                text: 'User ' + _this.get('email') + ' not found' } );
            return;
          }

          $.cookie('user', JSON.stringify( _this.attributes ) );
          window.Sandglass.User = _this;

          new Notification( { type: 'success',
                              text: 'Login successful' } );

          Backbone.history
            .navigate('track', { trigger : true });
        })
        .fail(function( xhr, type, error ) {
          new Notification( { type: 'error',
                              text: error || 'Server unreachable' } );
        });
    },

    logout: function() {
      $.removeCookie('user');

      window.Sandglass.User = undefined;

      new Notification( { type: 'success',
                              text: 'Logout successful' } );

      Backbone.history
            .navigate('/', { trigger : true });
    }
  });

  return User;
});