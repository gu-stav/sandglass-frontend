define([ 'lodash',
         'backbone' ],
  function( _,
            Backbone ) {

  var Notification = Backbone.View.extend({
    template: _.template('<li class="notification__item notification__item--<%= type %>"><p class="notification__text"><%= text %></p></li>'),

    render: function() {
      if( !this.el || this.model.changed ) {
        this.el = this.template( this.model.attributes );
      }

      return this;
    }
  });

  return Notification;
});