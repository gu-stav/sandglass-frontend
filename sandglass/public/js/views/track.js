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
                          '              class="track__button js-track__submit">Start</button>' +
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
      'change .sandglass__search-startend > input': 'loadRecent'
    },

    initialize: function() {
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
                            _.map( Sandglass.collections[ item ].getAutocompleteList(),
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

                  /* apply datepicker */
                  _.forEach(['start', 'end'], function( item ) {
                    var _uiDateFormat = defaults.dateFormat;

                    /* mapping for jquery ui dateformat */
                    _uiDateFormat = _uiDateFormat.replace('MM', 'mm');
                    _uiDateFormat = _uiDateFormat.replace('DD', 'dd');
                    _uiDateFormat = _uiDateFormat.replace('YYYY', 'yy');

                    this.$('.sandglass__search-' + item)
                      .datepicker({
                        dateFormat: _uiDateFormat,
                        maxDate: new Date()
                      })
                      .datepicker( 'setDate',
                                   item === 'start' ? '-1m' : new Date() );
                  }.bind( this ));
                }.bind( this ));
    },

    start: function( e ) {
      e.preventDefault();

      if( this.tracking ) {
        return this.stop( e );
      }

      var $task = this.$('input[name="task"]'),
          task = $task.val() || '',
          $project = this.$('input[name="project"]'),
          project = $project.val() || '',
          description = this.$('input[name="description"]').val() || '';

      if( task.length <= 2 ||
          project.length <= 2 ||
          description.length <= 2 ) {
        this.$el.addClass('form--error');
        return this;
      } else {
        this.$el.removeClass('form-error');
      }

      new Activity({
        task: task,
        task_id: $task.data('selectedId'),
        project: project,
        project_id: $project.data('selectedId'),
        description: description
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

    sort: function( e ) {
      e.preventDefault();

      var _val = this.$(e.target).val();

      this
        .$('button[value="'+ _val +'"].sandglass__sortby-button')
          .addClass('sandglass__sortby-button--active')
          .siblings()
            .removeClass('sandglass__sortby-button--active');

      Sandglass.views.timeline
        .sort( _val, false )
        .render();
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

      Sandglass.collections.activity.loadRecent( from, to );
    },

    render: function() {
      this.$el.html( this.template() );

      this
        .$('button[value="start"].sandglass__sortby-button')
        .addClass('sandglass__sortby-button--active');

      this.$el.appendTo( '.sandglass' );

      return this;
    }
  });

  return Track;
});