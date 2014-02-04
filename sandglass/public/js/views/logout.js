define([ 'lodash',
         'backbone' ],
  function( _,
            Backbone ) {

  var Logout = Backbone.View.extend({
    el: '.logout',

    events: {
      'click': 'logout'
    },

    logout: function( e ) {
      e.preventDefault();
      window.Sandglass.User.logout();
    },

    show: function() {
      this.$el.show();
    },

    hide: function() {
      this.$el.hide();
    }
  });

  return Logout;
});