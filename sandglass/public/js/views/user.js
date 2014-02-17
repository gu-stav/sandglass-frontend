define([ 'lodash',
         'backbone' ],
  function( _,
            Backbone ) {

  var User = Backbone.View.extend({
    tagName: 'div',

    className: 'user',

    events: {
      'click .user__logout': 'logout'
    },

    template: _.template('<img class="user__image" src="https://www.gravatar.com/avatar/<%= email_md5 %>?s=40">' +
                         '<div class="user__userinfo"><strong class="user__name"><%= first_name %> <%= last_name %></strong>' +
                         '<a href="/logout" class="user__logout">Logout</a>' +
                         '</div>'),

    initialize: function() {
      this.render();
    },

    render: function() {
      this.$el.html( this.template( Sandglass.User.attributes ) );
      this.$el.appendTo( 'header' );
      return this;
    },

    logout: function( e ) {
      e.preventDefault();
      Sandglass.User.logout();
    }
  });

  return User;
});