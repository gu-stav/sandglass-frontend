define([ 'lodash',
         'backbone',
         'models/user' ],
  function( _,
            Backbone,
            User ) {

  var SignupView = Backbone.View.extend({
    tagName: 'form',
    className: 'form form--signup',

    template: _.template('<h2 class="form__headline">Signup</h2>' +
                '<div class="form__group">' +
                  '<input type="text"' +
                  '       name="name"' +
                  '       placeholder="fistname lastname"' +
                  '       class="form__control" />' +
                '</div>' +

                '<div class="form__group">' +
                  '<input type="text"' +
                  '       name="email"' +
                  '       placeholder="email"'+
                  '       class="form__control" />' +
                '</div>' +

                '<div class="form__group">' +
                  '<input type="password"' +
                  '       name="password"' +
                  '       placeholder="password"' +
                  '       class="form__control" />' +
                '</div>' +

                '<div>' +
                  '<button class="button button--submit"' +
                  '        type="submit">Create user</button>' +
                '</div>'),

    events: {
      'submit': 'signup'
    },

    initialize: function() {
      this.render();
    },

    signup: function( e ) {
      e.preventDefault();

      return Backbone.promiseGenerator(function( res, rej ) {
        var email = this.$el.find('input[name="email"]').val(),
            name = this.$el.find('input[name="name"]').val(),
            password = this.$el.find('input[name="password"]').val(),

            /* TODO: define in the template */
            dateFormat = 'DD.MM.YYYY',
            timeFormat = 'HH:mm';

        if( !email || !name || !password ) {
          this.$el.addClass('form--error');
          return rej();
        } else {
          this.$el.removeClass('form--error');
        }

        new User({
          email: email,
          name: name,
          password: password,
          data: {
            dateFormat: dateFormat,
            timeFormat: timeFormat
          }
        }).create()
          .then(function( user ) {
            Backbone.history.navigate( 'track', { trigger : true } );
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