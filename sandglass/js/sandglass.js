define(
  ['lodash',
   'hogan',
   'storage',
   'grain',
   'template.track'],

  function( _, hogan, storage, Grain, TRACK_TEMPLATE ) {
    var Sandglass = function() {
      this.options = {
        render: {
          targetSelector: 'header',
          method: 'insertAfter'
        }
      };

      this.status = {
        tracking: false
      }

      this.data = {};
    },

    controls = {};

    controls = {
      init: function() {
        this._render();
        this._loadGrains();
      },

      /* track with given start/ end */
      track: function() {
        if( this.status.tracking ) {
          this.end();
        } else {
          this.start();
        }
      },

      /* start new tracking */
      start: function() {
        if( this.grain ) {
          this.grain.end();
        }

        var _this = this,
            _grain = new Grain( {
              activity: this._getElement( 'activity' ).val(),
              project: this._getElement( 'project' ).val(),
              description: this._getElement( 'description' ).val()
            } );

        _grain
          .start();

        this.grain = _grain;
        this.status.tracking = true;

        /* disable all input forms & save values */
        _.forEach( ['activity', 'project', 'description'], function( item ) {
          var _element = _this._getElement( item );

          _element
            .prop( 'disabled', true );

          /* add elements to localstorage */
          if( item !== 'description' ) {
            storage.push( 'indexed-' + item, _element.val() );
          }
        });

        /* update button text */
        this._getElement( 'submit' ).text( 'Stop' );
      },

      /* end an tracking time instance */
      end: function( grain ) {
        var _this = this;

        this.grain
          .end();

        this.grain = undefined;
        this.status.tracking = false;

        _.forEach( ['activity', 'project', 'description'], function( item, index ) {
          var _element = _this._getElement( item );

          _element
            .val( '' )
            .prop( 'disabled', false );

          if( index === 0 ) {
            _element.focus();
          }
        });

        /* update button text */
        this._getElement( 'submit' ).text( 'Start' );
      },

      _getElement: function( index ) {
        var _elements = {
          activity: 'input[name="activity"]',
          project: 'input[name="project"]',
          description: 'input[name="description"]',
          submit: '.js-track__submit'
        };

        return this.$element.find( _elements[ index ] );
      },

      _loadGrains: function() {
        var _grains = storage.get('grains');

        if( !_grains ) {
          return;
        }

        _.forOwn( _grains, function( grainData, index ) {
          new Grain( grainData )._construct();
        });
      },

      _render: function() {
        var _compiledTemplate,
            $element;

        _compiledTemplate = hogan.compile( TRACK_TEMPLATE );
        $element = $( _compiledTemplate.render() )[ this.options.render.method ]( this.options.render.targetSelector );

        this.$element = $element;
        var _this = this,
            elements = {
              form: {
                elementSelector: '.track',
                eventType: 'submit'
              }
            };

        _.forOwn( elements, function( element, key ) {
          var _element = document.querySelectorAll( element.elementSelector );

          _element[0].addEventListener( element.eventType, function( e ) {
            _this.track();
            e.preventDefault();
          });
        });

        _.forEach( ['activity', 'project', 'description'], function( item, index ) {
          var _element = _this._getElement( item )

          _element.autocomplete({
            source: function( req, res ) {
              var _result = storage.get( 'indexed-' + item ),
                  _filtered;

              _filtered = _.filter( _result, function( item ) {
                return item.indexOf( req.term ) !== -1;
              });

              res( _filtered );
            }
          });
        });
      }
    };

    _.forOwn( controls, function( control, key ) {
      Sandglass.prototype[ key ] = control;
    });

    return Sandglass;
});