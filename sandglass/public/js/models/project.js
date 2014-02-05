define([ 'lodash',
         'backbone',
         'moment',
         'defaults',
         'models/Notification' ],
  function( _,
            Backbone,
            moment,
            defaults,
            Notification ) {

  var Project = Backbone.Model.extend({
    url: defaults.urlRoot + 'projects/',

    initialize: function() {
      return new Promise(function( res, rej ) {
        if( !this.isNew() ) {
          return res();
        }

        this.save()
          .done( res )
          .rej( rej )
      }.bind( this ));
    },

    toCollection: function() {
      Sandglass.collections.project.add( this );
    }
  });

  return Project;
});