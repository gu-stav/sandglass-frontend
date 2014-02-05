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
      'submit form': 'start'
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
              Backbone.$( e.target )
                .val( ui.item.label )
                .data( 'selectedId', ui.item.value );

              return false;
            },

            delay: 0
          });
      });
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
      });
    },

    show: function() {
      this.$el.show();
    },

    hide: function() {
      this.$el.hide();
    }
  });

  return Track;
});