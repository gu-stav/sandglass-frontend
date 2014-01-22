define( ['lodash',
         'moment',
         'template.grain'],
        function( _, moment, templateGrain ) {

  var controls,

  Grain = function( data ) {
    var parseDescription = function( text ) {
      return text.replace( /(#[a-zA-Z\-_]+)/gi, '<a href="$1">$1</a>' );
    };

    if( !data ) {
      data = {};
    }

    this.clientId = _.uniqueId( 'grain-' );
    this.serverId = data.id || undefined;
    this.description = parseDescription( data.description ) || '';
    this.activity = data.activity || '';
    this.project = data.project || '';
    this.changed = false;
    this.element = undefined;
    this.running = false;
    this.visible = true;
    this.collections = {};

    this.started = data.started ? moment( data.started ) : undefined;
    this.ended = data.ended ? moment( data.ended ) : undefined;

    this._timer = undefined;
  };

  controls = {
    start: function() {
      if( this.running ) {
        return this;
      }

      if( !this.started ) {
        this.started = moment();
      }

      this.running = true;
      this.getCollection('grain').sync( {save: true,
                                         reRender: true} );

      return this;
    },

    end: function() {
      if( !this.running ) {
        return this;
      }

      this.ended = moment();
      this.running = false;
      this._setUpdateInterval( 'clear' );
      this.getCollection('grain').sync( {save: true,
                                         reRender: true} );

      return this;
    },

    restart: function() {
      if( this.running ) {
        return this;
      }

      this.ended = undefined;
      this.running = true;
      this.getCollection('grain').sync( {save: true,
                                         reRender: true} );

      return this;
    },

    delete: function() {
      this.element.remove();
      this.getCollection('grain')
        .deleteByIndex({ clientId: this.clientId})
        .sync( {save: true, reRender: true} );
    },

    show: function() {
      if( this.visible ) {
        return this;
      }

      this.visible = true;
      this.element.removeClass('timeline__item--hidden');
    },

    hide: function() {
      if( !this.visible ) {
        return;
      }

      /* never hide running grains */
      if( this.running ) {
        return this;
      }

      this.visible = false;

      this.element.addClass('timeline__item--hidden');
    },

    setCollection: function( index, collection ) {
      this.collections[ index ] = collection;
      return this;
    },

    getCollection: function( index ) {
      return this.collections[ index ] || undefined;
    },

    /* update the values of the template */
    update: function( part ) {
      var _this = this,
          $updatedTemplate = this._getRenderedTemplate(),
          toUpdate = part || ['activity',
                              'project',
                              'duration',
                              'description',
                              'startGrouped',
                              'parsedStarted',
                              'parsedEnded'];

      if( this.running ) {
        this.element.addClass('timeline__item--track');
      } else {
        this.element.removeClass('timeline__item--track');
      }

      _.forOwn( toUpdate,
                function( element ) {
                  var newText = $updatedTemplate.find(".timeline__" + element).text();
                  _this.element
                    .find(".timeline__" + element)
                    .text( newText );
                })

      return this;
    },

    _setUpdateInterval: function( intervalType ) {
      if( !intervalType ) {
        intervalType = 'second';
      }

      var _this = this,
          _time;

      switch( intervalType ) {
        case 'second':
          _time = 1000;
        break;
        case 'minute':
          _time = ( 1000 / 3 ) * 60;
        break;
        case 'hour':
          _time = ( 1000 / 3 ) * 3600;
        break;
      }

      if( _time === this._updateInterval ) {
        return this;
      }

      this._updateInterval = _time;

      clearInterval( this.timer );

      this.timer = setInterval(function() {
        _this.render( ['duration', 'group'] );
      }, _time);

      return this;
    },

    _getRenderedTemplate: function() {
      var formatDifference = function( seconds ) {
            if( seconds < 60 ) {
              if( seconds === 1 ) {
                return '1sec';
              }

              return seconds + 'sec';
            }

            if( seconds < 3600 ) {
              if( seconds < 120 ) {
                return '1min';
              }

              return ( parseInt( seconds / 60 ) ) + 'min';
            }

            if( seconds < 3600 * 60 * 24 ) {
              if( seconds === 3600 * 60 ) {
                return '1h'
              }

              var _minutes = parseInt( ( seconds - ( parseInt( seconds / 3600 ) * 3600 ) ) / 60 );

              return ( parseInt( seconds / 3600 ) ) + 'h, ' + _minutes + 'min';
            }
          },

          extraData = {
            duration: formatDifference( this.duration ),
            group: this.startGrouped || '',
            parsedStarted: this.started.format('HH:mm:ss'),
            parsedEnded: this.ended ? this.ended.format('HH:mm:ss') : ''
          },

          templateData = _.pick( _.assign( _.clone(this), extraData ),
                                 ['activity',
                                  'project',
                                  'duration',
                                  'description',
                                  'startGrouped',
                                  'parsedStarted',
                                  'parsedEnded'] ),
          $template = $( _.template( templateGrain, templateData ) );

      return $template;
    },

    render: function( part ) {
      var _this = this;

      this.duration = parseInt( moment( this.ended || moment() )
                                .diff( this.started, 'seconds' ) );

      /* element is already rendered - only update the element */
      if( this.element ) {
        return this.update( part );
      }

      var $template = this._getRenderedTemplate();

      /* apply inline editing functions */
      _.forOwn( ['description', 'project', 'activity'], function( item ) {
        var _element = $template.find( '.timeline__' + item );

        /* autocomplete for description makes no sense */
        if( item !== 'description' ) {
          _element
            .autocomplete({
              source: function( req, res ) {
                var _term = req.term,
                    _results = [],
                    _collection = _this.getCollection( item );

                if( _collection ) {
                  _.forOwn( _collection.get(), function( item ) {
                    if( item.indexOf( _term ) !== -1 ) {
                      _results.push( item );
                    }
                  });

                  res( _results );
                }

                return false;
              }
            });
        }

        _element[0]
          /* prevent linebreaks */
          .addEventListener('keypress', function( e ){
            var _forbidden = [13],
                _code = e.charCode;

            if( _forbidden.indexOf( _code ) !== -1 ) {
              e.preventDefault();
              e.stopPropagation();
            }
          });

        _element[0]
          .addEventListener( 'blur', function( e ) {
            _this[ item ] = e.target.innerText;
            _this.getCollection( item ).push( e.target.innerText );
            _this.getCollection( 'grain' ).sync( {save: true} );
          });
      });

      _.forOwn( ['parsedStarted', 'parsedEnded'], function( item ) {
        $template.find('.timeline__' + item)
          .on('blur', function( e ) {
            var _value = $(e.target).text(),
                _index = item === 'parsedStarted' ? 'started' : 'ended';

            _this[ _index ]
              .hours( _value.substr(0,2) )
              .minutes( _value.substr(3,2) )
              .seconds( _value.substr(6,2) );

            _this.getCollection( 'grain' ).sync( {reRender: true,
                                                  save: true});
          });
      })

      _.forOwn( ['end', 'restart', 'delete'], function( item ) {
        $template.find( '.timeline__item-' + item )[0]
          .addEventListener( 'click', function( e ) {
            _this[ item ]();
            e.preventDefault();
          });
      });

      if( !this.running ) {
        $template.removeClass('timeline__item--track');
      }

      this.element =
        $template.appendTo( '.timeline' );

      if( !this.running ) {
        this._setUpdateInterval('clear');
        return;
      }

      if( this.duration < 60 ) {
        this._setUpdateInterval( 'second' );
      } else {
        this._setUpdateInterval( 'minute' );
      }
    }
  };

  _.forOwn( controls, function( control, key ) {
    Grain.prototype[ key ] = control;
  });

  return Grain;
});