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
      this.$el.show();

      this.$('input[name="project"]')
        .autocomplete({
          minLength: 0,
          source: function( req, res ) {
            var term = req.term,
                raw = Sandglass.collections.project
                        .getAutocompleteList(),
                filtered;

            filtered = _.map( raw, function( el ) {
              if( el.label.indexOf( term ) !== -1 ) {
                return el;
              }
            });

            res( _.compact( filtered ) );
          }
        })
    },

    start: function( e ) {
      e.preventDefault();

      new Activity({
        task: this.$('input[name="activity"]').val(),
        taskId: this.$('input[name="activity"]').data('id'),
        project: this.$('input[name="project"]').val(),
        projectId: this.$('input[name="project"]').data('id'),
        description: this.$('input[name="description"]').val()
      })
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