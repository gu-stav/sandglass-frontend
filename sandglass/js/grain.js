define( ['lodash',
         'moment',
         'template.grain',
         'defaults'],
        function( _, moment, templateGrain, defaults ) {

  moment.lang( defaults.language );

  var controls,

  Grain = function( data ) {
    if( !data ) {
      data = {};
    }

    this.clientId = _.uniqueId( 'grain-' );
    this.serverId = data.id || undefined;
    this.activity = data.activity || '';
    this.project = data.project || '';
    this.changed = false;
    this.element = undefined;
    this.running = false;
    this.visible = true;
    this.collections = {};

    this.setDescription( data.description || '' );

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
      this.getCollection('grain')
        .sync( { save: true,
                 reRender: true } );

      return this;
    },

    end: function() {
      if( !this.running ) {
        return this;
      }

      this.ended = moment();
      this.running = false;
      this._setUpdateInterval( 'clear' );
      this.getCollection('grain')
        .sync( { save: true,
                 reRender: true } );

      return this;
    },

    restart: function() {
      if( this.running ) {
        return this;
      }

      $('.track__activity').val( this.activity );
      $('.track__project').val( this.project );
      $('.track__description').val( this.description );

      $('.track').trigger('submit');

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

    setDescription: function( val ) {
      this.description = val;
      this.parsedDescription = this.description
                                .replace( /(#[a-zA-Z\-_]+)/gi,
                                          '<a class="timeline__tag" href="$1">$1</a>' );

      return this;
    },

    getDescription: function( parsed ) {
      return parsed ? this.parsedDescription : this.description;
    },

    /* update the values of the template */
    update: function( part, data ) {
      if( !this.running ) {
        this._setUpdateInterval('clear');
      }

      this._setUpdateInterval( 'minute' );

      var _this = this,
          $updatedTemplate = this._getRenderedTemplate( data ),
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

      if( (data && !data.conflictWithBefore) || !data ) {
        this.element.removeClass('timeline__item--conflictWithPrevious');
      } else {
        this.element.addClass('timeline__item--conflictWithPrevious');
      }

      this._updatePosition( data );

      _.forOwn( toUpdate,
                function( element ) {

                  /* description could contain html (tags), so we update the full
                     innerHtml here */
                  if( element === 'description' ) {
                    var _html = $updatedTemplate.find('.timeline__description').html();

                    _this.element
                      .find('.timeline__description')
                      .html( _html );

                    return this;
                  }

                  var newText = $updatedTemplate.find(".timeline__" + element).text();

                  _this.element
                    .find(".timeline__" + element)
                    .text( newText );
                })

      return this;
    },

    _setUpdateInterval: function( intervalType ) {
      if( !intervalType ) {
        intervalType = 'minute';
      }

      var _this = this,
          _time;

      switch( intervalType ) {
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

    _getRenderedTemplate: function( data ) {
      if( !data ) {
        data = {};
      }

      var formatDifference = function( seconds ) {
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
            parsedStarted: this.started ? this.started.format( defaults.timeFormat ) : '',
            parsedEnded: this.ended ? this.ended.format( defaults.timeFormat ) : '',
            conflictWithBefore: data.conflictWithBefore,
            parsedDescription: this.getDescription( true )
          },

          templateData = _.pick( _.assign( _.clone(this), extraData ),
                                 ['activity',
                                  'project',
                                  'duration',
                                  'parsedDescription',
                                  'startGroupedParsed',
                                  'parsedStarted',
                                  'parsedEnded',
                                  'conflictWithBefore'] ),
          $template = $( _.template( templateGrain, templateData ) );

      return $template;
    },

    _updatePosition: function( data ) {
      var search = this.startGrouped.replace(' ', '-'),
          $wrapper = $('.timeline'),
          $target = $wrapper.children('ul[data-group="' + search + '"]'),
          elementIndex;

      if( this.element.parent('ul[data-group="' + search + '"]').length !== 0 ) {
        elementIndex = this.element.index();

        if( data && data.index ) {
          if( data.index != elementIndex ) {
            var $orientation =
              this.element.parent('ul[data-group="' + search + '"]')
                .children()
                .eq( data.index );

            if( data.index == 0 ) {
              this.element.insertBefore( $orientation );
            } else {
              this.element.insertAfter( $orientation );
            }
          }
        }

        return this;
      }

      if( !$target.length ) {
        $target =
          $('<ul/>')
            .addClass('timeline__group-ul')
            .attr('data-group', search )
            [ data && data.start ? 'prependTo' : 'appendTo' ]( $wrapper );
      }

      this.element
        .appendTo( $target );
    },

    render: function( part, data ) {
      var _this = this;

      this.duration = parseInt( moment( this.ended || moment() )
                                .diff( this.started, 'seconds' ) );

      /* element is already rendered - only update the element */
      if( this.element ) {
        return this.update( part, data );
      }

      var $template = this._getRenderedTemplate( data );

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
            var newText = e.target.innerText;

            /* special logic because of the tags */
            if( item === 'description' ) {
              var save = _this.getDescription() !== newText;

              if( save ) {
                _this.setDescription( newText );
              }

              _this.render( ['description'] );

              if( save ) {
                _this.getCollection( 'grain' )
                  .sync( { save: true } );
              }

              return _this;
            }

            /* Nothing has changed */
            if( _this[ item ] === newText ) {
              return this;
            }

            if( item !== 'description' ) {
              _this[ item ] = newText;
              _this.getCollection( item ).push( newText );
            }

            _this.getCollection( 'grain' )
              .sync( { save: true,
                       reRender: true } );
          });

          if( item === 'description' ) {
            _element[0]
              .addEventListener( 'focus', function( e ) {
                e.target.innerText = _this.getDescription();
              });
          }
      });

      _.forOwn( ['parsedStarted', 'parsedEnded'], function( item ) {
        $template.find('.timeline__' + item)
          .on('blur', function( e ) {
            var _value = $(e.target).text(),
                _index = item === 'parsedStarted' ? 'started' : 'ended';

            _this[ _index ]
              .hours( _value.substr(0,2) )
              .minutes( _value.substr(3,2) );

            _this.getCollection( 'grain' ).sync( { reRender: true,
                                                   save: true });
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

      this.element = $template;
      this._updatePosition( data );

      if( !this.running ) {
        this._setUpdateInterval('clear');
        return this;
      }

      this._setUpdateInterval( 'minute' );

      return this;
    }
  };

  _.forOwn( controls, function( control, key ) {
    Grain.prototype[ key ] = control;
  });

  return Grain;
});