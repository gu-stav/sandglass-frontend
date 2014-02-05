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
      return new Promise(function( res, rej ) {
        this.fetch()
          .done( res )
          .fail( rej )
      }.bind( this ));
    },

    getAutocompleteList: function() {
      return _.map( this.models, function( model ) {
        return {
          value: model.get('id'),
          label: model.get('name')
        }
      })
    }
  });

  return new TaskCollection();
});