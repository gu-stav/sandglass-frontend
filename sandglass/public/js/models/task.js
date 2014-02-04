define([ 'lodash',
         'backbone',
         'moment',
         'defaults' ],
  function( _,
            Backbone,
            moment,
            defaults ) {

  var Task = Backbone.Model.extend({
    urlRoot: defaults.urlRoot,
    url: 'tasks/'
  });

  return Task;
});