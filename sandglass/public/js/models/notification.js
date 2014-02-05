define([ 'lodash',
         'backbone' ],
  function( _,
            Backbone ) {

  var Notification = Backbone.Model.extend({
    initialize: function() {
      window.Sandglass.collections.notification.add( this );
    }
  });

  return Notification;
});