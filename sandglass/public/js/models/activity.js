define([ 'jquery',
         'lodash',
         'backbone',
         'moment',
         'defaults' ],
  function( $,
            _,
            Backbone,
            moment,
            defaults ) {

  var Activity = Backbone.Model.extend({
    defaults: {
      start: undefined,
      end: undefined,
      taskId: undefined,
      description: undefined,
      userId: undefined,
      projectId: undefined
    },

    urlRoot: defaults.urlRoot,
    url: 'activities/'
  });

  return Activity;
});