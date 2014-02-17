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
      this.render();

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
      var _groupDuration = 0;

      _.forEach( this.activityCollection.models, function( activity ) {
        _groupDuration = _groupDuration + activity.getDuration( true );
      });

      /* insert visual grouping element */
      if( !this.$el.children('.timeline__groupHeader').length ) {
        this.$el.prepend('<li class="timeline__groupHeader"><strong>' +
                         this.attributes.groupLabel +
                          '</strong>' + ' - ' + _groupDuration + 'sec</li>');
      }

      /* no models */
      if( !this.activityCollection.models.length ) {
        this.$el.children('.timeline__groupHeader').remove();
        return this;
      }

      this.activityCollection.models =
      _.sortBy( this.activityCollection.models, function( activity ) {
        var _attr = activity.get( this.attributes.sortBy );

        if( ['start', 'end'].indexOf( this.attributes.sortBy ) !== -1 ) {
          return _attr.format('HH:mm:ss');
        }

        return _attr;
      }.bind( this ));

      _.forEach( this.activityCollection.models, function( activity ) {
        this.$el.append( activity._view.render().$el );
      }.bind( this ));

      return this;
    }
  });

  return ActivityGroup;
});