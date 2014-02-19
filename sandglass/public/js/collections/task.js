define([ 'lodash',
         'backbone',
         'defaults',
         'models/task' ],
  function( _,
            Backbone,
            defaults,
            Task ) {

  var TaskCollection = Backbone.Collection.extend({
    url: defaults.urlRoot + 'tasks/',
    model: Task,

    loadAll: function() {
      return new Promise(function( res, rej ) {
        this.fetch({
          url: defaults.urlRoot + 'users/' +
               Sandglass.User.get('id') +
               '/tasks/'
        }).done( res )
          .fail( rej )
      }.bind( this ));
    },

    /* returns a new array for jquery ui key:value */
    getAutocompleteList: function() {
      return _.map( this.models, function( model ) {
        return {
          value: model.get('id'),
          label: model.get('name')
        }
      })
    },

    /* return the name of a task by the given id */
    getNameById: function( id ) {
      var obj = this.get( id );

      if( obj ) {
        return obj.get('name');
      }

      return undefined;
    }
  });

  return TaskCollection;
});