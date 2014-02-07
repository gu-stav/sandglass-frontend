define([ 'lodash',
         'backbone',
         'defaults',
         'moment',
         'models/activity',
         'jquery.ui.autocomplete',
         'jquery.ui.datepicker' ],
  function( _,
            Backbone,
            defaults,
            moment,
            Activity,
            __autocomplete,
            __datepicker ) {

  var Track = Backbone.View.extend({
    el: '.track',

    events: {
      'submit form': 'start',
      'click .sandglass__sortby-button': 'sort'
    },

    initialize: function() {
      /* select default filter method */
      this.$('button[value="start"].sandglass__sortby-button')
        .addClass('sandglass__sortby-button--active')

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
        var _prefill = moment();

        if( item === 'start' ) {
          _prefill = _prefill; /* todo minus one month */
        }

        this.$('.sandglass__search-' + item)
          .datepicker({})
          .val( _prefill.format( defaults.dateFormat ) );
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
        this.$( 'input[name="' + item + '"]' ).prop( 'disabled', false );
      }.bind( this ));

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
    }
  });

  return Track;
});