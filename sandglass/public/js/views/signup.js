define([ 'lodash',
         'backbone',
         'defaults',
         'models/user' ],
  function( _,
            Backbone,
            defaults,
            User ) {

  var SignupView = Backbone.View.extend({
    tagName: 'form',

    className: 'signup form form--centered',

    template: _.template('<h2 class="signup__headline">Signup</h2>' +
                '<div class="signup__name-wrap">' +
                  '<input type="text" name="name" placeholder="name" class="signup__name" />' +
                '</div>' +
                '<div class="signup__email-wrap">' +
                  '<input type="text" name="email" placeholder="email" class="signup__email" />' +
                '</div>' +
                '<div>' +
                  '<button type="submit">Create user</button>' +
                '</div>'),

    events: {
      'submit': 'signup'
    },

    signup: function( e ) {
      e.preventDefault();

      var email = this.$el.find('input[name="email"]').val(),
          name = this.$el.find('input[name="name"]').val();

      new User({
        email: email,
        name: name
      }).create()
        .then(function( user ) {
          user.login();
        });
    },

    show: function() {
      this.render().$el.insertAfter( 'header' );
    },

    hide: function() {
      this.$el.empty().detach();
    },

    render: function() {
      this.$el.html( this.template() );
      return this;
    }
  });

  return SignupView;
});