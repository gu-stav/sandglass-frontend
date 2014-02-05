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
      new Notification({
        type: 'success',
        text: 'Load recent activities'
      });

      return this.fetch();
    }
  });

  return new ActivityCollection();
});