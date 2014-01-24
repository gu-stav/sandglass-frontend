define( ['lodash',
         'moment',
         'collection',
         'grain',
         'storage',
         'template.track',
         'defaults'],
        function( _, moment, Collection, Grain, storage, templateTrack, defaults ) {

  moment.lang( defaults.language );

  var controls,

  Sandglass = function() {
    var _this = this,
        _grainCollection,
        _projectCollection,
        _activityCollection;

    this.id = _.uniqueId( 'sandglass-' );
    this.element = undefined;
    this.running = false;
    this.collections = {};

    _projectCollection =
      new Collection()
        .setStorage( storage, 'index-project' );

    _activityCollection =
      new Collection()
        .setStorage( storage, 'index-activity' );

    _grainCollection =
      new Collection()
        .setStorage( storage, 'grains' )
        .extend({
          toJSONValues: ['started',
                         'ended',
                         'description',
                         'activity',
                         'project'],

          pushAndRender: function( data ) {
            var _this = this;

            if( _.isArray( data ) ) {
              _.forOwn( data, function( item ) {
                _this.push( item );
              });
            } else {
              this.push( data );
            }

            this.render();
            return this;
          },

          group: function() {
            /* TODO: reduce number of loops here and enhance performance */

            var data = this.get(),
                _newData = {},
                _grouped,
                _sorted = {};

            /* generate year-day format */
            _.forOwn( data, function( item ) {
              item.startGrouped = item.started ? item.started.format( 'YYYY MM DD' ) : '';
              item.startGroupedParsed = item.started ? item.started.format('MMMM DD') : '';
            });

            /* group all by day */
            _grouped = _.groupBy( data, 'startGrouped' );

            /* sort items per day */
            _.forOwn( _grouped, function( group, index ) {
              _newData[ index ] = _.sortBy( group, 'started' );
            });

            /* sort days */
            _.forOwn( _.keys( _newData ).sort().reverse(), function( item ) {
              _sorted[ item ] = _newData[ item ];
            });

            return _sorted;
          },

          /* filter grains by term, start and end */
          filter: function( term, start, end ) {
            var filtered = [],
                excluded = [],
                uiDateFormat = defaults.dateFormat;

            /* use a date long in the past */
            if( !start ) {
              start = moment().subtract('years', 100);
            } else {
              start = moment( start ).startOf('day');
            }

            /* use a date long in the future */
            if( !end ) {
              end = moment().add('years', 100);
            } else {
              end = moment( end ).endOf('day')
            }

            /* reset search */
            if( !term && !start && !end ) {
              this.render();
              return;
            }

            _.forOwn( this.get(), function( grain ) {
              var grainStart = grain.started.clone(),
                  grainEnd = grain.ended ? grain.ended.clone() : end,
                  description = grain.description,
                  activity = grain.activity,
                  project = grain.project,

                  show = false;

              /* use day, month and year only */
              grainStart = grainStart.startOf('day');
              grainEnd = grainStart.endOf('day');

              if( grainStart.isAfter( start ) || grainStart.isSame( start ) ) {
                if( grainEnd.isBefore( end ) || grainEnd.isSame( end ) ) {
                  if( term ) {
                    /* normalize the search-string for projects */
                    var projectTerm = term.indexOf( '@' ) === -1 ?
                                        term :
                                        term.substr( 1, term.length );

                    /* grain is within the given timerange */
                    if( description.indexOf( term ) !== -1 ||
                        activity.indexOf( term ) !== -1 ||
                        project.indexOf( projectTerm ) !== -1 ) {
                      show = true;
                    }
                  } else {
                    show = true;
                  }
                }
              }

              if( show ) {
                filtered.push( grain );
              } else {
                excluded.push( grain );
              }
            });

            this.filtered = filtered;
            this.excluded = excluded;
            this.render();

            return this;
          },

          render: function( data ) {
            if( !data ) {
              data = {};
            }

            _.forOwn( this.group(), function( group, groupIndex ) {
              var grainCount = 0;

              _.forOwn( group, function( grain, grainIndex ) {
                data = _.assign( data, { index: grainIndex,
                                         conflictWithBefore: false } );

                /* indicator, if there is a potential conflict */
                if( grainIndex > 0 ) {
                  if( grain.started.isBefore( group[ grainIndex - 1 ].ended ) ) {
                    data.conflictWithBefore = true;
                  }
                }

                grain
                  .render( undefined, data )
                  .show();

                ++grainCount;
              });
            });

            _.forOwn( this.excluded, function( grain ) {
              grain.hide();
            });

            this.filtered = undefined;
            this.excluded = undefined;
            return this;
          }
        });

    /* load recent grains */
    var loadedGrains =
    _.map( storage.get('grains'), function( grainData ) {

      var grain = new Grain( grainData );

      grain.setCollection( 'grain', _grainCollection );
      grain.setCollection( 'project', _projectCollection );
      grain.setCollection( 'activity', _activityCollection );

      return grain;
    });

    this.setCollection( 'project', _projectCollection );
    this.setCollection( 'activity', _activityCollection );
    this.setCollection( 'grain', _grainCollection );

    this.getCollection('project').set( storage.get('index-project') );
    this.getCollection('activity').set( storage.get('index-activity') );

    this.getCollection( 'grain' )
      .pushAndRender( loadedGrains );

    _.forOwn( this.getCollection( 'grain' ).get(), function( grain ) {
      if( !grain.ended ) {
        grain.start();
      }
    });

    this._render();
  };

  controls = {
    start: function() {
      if( this.running ) {
        return this.end();
      }

      var activity = this.element.find('input[name="activity"]').val(),
          project = this.element.find('input[name="project"]').val(),
          description = this.element.find('input[name="description"]').val(),
          grain;

      grain = new Grain({
        activity:     activity,
        project:      project,
        description:  description
      });

      this.getCollection('grain')
        .push( grain );

      grain
        .setCollection( 'grain', this.getCollection('grain') )
        .start();

      this.running = true;

      this.getCollection('grain')
        .render( {start: true} );

      this.getCollection('project')
        .push( project )
        .sync( {save: true} );

      this.getCollection('activity')
        .push( activity )
        .sync( {save: true} );

      this.grain = grain;

      this.element.find('button[type="submit"]')
        .text('Stop');

      this.element.find('input')
        .prop( 'disabled', true );

      return this;
    },

    end: function() {
      if( !this.running || !this.grain ) {
        return this.start();
      }

      this.grain.end();

      this.element.find('button[type="submit"]')
        .text('Start');

      this.element.find('input')
        .prop('disabled', false)
        .val('')
        .filter(':first')
          .focus();

      this.running = false;

      return this;
    },

    setCollection: function( index, collection ) {
      this.collections[ index ] = collection;
      return this;
    },

    getCollection: function( index ) {
      return this.collections[ index ] || undefined;
    },

    _render: function() {
      var _this = this,
          $template = $( _.template( templateTrack )() );

      /* apply autocomplete */
      _.forEach(
        ['activity',
         'project'],
        function( item, index ) {
          $template
          .find('input[name="' + item + '"]')
          .on('close', function( e, origEvent ) {
            if( $(origEvent.currentTarget).is('ul') ) {
              $(origEvent.currentTarget).hide();
            }
          })
          .autocomplete({
            source: function( req, res ) {
              var _result = _this.getCollection( item ).get(),
                  _filtered;

              _filtered = _.filter( _result, function( item ) {
                return item.indexOf( req.term ) !== -1;
              });

              res( _filtered );
            },
            minLength: 0,
            select: function( e, ui ) {
              var $toElement = $(e.toElement);

              if( $toElement.hasClass('autocomplete__delete') ||
                  $toElement.parent().hasClass('autocomplete__delete') ) {
                _this.getCollection( item ).pop( ui.item.label );
                $toElement.closest('li').remove();
                return false;
              } else {
                $(e.target).trigger('close', e);
              }

              $(e.target).parent().next().children('input')
                .focus();
            }
          });

          var uiData = $template.find('input[name="' + item + '"]').data('ui-autocomplete');

          /* overwrite original close method */
          uiData.close = function( e ) {};

          uiData
            ._renderItem = function( ul, item ) {
              var $li = $('<li/>').addClass('ui-menu-item')
                                  .data('item.autocomplete', item),
                  $a = $('<a/>').attr({
                                  tabindex: -1,
                                  id: 'ui-id'
                                })
                                .addClass('ui-corner-all')
                                .text( item.label ),
                  $delete = $('<a/>')
                              .addClass('autocomplete__delete')
                              .html('<i class="fa fa-trash-o"></i>');

              $a.appendTo( $li );
              $delete.appendTo( $li );
              $li.appendTo( ul );

              return $li;
            };
      });

      /* Search bindings */
      $('.sandglass__search')
        .on('search submit', function( e ) {
          var term = $(e.target).find('.sandglass__search-term').val(),
              start = $(e.target).find('input[name="filter_start"]').val(),
              end = $(e.target).find('input[name="filter_end"]').val();

          _this.getCollection('grain')
            .filter( term, start, end );

          e.preventDefault();
          e.stopPropagation();
        });

      $('.sandglass__search-term')
        .autocomplete({
          source: function( req, res ) {
            var term = req.term,
                projectRegexp = /@([a-zA-Z]+)$/gi,
                projectResults = projectRegexp.exec( term ),
                newTerms = [];

            /* autocomplete for projects */
            if( projectResults ) {
              _.forOwn( _this.getCollection('project').get(), function( project ) {

                if( project.indexOf( projectResults[1] ) !== -1 ) {
                  newTerms.push( { label: project,
                                   value: '@' + project } );
                }
              });

              res( newTerms );
            }

            return false;
          }
        });

      /* jqueryUI Dateformat mapping */
      var dateFormatJqueryUiMapping = {
        'MM/DD/YYYY': 'mm/dd/yy'
      };

      $('.sandglass__search-start')
        .val( moment().subtract('month', 1).format( defaults.dateFormat ) )
        .datepicker({
          showAnim: '',
          dateFormat: dateFormatJqueryUiMapping[ defaults.dateFormat ],
          maxDate: moment().format( defaults.dateFormat ),
          onSelect: function( date ) {
            $('.sandglass__search-end').datepicker( 'option', 'minDate', date );
            $('.sandglass__search').trigger('search');
          }
        });

      $('.sandglass__search-end')
        .val( moment().format( defaults.dateFormat ) )
        .datepicker({
          showAnim: '',
          dateFormat: dateFormatJqueryUiMapping[ defaults.dateFormat ],
          maxDate: moment().format( defaults.dateFormat ),
          onSelect: function( date ) {
            $('.sandglass__search-start').datepicker( 'option', 'maxDate', date );
            $('.sandglass__search').trigger('search');
          }
        });

      /* submit handler */
      $template
        .on('submit', function( e ) {
          if( !_this.started ) {
            $('.js-track__submit').focus();
          }

          _this.start();

          e.preventDefault();
          e.stopPropagation();
        });

      this.element =
        $template
          .insertAfter('header');

      return this;
    }
  };

  _.forOwn( controls, function( control, key ) {
    Sandglass.prototype[ key ] = control;
  });

  return Sandglass;
});