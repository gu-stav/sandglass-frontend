define([ 'lodash',
         'backbone',
         'defaults',
         'models/task',
         'models/notification' ],
  function( _,
            Backbone,
            defaults,
            Task,
            Notification ) {

  var TaskCollection = Backbone.Collection.extend({
    url: defaults.urlRoot + 'tasks/',
    model: Task,

    loadAll: function() {
      new Notification({
        type: 'success',
        text: 'Load all tasks'
      });

      return this.fetch();
    }
  });

  return new TaskCollection();
});