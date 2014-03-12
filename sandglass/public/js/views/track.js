/*global define*/

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
  'use strict';

  var Track = Backbone.View.extend({
    template: _.template( '<form class="form form--inline form--track">' +
                          '  <div class="track__row">' +

                          '    <div class="form__group">' +
                          '      <input type="text"' +
                          '             name="project"' +
                          '             class="form__control"' +
                          '             id="track__activity"' +
                          '             placeholder="Project" />' +
                          '    </div>' +


                          '    <div class="form__group">' +
                          '      <input type="text"' +
                          '             name="task"' +
                          '             class="form__control"' +
                          '             id="track__task"' +
                          '             placeholder="Task" />' +
                          '    </div>' +

                          '    <div class="form__group">' +
                          '      <input type="text"' +
                          '             name="description"' +
                          '             class="form__control"' +
                          '             id="track__activity"' +
                          '             placeholder="Description" />' +
                          '    </div>' +

                          '    <div class="form__group">' +
                          '      <button type="submit"' +
                          '              class="button button--submit">' +
                                 '<i class="fa fa-clock-o"></i> ' +
                                 '<span class="track__button-text">Start' +
                                 '</span></button>' +
                          '    </div>' +
                          '  </div>' +

                          '  <div class="form__group form__group--date">' +
                          '    <div class="track__field ' +
                          '                track__field--inline">' +
                          '    <label><input type="checkbox" ' +
                          '                  name="track_now" checked />' +
                          '    Now</label>' +
                          '    </div>' +
                          '  </div>' +

                          '  <div class="form__group form__group--hidden">' +

                          '    <div class="form__group">' +
                          '      <input type="text"' +
                          '             name="date_start"' +
                          '             class="form__control"' +
                          '             id="track__date-start"' +
                          '             placeholder="" />' +
                          '    </div>' +

                          '    <div class="form__group">' +
                          '      <input type="text"' +
                          '             name="time_start"' +
                          '             class="form__control"' +
                          '             id="track__time-start"' +
                          '             placeholder="" />' +
                          '    </div>' +

                          '    <div class="form__group form__group--end ' +
                          '                form__group--hidden">' +
                          '      <input type="text"' +
                          '             name="date_end"' +
                          '             class="form__control"' +
                          '             id="track__date-end"' +
                          '             placeholder="<%= dateFormat %>" />' +
                          '    </div>' +

                          '    <div class="form__group form__group--end ' +
                          '                form__group--hidden">' +
                          '      <input type="text"' +
                          '             name="time_end"' +
                          '             class="form__control"' +
                          '             id="track__time-end"' +
                          '             placeholder="<%= timeFormat %>" />' +
                          '    </div>' +

                          '    <div class="form__group">' +
                          '      <label><input type="checkbox" ' +
                          '                    name="track_progress" ' +
                          '                    checked />' +
                          '      In progress</label>' +
                          '    </div>' +

                          '  </div>' +
                          '</form>' ),

    events: {
      'submit form': 'start',
      'change input[name="track_now"]': 'toggleDateView',
      'change input[name="track_progress"]': 'toggleDateEndView'
    },

    initialize: function() {
      var _uiDateFormat = Backbone.user.get('data').dateFormat;

      /* mapping for jquery ui dateformat */
      _uiDateFormat = _uiDateFormat.replace('MM', 'mm');
      _uiDateFormat = _uiDateFormat.replace('DD', 'dd');
      _uiDateFormat = _uiDateFormat.replace('YYYY', 'yy');

      this._uiDateFormat = _uiDateFormat;

      this.render();
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

      /* logic for adding activity to another date */
      if( !this.$('input[name="track_now"]').prop( 'checked' ) ) {
        var _start_date_val = this.$( 'input[name="date_start"]' ).val(),
            _start_time_val = this.$( 'input[name="time_start"]' ).val(),
            _end_date_val = this.$('input[name="date_end"]').val(),
            _end_time_val = this.$( 'input[name="time_end"]' ).val(),
            _in_progress = this.$( 'input[name="track_progress"]' )
                            .prop( 'checked' ),
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
          parsedStart = moment( _start_date_val,
                                Backbone.user.get('data').dateFormat );
          start = start.day( parsedStart.days() )
                       .month( parsedStart.month() )
                       .years( parsedStart.year() );
        }

        if( _end_date_val ) {
          parsedEnd = moment( _end_date_val,
                              Backbone.user.get('data').dateFormat );
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
        .then(function() {
          _.each(['task', 'project', 'description'], function( item ) {
            this.$( 'input[name="' + item + '"]' ).val( '' );
          }.bind( this ));

          this.$('input[name="project"]').focus();
        }.bind( this ));

      return this;
    },

    toggleDateView: function( e ) {
      var $cb = Backbone.$(e.target),
          $target = $cb.closest('.form__group').next();

      $target[ ( $cb.prop('checked') ?
                   'add' : 'remove' ) + 'Class' ]('form__group--hidden');

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
          $targets = $cb.closest('.form__group').prevAll( '.form__group--end' );

      $targets[ ( $cb.prop( 'checked' ) ?
                    'add' : 'remove' ) + 'Class' ]( 'form__group--hidden' );
    },

    loadRecent: function( e ) {
      var from,
          to,
          $target = Backbone.$(e.target),
          $other = $target.siblings('input');

      if( $target.attr('name') === 'filter_start' ) {
        from = $target.val();
        to = $other.val();
      } else {
        to = $target.val();
        from = $other.val();
      }

      if( from ) {
        from = moment( from, Backbone.user.get('data').dateFormat );
      }

      if( to ) {
        to = moment( to, Backbone.user.get('data').dateFormat )
              .hour( 23 )
              .minute( 59 )
              .second( 59 );
      }

      this.collection.loadRecent( from, to );
    },

    render: function() {
      var _data = {
        dateFormat: Backbone.user.get('data').dateFormat,
        timeFormat: Backbone.user.get('data').timeFormat
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