define( ['lodash'],
        function() {
          var Storage = function() {
            if( !'localStorage' in window ) {
              console.log('localstorage not supported');
            }

            this.storage = localStorage;
          },
              controls = {};

          controls = {
            push: function( index, data, pluck ) {
              var _result = this.get( index );

              if( !_result ) {
                _result = [];
              }

              if( typeof data === 'string' ) {
                if( _.indexOf( _result, data ) === -1 ) {
                  _result.push( data );
                }
              }

              if( _.isArray( data ) ) {
                _result.push( data );
                _result = _.flatten( _result );
              }

              if( _.isObject( data ) ) {
                if( !pluck ) {
                  _result.push( data );
                } else {
                  if( _.pluck( _result, pluck ).indexOf( data[ pluck ] ) === -1 ) {
                    _result.push( data );
                  } else {
                    var _updatedResults = [];

                    _.forOwn( _result, function( item, index ) {
                      if( item[ pluck ] === data[ pluck ] ) {
                        _updatedResults.push( data );
                      } else {
                        _updatedResults.push( item );
                      }
                    });

                    _result = _updatedResults;
                  }
                }


              }

              _result = _.compact( _.union( _result.sort() ) );

              this.storage.setItem( index, JSON.stringify( _result ) );

              return _result;
            },

            /* return a full dataset */
            get: function( index ) {
              var _result = this.storage.getItem( index ),
                  _parsed;

              if( _result ) {
                _parsed = JSON.parse( _result );
              }

              return _parsed;
            },

            /* set/ overwrite data completly by given index */
            set: function( index, data ) {
              this.storage.setItem( index, JSON.stringify( data ) );
            },

            /* find within the storage */
            find: function( index, pData, pluck ) {
              var _rawdata = this.get( index ),
                  _data = [];

              _.forOwn( _rawdata, function( item, index ) {
                if( item[ pluck ] === pData[ pluck ] ) {
                  _data.push( item );
                }
              });

              return _data;
            },

            /* remove data by given data and plucks */
            remove: function( index, pData, pluck ) {
              var _rawdata = this.get( index ),
                  _data = [];

              _.forOwn( _rawdata, function( item, index ) {
                if( item[ pluck ] !== pData[ pluck ] ) {
                  _data.push( item );
                }
              });

              this.set( index, _data );
              return _data;
            }
          };

          _.forOwn( controls, function( control, key ) {
            Storage.prototype[ key ] = control;
          });

          return new Storage();
});