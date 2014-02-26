define([ 'lodash',
         'backbone' ],
       function( _,
                 Backbone ) {

  var userSettings = Backbone.View.extend({
    tagName: 'form',
    className: 'user__settings',

    template: _.template( '<div>' +
                          '<% _.forEach( attributes, function( value, key ) { %>' +
                            '<div class="user__settings-row">' +
                             '<label class="user__settings-label"><%= key %>' +
                              '<div class="user__settings-control">' +
                                '<input type="text" name="<%= key %>" value="<%= value %>" />' +
                              '</div>' +
                            '</label>' +
                            '</div>' +
                          '<% }); %>' +
                          '</div>' ),

    events: {
      'change input': 'update'
    },

    initialize: function() {
      this.render();
      return this;
    },

    update: function( e ) {
      var $inp = $(e.target),
          val = $inp.val(),
          key = $inp.attr('name');

      this.model.set( key, val );
      return this;
    },

    render: function() {
      var _data = {
        attributes: _.pick( this.model.attributes, [ 'first_name',
                                                     'last_name',
                                                     'email' ] )
      };

      this.$el.html( this.template( _data ) );
      this.$el.appendTo( '.sandglass' );

      return this;
    }
  });

  return userSettings;
});