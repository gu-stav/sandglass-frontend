define( ['lodash'],
        function( _ ) {
  var controls,
  Storage = function() {

  };

  controls = {
    get: function( index ) {
      return JSON.parse( localStorage.getItem( index ) );
    },
    set: function( index, data ) {
      localStorage.setItem( index, data );
    }
  };

  _.forOwn( controls, function( control, key ) {
    Storage.prototype[ key ] = control;
  });

  return new Storage();
});
