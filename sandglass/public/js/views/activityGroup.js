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
      this.activityCollection = new Backbone.Collection();
      return this;
    },

    add: function( model ) {
      var _view = new Activity( { model: model } ),
          _model = model;

      _model._view = _view;

      this.activityCollection.push( model );

      _.sortBy( this.activityCollection.models, function( activity ) {
        var _attr = activity.get( this.attributes.sortBy );

        if( ['start', 'end'].indexOf( this.attributes.sortBy ) !== -1 ) {
          return _attr.format('HH:ii');
        }

        return _attr;
      }.bind( this ));

      return this;
    },

    removeModel: function( activity ) {
      this.activityCollection.remove( activity );

      /* only re-render when we removed the last item */
      if( !this.activityCollection.models.length ) {
        this.render();
      }
    },

    render: function() {
      /* insert visual grouping element */
      if( !this.$el.children('.timeline__groupHeader').length ) {
        this.$el.prepend('<li class="timeline__groupHeader"><strong>' +
                         this.attributes.groupLabel + '</strong></li>');
      }

      /* no models */
      if( !this.activityCollection.models.length ) {
        this.$el.children('.timeline__groupHeader').remove();
        return this;
      }

      _.forEach( this.activityCollection.models, function( activity ) {
        this.$el.append( activity._view.render().$el );
      }.bind( this ));

      return this;
    }
  });

  return ActivityGroup;
});