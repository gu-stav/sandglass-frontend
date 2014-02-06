define([ 'lodash',
         'backbone',
         'defaults' ],
  function( _,
            Backbone,
            defaults ) {

  var Project = Backbone.Model.extend({
    url: defaults.urlRoot + 'projects/',

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
          .fail( rej )
      }.bind( this ));
    },

    getById: function( id ) {
      return new Promise(function( res, rej ) {
        if( id === this.get.id('id') ) {
          return res( this );
        }

        var inCollection = Sandglass.collections.project.get( id );

        if( inCollection ) {
          return res( inCollection );
        }

        rej();
      }.bind( this ));
    },

    toCollection: function() {
      Sandglass.collections.project.add( this );
    }
  });

  return Project;
});