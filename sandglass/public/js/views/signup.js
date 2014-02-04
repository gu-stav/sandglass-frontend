define([ 'lodash',
         'backbone',
         'defaults',
         'models/user' ],
  function( _,
            Backbone,
            defaults,
            User ) {

  var LoginView = Backbone.View.extend({
    el: 'form.signup',

    events: {
      'submit': 'signup'
    },

    initialize: function() {
      this.$el.show();
    },

    signup: function( e ) {
      e.preventDefault();

      new User({
        email: this.$('input[name="email"]').val(),
        name: this.$('input[name="name"]').val()
      }).create();
    },

    show: function() {
      this.$el.show();
    },

    hide: function() {
      this.$el.hide();
    }
  });

  return LoginView;
});