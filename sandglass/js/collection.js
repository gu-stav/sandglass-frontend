define(['lodash'],
  function( _ ) {
  var Collection = function() {
        this.data = [];
      },
      controls = {};

  controls = {
    findByAttribute: function( obj ) {
      return _.find( this.data, obj );
    },

    add: function( data ) {
      this.data.push( data );
    },

    removeByAttribute: function( attr, value ) {}
  };

  _.forOwn( controls, function( control, key ) {
    Collection.prototype[ key ] = control;
  });

  return Collection;
});