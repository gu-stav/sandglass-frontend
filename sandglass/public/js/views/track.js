define([ 'lodash',
         'backbone',
         'defaults' ],
  function( _,
            Backbone,
            defaults ) {

  var Track = Backbone.View.extend({
    el: '.track',
    initialize: function() {
      this.$el.show();
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