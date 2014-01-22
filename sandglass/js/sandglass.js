define( ['lodash',
         'moment',
         'collection',
         'grain',
         'storage',
         'template.track'],
        function( _, moment, Collection, Grain, storage, templateTrack ) {
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
          },

          group: function() {
            var data = this.get();

            /* generate year-day format */
            _.forOwn( data, function( item ) {
              item.startGrouped = item.started.format( 'MMMM DD' );
            });

            return _.groupBy( data, 'startGrouped' );
          },

          /* filter grains by term, start and end */
          filter: function( term, start, end ) {
            var filtered = [],
                excluded = [],
                uiDateFormat = 'MM/DD/YYYY';

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

          render: function() {
            _.forOwn( this.group(), function( group, groupIndex ) {
              var grainCount = 0;

              _.forOwn( group, function( grain, grainIndex ) {
                if( grainCount + 1 < group.length ) {
                  grain.startGrouped = undefined;
                }

                grain
                  .render();

                grain
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

      if( !grain.ended ) {
        grain.start();
      }

      return grain;
    });

    this.setCollection( 'project', _projectCollection );
    this.setCollection( 'activity', _activityCollection );
    this.setCollection( 'grain', _grainCollection );

    this.getCollection('project').set( storage.get('index-project') );
    this.getCollection('activity').set( storage.get('index-activity') );

    _this.getCollection( 'grain' )
      .pushAndRender( loadedGrains );

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
      })
        .setCollection( 'grain', this.getCollection('grain') )
        .start();

      this.running = true;

      this.getCollection('grain')
        .pushAndRender( grain );

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

      this.getCollection('grain').sync( {reRender: true});

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
          .autocomplete({
            source: function( req, res ) {
              var _result = _this.getCollection( item ).get(),
                  _filtered;

              _filtered = _.filter( _result, function( item ) {
                return item.indexOf( req.term ) !== -1;
              });

              res( _filtered );
            }
          });
      });

      /* Search bindings */
      $('.sandglass__search')
        .on('submit', function( e ) {
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
        })

      $('.sandglass__search-start')
        .val( moment().subtract('month', 1).format('MM/DD/YYYY') )
        .datepicker({
          showAnim: '',
          maxDate: moment().format('MM/DD/YYYY'),
          onSelect: function( date ) {
            $('.sandglass__search-end').datepicker( 'option', 'minDate', date );
          }
        });

      $('.sandglass__search-end')
        .val( moment().format('MM/DD/YYYY') )
        .datepicker({
          showAnim: '',
          maxDate: moment().format('MM/DD/YYYY'),
          onSelect: function( date ) {
            $('.sandglass__search-start').datepicker( 'option', 'maxDate', date );
          }
        });

      /* submit handler */
      $template
        .on('submit', function( e ) {
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