define([ 'lodash',
         'backbone' ],
  function( _,
            Backbone ) {

  var Logout = Backbone.View.extend({
    tagName: 'a',

    className: 'logout',

    attributes: {
      href: '/logout'
    },

    events: {
      'click': 'logout'
    },

    template: _.template('Logout'),

    logout: function( e ) {
      e.preventDefault();
      Sandglass.User.logout();
    },

    show: function() {
      this.render().$el.appendTo( 'header' );
      this.$el.text( 'Logout' );
    },

    hide: function() {
      this.$el.empty().detach();
    }
  });

  return Logout;
});