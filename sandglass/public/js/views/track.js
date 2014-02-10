define([ 'lodash',
         'backbone',
         'defaults',
         'moment',
         'models/activity' ],
  function( _,
            Backbone,
            defaults,
            moment,
            Activity ) {

  var Track = Backbone.View.extend({
    el: '.track',

    events: {
      'submit form': 'start',
      'click .sandglass__sortby-button': 'sort',
      'change .sandglass__search-startend > input': 'loadRecent'
    },

    initialize: function() {
      /* select default filter method */
      this.$('button[value="start"].sandglass__sortby-button')
        .addClass('sandglass__sortby-button--active');

      require([ 'jquery.ui.autocomplete',
                'jquery.ui.datepicker'], function() {
                  /* apply autocomplete */
                  _.forEach( ['project', 'task'], function( item ) {
                    this.$('input[name="' + item + '"]')
                      .autocomplete({
                        minLength: 0,
                        source: function( req, res ) {
                          var term = req.term,
                              raw = Sandglass.collections[ item ].getAutocompleteList(),
                              filtered;

                          filtered = _.map( raw, function( el ) {
                            if( el.label.indexOf( term ) !== -1 ) {
                              return el;
                            }
                          });

                          res( _.compact( filtered ) );
                        },

                        focus: function() {
                          return false;
                        },

                        select: function( e, ui ) {
                          this.$( e.target )
                            .val( ui.item.label )
                            .data( 'selectedId', ui.item.value );

                          return false;
                        }.bind( this ),

                        delay: 0
                      });
                  }.bind( this ));

                  /* apply datepicker */
                  _.forEach(['start', 'end'], function( item ) {
                    var _prefill = moment().zone( defaults.timezoneOffset ),
                        _uiDateFormat = defaults.dateFormat;

                    if( item === 'start' ) {
                      _prefill = _prefill.subtract( 'months', 1 );
                    }

                    _uiDateFormat = _uiDateFormat.replace('MM', 'mm');
                    _uiDateFormat = _uiDateFormat.replace('DD', 'dd');
                    _uiDateFormat = _uiDateFormat.replace('YYYY', 'yy');

                    if( item === 'start' ) {
                      _prefill = _prefill; /* todo minus one month */
                    }

                    this.$('.sandglass__search-' + item)
                      .datepicker({
                        dateFormat: _uiDateFormat,
                        maxDate: new Date()
                      })
                      .val( _prefill.format( defaults.dateFormat ) );
                  }.bind( this ));
                }.bind( this ));
    },

    start: function( e ) {
      if( this.tracking ) {
        return this.stop( e );
      }

      e.preventDefault();

      var $task = this.$('input[name="task"]'),
          task = $task.val() || '',
          $project = this.$('input[name="project"]'),
          project = $project.val() || '',
          $description = this.$('input[name="description"]');

      if( task.length <= 2 || project.length <= 2 ) {
        return this;
      }

      new Activity({
        task: task,
        task_id: $task.data('selectedId'),
        project: project,
        project_id: $project.data('selectedId'),
        description: $description.val()
      })
        .create()
        .then(function( activity ) {
          this.activity = activity;
          this.tracking = true;

          _.each(['task', 'project', 'description'], function( item ) {
            this.$( 'input[name="' + item + '"]' ).prop( 'disabled', true );
          }.bind( this ));

          this.$('.js-track__submit').text('Stop');
        }.bind( this ));
    },

    stop: function( e ) {
      e.preventDefault();

      _.each(['task', 'project', 'description'], function( item ) {
        this.$( 'input[name="' + item + '"]' )
          .val('')
          .prop( 'disabled', false );
      }.bind( this ));

      this.$('input[name="task"]').focus();
      this.$('.js-track__submit').text('Start');

      if( this.activity ) {
        this.activity.end()
          .then(function() {
            this.stopListening( this.activity );
            this.tracking = false;
          }.bind( this ));
      }
    },

    show: function() {
      this.$el.show();
    },

    hide: function() {
      this.$el.hide();
    },

    sort: function( e ) {
      e.preventDefault();
      Sandglass.views.timeline.sort( Backbone.$(e.target).val() );
    },

    loadRecent: function( e ) {
      var from,
          to,
          $target = $(e.target),
          $other = $target.siblings('input');

      if( $target.attr('name') === 'filter_start' ) {
        from = $target.val();
        to = $other.val();
      } else {
        to = $target.val();
        from = $other.val();
      }

      if( from ) {
        from = moment( from, defaults.dateFormat ).zone( defaults.timezoneOffset );
      }

      if( to ) {
        to = moment( to, defaults.dateFormat )
              .zone( defaults.timezoneOffset )
              .hour( 23 )
              .minute( 59 )
              .second( 59 );
      }

      Sandglass.collections.activity.loadRecent( from, to );
    }
  });

  return Track;
});