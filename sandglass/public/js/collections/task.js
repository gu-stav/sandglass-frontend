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
          url: defaults.urlRoot + 'users/' + Sandglass.User.get('id') + '/tasks/'
        })
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
    },

    getNameById: function( id ) {
      var obj = this.get( id );

      if( obj ) {
        return obj.get('name');
      }
    }
  });

  return TaskCollection;
});