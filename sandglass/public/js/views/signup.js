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
                  '<input type="text" name="name" placeholder="fistname lastname" class="signup__name" />' +
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

    initialize: function() {
      this.render();
    },

    signup: function( e ) {
      e.preventDefault();

      return new Promise(function( res, rej ) {
        var email = this.$el.find('input[name="email"]').val(),
          name = this.$el.find('input[name="name"]').val();

        if( !email || !name ) {
          this.$el.addClass('form--error');
          return rej();
        } else {
          this.$el.removeClass('form--error');
        }

        new User({
          email: email,
          name: name
        }).create()
          .then(function( user ) {
            user.login()
              .then( res, rej );
          });
      }.bind( this ));
    },

    render: function() {
      this.$el.html( this.template() );
      this.$el.insertAfter( 'header' );
      return this;
    }
  });

  return SignupView;
});