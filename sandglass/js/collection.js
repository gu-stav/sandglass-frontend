define( ['lodash'],
        function( _, storage ) {
    var controls,

    Collection = function( data ) {
      this.data = [];

      if( data ) {
        this.push( data );
      }
    };

    controls = {
      push: function( data, options ) {
        if( !this.data || !this.data.length ) {
          this.data = [];
        }

        /* do not duplicate data */
        if( typeof( data ) === 'string' ) {
          if( this.data.indexOf( data ) !== -1 ) {
            return this;
          }
        }

        this.data
          .push( data );

        this.sync( options || { save: true } );
        return this;
      },

      get: function() {
        return this.filtered || this.data;
      },

      findByIndex: function( searchObj ) {
        return _.where( this.get(), searchObj );
      },

      deleteByIndex: function( searchObj ) {
        this.set( _.reject(this.get(), searchObj) );
        return this;
      },

      set: function( data ) {
        this.data = data;

        this.sync();
        return this;
      },

      pop: function( data ) {
        this
          .set( _.without( this.get(), data ) )
          .sync( { save: true });
      },

      sync: function( data ) {
        if( !data ) {
          data = {
            save: false,
            reRender: false
          };
        }

        if( data.save && this.storage && this.storageIndex ) {
          this.storage.set( this.storageIndex, this.toJSON() )
        }

        if( data.reRender ) {
          this.render( data );
        }

        return this;
      },

      setStorage: function( storage, index ) {
        this.storageIndex = index;
        this.storage = storage;

        return this;
      },

      toJSON: function() {
        var _this = this,
            data = [];

        _.forOwn( this.data, function( item ) {
          var _item = _.clone( item );

          /* array of indexes, that should be saved */
          if( _this.toJSONValues ) {
            _item = _.pick( _item, _this.toJSONValues );
          }

          data.push( _item );
        });

        return JSON.stringify( data );
      },

      loadFromStorage: function( index ) {
        return this;
      },

      extend: function( data ) {
        _.extend( this, data );
        return this;
      }
    };

  _.forOwn( controls, function( control, key ) {
    Collection.prototype[ key ] = control;
  });

  return Collection;
});