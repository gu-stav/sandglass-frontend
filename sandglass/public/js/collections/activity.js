define([ 'lodash',
         'backbone',
         'defaults',
         'models/activity',
         'models/notification' ],
  function( _,
            Backbone,
            defaults,
            Activity,
            Notification ) {

  var ActivityCollection = Backbone.Collection.extend({
    url: defaults.urlRoot + 'activities/',
    model: Activity,

    loadRecent: function() {
      return new Promise(function( res, rej ) {
        this.fetch()
          .done( res )
          .fail( rej );
      }.bind( this ));
    }
  });

  return new ActivityCollection();
});