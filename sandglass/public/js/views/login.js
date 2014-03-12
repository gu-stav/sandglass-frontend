/*global define*/

define([ 'lodash',
         'backbone',
         'models/user' ],
  function( _,
            Backbone,
            User ) {
  'use strict';

  var LoginView = Backbone.View.extend({
    className: 'form form--login',
    tagName: 'form',

    template: _.template( '<h2 class="form__headline">Login</h2>' +
                            '<div class="form__group">' +
                            '<input class="form__control"' +
                            '       type="text"' +
                            '       name="email"' +
                            '       placeholder="email" />' +
                          '</div>' +

                          '<div class="form__group">' +
                            '<input class="form__control"' +
                            '       type="password"' +
                            '       name="password"' +
                            '       placeholder="password" />' +
                          '</div>' +

                          '<button class="button button--submit"' +
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

      if( !email || !password ) {
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
                  Backbone.history.navigate( 'track', { trigger : true } );
                },
               function() {
                  this.$el.addClass('form--error');
                }.bind( this ));
    },

    render: function() {
      this.$el.html( this.template() );
      this.$el.insertAfter( 'header' );
    }
  });

  return LoginView;
});