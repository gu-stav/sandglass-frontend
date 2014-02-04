define([ 'lodash',
         'backbone' ],
  function( _,
            Backbone ) {

  var Notification = Backbone.Model.extend({
    defaults: {
      type: 'error',
      text: ''
    },

    initialize: function() {
      window.Sandglass.collections.notification.add( this );
    }
  });

  return Notification;
});