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
        if( !this.get('name') ) {
          throw new Error('No task_name given');
          rej();
        }

        this.save()
          .done(function() {
            /* TODO: workaround till #11 is fixed */
            var _attr = _.clone( this.attributes['0'] );

            this
              .clear()
              .set( _attr );

            this.toCollection();
            res( this );
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