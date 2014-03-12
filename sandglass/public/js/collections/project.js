/*global define*/

define([ 'lodash',
         'backbone',
         'defaults',
         'models/project' ],
  function( _,
            Backbone,
            defaults,
            Project ) {
  'use strict';

  var ProjectCollection = Backbone.Collection.extend({
    url: defaults.urlRoot + 'projects/',
    model: Project,

    loadAll: function() {
      return Backbone.promiseGenerator(function( res, rej ) {
        this.fetch({
          url: defaults.urlRoot + 'users/' +
               Backbone.user.get('id') +
               '/projects/'
        }).done( res )
          .fail( rej );
      }.bind( this ));
    },

    /* returns a new array for jquery ui key:value */
    getAutocompleteList: function() {
      return _.map( this.models, function( model ) {
        return {
          value: model.get('id'),
          label: model.get('name')
        };
      });
    },

    /* return the name of a project by the given id */
    getNameById: function( id ) {
      var obj = this.get( id );

      if( obj ) {
        return obj.get('name');
      }

      return undefined;
    }
  });

  return ProjectCollection;
});