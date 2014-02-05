define([ 'lodash',
         'backbone',
         'moment',
         'defaults',
         'models/notification' ],
  function( _,
            Backbone,
            moment,
            defaults,
            Notification ) {

  var Task = Backbone.Model.extend({
    url: defaults.urlRoot + 'tasks/',

    initialize: function() {
      if( this.isNew() ) {

        return this.save()
          .done(function() {
            new Notification({
              type: 'success',
              text: 'Create new task'
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

  return Task;
});