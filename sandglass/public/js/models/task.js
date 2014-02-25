define([ 'lodash',
         'backbone',
         'defaults' ],
  function( _,
            Backbone,
            defaults ) {

  var Task = Backbone.Model.extend({
    url: defaults.urlRoot + 'tasks/',

    create: function() {
      return new Promise(function( res, rej ) {
        if( !this.isNew() ) {
          return res();
        }

        this.save()
          .done(function() {
            this.toCollection();
            return res( this );
          }.bind( this ))
          .fail( rej );
      }.bind( this ));
    },

    getById: function( id ) {
      return new Promise(function( res, rej ) {
        if( id === this.get.id('id') ) {
          return res( this );
        }

        var inCollection = Backbone.collections.task.get( id );
        if( inCollection ) {
          return res( inCollection );
        }

        rej();
      }.bind( this ));
    },

    toCollection: function() {
      Backbone.collections.task.add( this );
    }
  });

  return Task;
});