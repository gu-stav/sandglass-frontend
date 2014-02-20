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

    template: _.template('<img class="user__image"' +
                         'src="<%= gravatar_url %>">' +
                         '<div class="user__userinfo">' +
                         '<strong class="user__name"><%= first_name %> ' +
                         '<%= last_name %></strong>' +
                         '<a href="/logout" class="user__logout">Logout</a>' +
                         '</div>'),

    initialize: function() {
      this.render();
    },

    /* returns url to the user gravatar image */
    getGravatarUrl: function() {
      var SIZE = 40,
          hash = this.model.get('email_md5');

      if( !hash ) {
        return undefined;
      }

      return 'https://www.gravatar.com/avatar/' +
             hash +
             '?s=' + SIZE;
    },

    render: function() {
      var _data = _.assign( {},
                            this.model.attributes,
                            { gravatar_url: this.getGravatarUrl() } );

      if( !window.navigator.onLine ) {
        _data.gravatar_url = '';
      }

      this.$el.html( this.template( _data ) );
      this.$el.appendTo( 'header' );
      return this;
    },

    logout: function( e ) {
      e.preventDefault();

      this.model
        .logout()
        .then(function() {
          Backbone.history.navigate('/login', { trigger : true });
        });
    }
  });

  return User;
});