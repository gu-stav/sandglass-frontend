define([ 'lodash',
         'backbone',
         'moment',
         'defaults',
         'models/Notification' ],
  function( _,
            Backbone,
            moment,
            defaults,
            Notification ) {

  var Project = Backbone.Model.extend({
    url: defaults.urlRoot + 'projects/',

    initialize: function() {
      if( this.isNew() ) {
        return this.save()
          .done(function() {
            new Notification({
              type: 'success',
              text: 'Create new project'
            });
          })
          .fail(function( data ) {
            new Notification({
              type: 'error',
              text: data.responseText
            })
          });
      }
    },

    toCollection: function() {
      Sandglass.collections.project.add( this );
    }
  });

  return Project;
});