define([ 'lodash',
         'backbone',
         'defaults',
         'models/user' ],
  function( _,
            Backbone,
            defaults,
            User ) {

  var LoginView = Backbone.View.extend({
    className: 'login form',
    tagName: 'form',

    template: _.template( '<input class="login__email"' +
                          '       type="text"' +
                          '       name="email"' +
                          '       placeholder="email" />' +

                          '<input class="login__password"' +
                          '       type="password"' +
                          '       name="password"' +
                          '       placeholder="password" />' +

                          '<button class="button login__submit"' +
                          '        type="submit">Login</button>' ),

    events: {
      'submit': 'login'
    },

    initialize: function() {
      this.render();
    },

    login: function( e ) {
      e.preventDefault();

      var email = this.$('input[name="email"]').val(),
          password = this.$('input[name="password"]').val();

      if( !email ) {
        this.$el.addClass('form--error');
        return;
      } else {
        this.$el.removeClass('form--error');
      }

      new User({
        email: email,
        password: password
      }).login()
        .then( function() {
                 Sandglass.User = user;
                 Backbone.history.navigate('track', { trigger : true });
               },
               function() {
                 this.$el.addClass('form--error');
               }.bind( this ));
    },

    render: function() {
      this.$el.html( this.template() );
      this.$el.appendTo( 'header' );
      this.$el.find('input:first-child').focus();
    }
  });

  return LoginView;
});