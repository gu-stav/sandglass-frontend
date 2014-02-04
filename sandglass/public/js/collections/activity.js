define([ 'jquery',
         'lodash',
         'backbone',
         'defaults',
         'models/activity' ],
  function( $,
            _,
            Backbone,
            defaults,
            Activity ) {

  var ActivityCollection = Backbone.Model.extend({
    url: defaults.urlRoot + 'activities/',
    model: Activity
  });

  return ActivityCollection;
});