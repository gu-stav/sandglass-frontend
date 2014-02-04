define([ 'lodash',
         'backbone',
         'moment',
         'defaults' ],
  function( _,
            Backbone,
            moment,
            defaults ) {

  var Project = Backbone.Model.extend({
    urlRoot: defaults.urlRoot,
    url: 'projects/'
  });

  return Project;
});