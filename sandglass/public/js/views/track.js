define([ 'lodash',
         'backbone',
         'defaults',
         'models/activity',
         'jquery.ui.autocomplete' ],
  function( _,
            Backbone,
            defaults,
            Activity,
            $ ) {

  var Track = Backbone.View.extend({
    el: '.track',

    events: {
      'submit form': 'start',
      'click .sandglass__sortby-button': 'sort'
    },

    initialize: function() {
      /* apply autocomplete */
      _.forOwn( ['project', 'task'], function( item ) {
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
    },

    start: function( e ) {
      e.preventDefault();

      var $task = this.$('input[name="task"]'),
          $project = this.$('input[name="project"]'),
          $description = this.$('input[name="description"]');

      new Activity({
        task: $task.val(),
        taskId: $task.data('selectedId'),
        project: $project.val(),
        projectId: $project.data('selectedId'),
        description: $description.val()
      })
        .create()
        .then(function( activity ) {
          this.listenTo( activity, 'change:end', this.stop );

          _.each(['task', 'project', 'description'], function( item ) {
            this.$( 'input[name="' + item + '"]' ).prop( 'disabled', true );
          }.bind( this ));

          this.$('.js-track__submit').text('Stop');
        }.bind( this ));
    },

    stop: function() {
      _.each(['task', 'project', 'description'], function( item ) {
        this.$( 'input[name="' + item + '"]' ).prop( 'disabled', false );
      }.bind( this ));

      this.$('.js-track__submit').text('Start');
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