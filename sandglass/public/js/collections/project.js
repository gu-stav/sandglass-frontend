define([ 'lodash',
         'backbone',
         'defaults',
         'models/project',
         'models/notification' ],
  function( _,
            Backbone,
            defaults,
            Project,
            Notification ) {

  var ProjectCollection = Backbone.Collection.extend({
    url: defaults.urlRoot + 'projects/',
    model: Project,

    loadAll: function() {
      new Notification({
        type: 'success',
        text: 'Load all projects'
      });

      return this.fetch();
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

  return new ProjectCollection();
});