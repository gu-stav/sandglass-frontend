define(['lodash',
        'moment',
        'hogan',
        'storage',
        'template.grain'],
  function( _, moment, hogan, storage, GRAIN_TEMPLATE ) {
  var Grain = function( data ) {

    this.options = {
      l10n: '',
      timelineSelector: '.timeline'
    }

    this.data = {};

    this.states = {
      track: false
    };

    if( data ) {
      _.assign( this.data, data );
    }
  },
      controls = {};

  controls = {
    start: function() {
      var _this = this;

      if( !this.__start ) {
        this.__start = moment();
      }

      if( !this.data.start ) {
        this.data.start = this.__start.format();
      }

      this.states.track = true;

      storage.push( 'grains', this.data, 'start' );

      this.render();

      this.timer = setInterval(function() {
        _this.render( 'duration' );
      }, 1000);

      return this;
    },

    restart: function() {
      var _this = this;

      this.__end = undefined;
      this.data.end = undefined;

      this.states.track = true;

      storage.push( 'grains', this.data, 'start' );

      this.timer = setInterval(function() {
        _this.render( 'duration' );
      }, 1000);

      this.render( 'duration' );

      return this;
    },

    end: function() {
      this.__end = moment();
      this.data.end = this.__end.format();

      storage.push( 'grains', this.data, 'start' );

      this.states.track = false;

      this.render();

      clearInterval( this.timer );

      return this;
    },

    update: function() {
      storage.push( 'grains', this.data, 'start' );
      this.render();
    },

    updateTime: function( intervalType ) {
      /* monkey patch for this.timer */
    },

    getDifference: function() {
      return parseInt( moment( this.__end || moment() ).diff( this.__start, 'seconds' ) );
    },

    formatDifference: function( seconds ) {
      if( seconds < 60 ) {
        if( seconds === 1 ) {
          return '1 Sekunde';
        }

        return seconds + ' Sekunden';
      }

      if( seconds < 3600 ) {
        if( seconds < 120 ) {
          return '1 Minute';
        }

        return ( parseInt( seconds / 60 ) ) + ' Minuten';
      }
    },

    delete: function() {
      storage.remove( 'grains', this.data, 'start' );
      this.$element.remove();

      return this;
    },

    _construct: function() {
      this.__start = moment( this.data.start );

      if( this.data.end ) {
        this.__end = moment( this.data.end );
        this.render();
      } else {
        this.start();
      }
    },

    _getElement: function( index ) {
      if( !this.$element ) {
        return
      }

      return this.$element.find( '.timeline__' + index );
    },

    render: function( part ) {
      var _this = this,
          _compiledTemplate,
          _data = {},
          $element,
          inlineEditing = function() {
            /* apply inline editing functions */
            _.forOwn( ['description', 'project', 'activity'], function( item ) {
              var _element = _this._getElement( item );

              /* autocomplete for description makes no sense */
              if( item !== 'description' ) {
                _element
                  .autocomplete({
                    source: function( req, res ) {
                        var _result = storage.get( 'indexed-' + item ),
                            _filtered;

                        _filtered = _.filter( _result, function( _item ) {
                          return _item.indexOf( req.term ) !== -1;
                        });

                        res( _filtered );
                      }
                  });
              }

              _element[0]
                .addEventListener( 'blur', function( e ) {
                  var _innerText = e.target.innerText;

                  _this.data[ item ] = _innerText;

                  if( item !== 'description' ) {
                    storage.push( 'indexed-' + item, _innerText );
                  }

                  _this.update();
                });
            });

            _.forOwn( ['end', 'restart', 'delete'], function( item ) {
              _this._getElement( 'item-' + item )[0]
                .addEventListener( 'click', function( e ) {
                  _this[ item ]();
                  e.preventDefault();
                });
            });
      },

      _data = this.data,
      _$renderedTemplate,
      create;

      _data.duration = this.formatDifference( this.getDifference() );
      _$renderedTemplate = $( hogan.compile( GRAIN_TEMPLATE ).render( _data ) );


      if( !this.$element ) {
        create = true;
      }

      if( create ) {
        this.$element = _$renderedTemplate;
      }

      if( this.states.track ) {
        this.$element.addClass('timeline__item--track');
      } else {
        this.$element.removeClass('timeline__item--track');
      }

      if( create ) {
        /* create new element  */
        this.$element.prependTo( this.options.timelineSelector );
        inlineEditing();
      } else {
        this._getElement( part )
          .text( _$renderedTemplate.find('.timeline__' + part ).text() );
      }
    }
  };

  _.forOwn( controls, function( control, key ) {
    Grain.prototype[ key ] = control;
  });

  return Grain;
});