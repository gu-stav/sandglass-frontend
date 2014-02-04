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

    initialize: function() {

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
      }).login();
    },

    toSignup: function( e ) {
      e.preventDefault();

      Backbone.history
        .navigate('signup', { trigger : true });
    }
  });

  return LoginView;
});