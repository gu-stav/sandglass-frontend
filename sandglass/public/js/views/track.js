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
    className: 'track',

    template: _.template( '<form>' +
                          '  <div class="track__row">' +
                          '    <div class="track__field track__field--inline">' +
                          '      <input type="text"' +
                          '             name="task"' +
                          '             class="track__task"' +
                          '             id="track__task"' +
                          '             placeholder="Task" />' +
                          '    </div>' +

                          '    <div class="track__field track__field--inline">' +
                          '      <input type="text"' +
                          '             name="project"' +
                          '             class="track__project"' +
                          '             id="track__activity"' +
                          '             placeholder="Project" />' +
                          '    </div>' +

                          '    <div class="track__field track__field--inline">' +
                          '      <input type="text"' +
                          '             name="description"' +
                          '             class="track__description"' +
                          '             id="track__activity"' +
                          '             placeholder="Description" />' +
                          '    </div>' +

                          '    <div class="track__field track__field--inline">' +
                          '      <button type="submit"' +
                          '              class="track__button js-track__submit">' +
                                 '<i class="fa fa-clock-o"></i> ' +
                                 '<span class="track__button-text">Start</span></button>' +
                          '    </div>' +
                          '  </div>' +

                          '  <div class="track__row track__row--date">' +
                          '    <div class="track__field track__field--inline">' +
                          '    <label><input type="checkbox" name="track_now" checked />' +
                          '    Now</label>' +
                          '    </div>' +
                          '  </div>' +

                          '  <div class="track__row track__row--date track__row--date-start-end track__row--hidden">' +

                          '    <div class="track__field track__field--inline">' +
                          '      <input type="text"' +
                          '             name="date_start"' +
                          '             class="track__date-start"' +
                          '             id="track__date-start"' +
                          '             placeholder="" />' +
                          '    </div>' +

                          '    <div class="track__field track__field--inline">' +
                          '      <input type="text"' +
                          '             name="time_start"' +
                          '             class="track__time-start"' +
                          '             id="track__time-start"' +
                          '             placeholder="" />' +
                          '    </div>' +

                          '    <div class="track__field track__field--inline track__field-end track__field--hidden">' +
                          '      <input type="text"' +
                          '             name="date_end"' +
                          '             class="track__date-end"' +
                          '             id="track__date-end"' +
                          '             placeholder="<%= dateFormat %>" />' +
                          '    </div>' +

                          '    <div class="track__field track__field--inline track__field-end track__field--hidden">' +
                          '      <input type="text"' +
                          '             name="time_end"' +
                          '             class="track__time-end"' +
                          '             id="track__time-end"' +
                          '             placeholder="<%= timeFormat %>" />' +
                          '    </div>' +

                          '    <div class="track__field track__field--inline">' +
                          '      <label><input type="checkbox" name="track_progress" checked />' +
                          '      In progress</label>' +
                          '    </div>' +

                          '  </div>' +
                          '</form>' +

                          '<form class="sandglass__search">' +
                          '  <div class="sandglass__sortby">' +
                          '    <i class="fa fa-sort sandglass__sortby-icon"></i>' +
                          '    <button class="sandglass__sortby-button"' +
                          '            value="start">Date</button>' +
                          '    <button class="sandglass__sortby-button"' +
                          '            value="task_id">Task</button>' +
                          '    <button class="sandglass__sortby-button"' +
                          '            value="project_id">Project</button>' +
                          '  </div>' +

                          '  <div class="sandglass__search-startend">' +
                          '    <i class="fa fa-search sandglass__search-icon"></i>' +
                          '    <input type="text"' +
                          '           class="sandglass__search-start"' +
                          '           name="filter_start"' +
                          '           placeholder="always" /> - ' +

                          '    <input type="text"' +
                          '           class="sandglass__search-end"' +
                          '           name="filter_end"' +
                          '           placeholder="today" />' +
                          '  </div>' +
                          '</form>' ),

    events: {
      'submit form': 'start',
      'click .sandglass__sortby-button': 'sort',
      'change .sandglass__search-startend > input': 'loadRecent',
      'change input[name="track_now"]': 'toggleDateView',
      'change input[name="track_progress"]': 'toggleDateEndView'
    },

    initialize: function() {
      var _uiDateFormat = defaults.dateFormat;

      /* mapping for jquery ui dateformat */
      _uiDateFormat = _uiDateFormat.replace('MM', 'mm');
      _uiDateFormat = _uiDateFormat.replace('DD', 'dd');
      _uiDateFormat = _uiDateFormat.replace('YYYY', 'yy');

      this._uiDateFormat = _uiDateFormat;

      this.render();

      /* add autocomplete & datepicker */
      require([ 'jquery.ui.autocomplete',
                'jquery.ui.datepicker'], function() {
                  /* apply autocomplete */
                  _.forEach( ['project', 'task'], function( item ) {
                    this.$('input[name="' + item + '"]')
                      .autocomplete({
                        minLength: 0,
                        source: function( req, res ) {
                          var term = req.term,
                              filtered;

                          /* filter elements */
                          filtered =
                            _.map( Backbone.collections[ item ].getAutocompleteList(),
                                   function( el ) {
                                     if( el.label.indexOf( term ) !== -1 ) {
                                       return el;
                                     }
                                   });

                          res( _.compact( filtered ) );
                        },

                        /* do not fill input when focusing elements */
                        focus: function() {
                          return false;
                        },

                        select: function( e, ui ) {
                          var $target = $(e.target);

                          /* fill with label & save the id */
                          $target
                            .val( ui.item.label )
                            .data( 'selectedId', ui.item.value );

                          /* focus next input field */
                          $target
                            .parent()
                            .next('div')
                              .children('input')
                                .focus();

                          return false;
                        }.bind( this ),

                        delay: 0
                      });
                  }.bind( this ));

                  _.forEach( [ 'start', 'end' ], function( item ) {
                    this.$('input[name="date_' + item + '"]')
                      .datepicker({
                        dateFormat: this._uiDateFormat,
                        maxDate: new Date()
                      });
                  }.bind( this ));

                  /* apply datepicker */
                  _.forEach(['start', 'end'], function( item ) {
                    this.$('.sandglass__search-' + item)
                      .datepicker({
                        dateFormat: this._uiDateFormat,
                        maxDate: new Date()
                      })
                      .datepicker( 'setDate',
                                   item === 'start' ? '-1m' : new Date() );
                  }.bind( this ));
                }.bind( this ));
    },

    start: function( e ) {
      e.preventDefault();

      var $task = this.$('input[name="task"]'),
          task = $task.val() || '',
          $project = this.$('input[name="project"]'),
          project = $project.val() || '',
          description = this.$('input[name="description"]').val() || '',
          start,
          parsedStart,
          parsedStartTime,
          end,
          parsedEnd,
          parsedEndTime;

      if( !this.$('input[name="track_now"]').prop( 'checked' ) ) {
        var _start_date_val = this.$( 'input[name="date_start"]' ).val(),
            _start_time_val = this.$( 'input[name="time_start"]' ).val(),
            _end_date_val = this.$('input[name="date_end"]').val(),
            _end_time_val = this.$( 'input[name="time_end"]' ).val(),
            _in_progress = this.$( 'input[name="track_progress"]' ).prop( 'checked' ),
            _timeRegExp = /^(\d{2}):(\d{2})$/;

        if( _start_date_val || _start_time_val ) {
          start = moment().utc().zone( new Date().getTimezoneOffset() );
        }

        if( !_in_progress ) {
          end = moment().utc().zone( new Date().getTimezoneOffset() );
        }

        if( _start_time_val ) {
          parsedStartTime = _timeRegExp.exec( _start_time_val );
          start = start.hours( parsedStartTime[ 1 ] )
                       .minutes( parsedStartTime[ 2 ] );
        }

        if( _end_time_val ) {
          parsedEndTime = _timeRegExp.exec( _end_time_val );
          end = end.hours( parsedEndTime[ 1 ] )
                   .minutes( parsedEndTime[ 2 ] );
        }

        if( _start_date_val ) {
          parsedStart = moment( _start_date_val, defaults.dateFormat );
          start = start.day( parsedStart.days() )
                       .month( parsedStart.month() )
                       .years( parsedStart.year() );
        }

        if( _end_date_val ) {
          parsedEnd = moment( _end_date_val, defaults.dateFormat );
          end = end.day( parsedEnd.days() )
                   .month( parsedEnd.month() )
                   .years( parsedEnd.year() );
        }
      }

      /* reset default state */
      this.$('input[name="track_now"]')
        .prop( 'checked', true )
        .trigger( 'change' );

      if( task.length <= 2 ||
          project.length <= 2 ||
          description.length <= 2 ) {
        this.$el.addClass('form--error');
        return this;
      } else {
        this.$el.removeClass('form-error');
      }

      /* end tracking for all running activities */
      _.forEach( this.collection.models, function( activity ) {
        if( !activity.get('end') ) {
          activity.end();
        }
      });

      new Activity({
        task: task,
        task_id: $task.data('selectedId'),
        project: project,
        project_id: $project.data('selectedId'),
        description: description,
        start: start,
        end: end
      })
        .create()
        .then(function( activity ) {
          _.each(['task', 'project', 'description'], function( item ) {
            this.$( 'input[name="' + item + '"]' ).val( '' );
          }.bind( this ));

          this.$('input[name="task"]').focus();
        }.bind( this ));

        return this;
    },

    sort: function( e ) {
      e.preventDefault();

      var _val = this.$(e.target).val();

      this
        .$('button[value="'+ _val +'"].sandglass__sortby-button')
          .addClass('sandglass__sortby-button--active')
          .siblings()
            .removeClass('sandglass__sortby-button--active');

      Backbone.views.timeline
        .sort( _val, false )
        .render();
    },

    toggleDateView: function( e ) {
      var $cb = Backbone.$(e.target),
          $target = $cb.closest('.track__row').next();

      $target[ ( $cb.prop('checked') ? 'add' : 'remove' ) + 'Class' ]('track__row--hidden');

      if( !$cb.prop('checked') ) {
        /* update date field always to the current date */
        this.$('input[name="date_start"]')
            .datepicker( 'setDate', new Date() );

        this.$('input[name="date_end"]')
            .datepicker( 'setDate', new Date() );

        this.$('input[name="time_start"]')
            .val( moment().utc()
              .zone( new Date().getTimezoneOffset() )
              .format( 'HH:mm' ) );

        this.$('input[name="time_end"]')
            .val( moment().utc()
              .zone( new Date().getTimezoneOffset() )
              .format( 'HH:mm' ) );
      }
    },

    toggleDateEndView: function( e ) {
      var $cb = Backbone.$(e.target),
          $targets = $cb.closest('.track__field').prevAll( '.track__field-end' );

      $targets[ ( $cb.prop( 'checked' ) ? 'add' : 'remove' ) + 'Class' ]( 'track__field--hidden' );
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
        from = moment( from, defaults.dateFormat );
      }

      if( to ) {
        to = moment( to, defaults.dateFormat )
              .hour( 23 )
              .minute( 59 )
              .second( 59 );
      }

      this.collection.loadRecent( from, to );
    },

    render: function() {
      var _data = {
        dateFormat: defaults.dateFormat,
        timeFormat: defaults.timeFormat
      };

      this.$el.html( this.template( _data ) );

      this
        .$('button[value="start"].sandglass__sortby-button')
        .addClass('sandglass__sortby-button--active');

      this.$el.appendTo( '.sandglass' );

      return this;
    }
  });

  return Track;
});