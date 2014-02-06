define([ 'lodash',
         'backbone',
         'defaults',
         'views/activity' ],
  function( _,
            Backbone,
            defaults,
            Activity ) {

  var ActivityGroup = Backbone.View.extend({
    tagName: 'ul',
    className: 'timeline__group-ul',

    initialize: function() {
      this._activities = [];
      return this;
    },

    add: function( model ) {
      var _view = new Activity( { model: model } );

      this._activities.push( _view );

      _.sortBy( this._activities, function( activity ) {
        return activity.model.get( this.attributes.sortBy );
      }.bind( this ));

      if( this.attributes.sortBy === 'start' ) {
        this._activities.reverse();
      }

      return this;
    },

    render: function() {
      this.$el.prepend('<li class="timeline__groupHeader"><strong>' +
                        this.attributes.groupName + '</strong></li>');

      _.forEach( this._activities, function( activity ) {
        this.$el
          .append( activity.render().$el );
      }.bind( this ));

      return this;
    }
  });

  return ActivityGroup;
});