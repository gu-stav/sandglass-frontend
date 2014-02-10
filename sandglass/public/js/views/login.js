define([ 'lodash',
         'backbone',
         'defaults',
         'models/user' ],
  function( _,
            Backbone,
            defaults,
            User ) {

  var LoginView = Backbone.View.extend({
    el: 'form.login',

    events: {
      'click a[href="/signup"]': 'toSignup',
      'submit': 'login'
    },

    show: function() {
      this.$el.show();
    },

    hide: function() {
      this.$el.hide();
    },

    login: function( e ) {
      e.preventDefault();
      new User({
        email: this.$('input[name="email"]').val()
      }).login()
        .then( function() {},
               function() {
                this.$el.addClass('login--error');
               }.bind( this ));
    },

    toSignup: function( e ) {
      e.preventDefault();

      Backbone.history
        .navigate('signup', { trigger : true });
    }
  });

  return LoginView;
});