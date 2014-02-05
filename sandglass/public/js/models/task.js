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
      return new Promise(function( res, rej ) {
        if( !this.isNew() ) {
          return res();
        }

        this.save()
          .done( res )
          .fail( rej );
      }.bind( this ));
    },

    toCollection: function() {
      Sandglass.collections.project.add( this );
    }
  });

  return Task;
});