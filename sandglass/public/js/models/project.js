define([ 'lodash',
         'backbone',
         'defaults' ],
  function( _,
            Backbone,
            defaults ) {

  var Project = Backbone.Model.extend({
    url: defaults.urlRoot + 'projects/',

    /* #11 */
    parse: function ( data ) {
      if( data.hasOwnProperty( '0' ) ) {
        return data['0'];
      } else {
        return data;
      }
    },

    create: function() {
      return new Promise(function( res, rej ) {

        if( !this.get('name') ) {
          throw new Error('No task_name given');
          rej();
        }

        this.save()
          .done(function() {
            this.toCollection();
            res( this );
          }.bind( this ))
           .fail( rej )
      }.bind( this ));
    },

    getById: function( id ) {
      return new Promise(function( res, rej ) {
        if( id === this.get.id('id') ) {
          return res( this );
        }

        var inCollection = Backbone.collections.project.get( id );

        if( inCollection ) {
          return res( inCollection );
        }

        rej();
      }.bind( this ));
    },

    toCollection: function() {
      Backbone.collections.project.add( this );
      return this;
    }
  });

  return Project;
});