define([ 'lodash',
         'backbone',
         'views/activity' ],
  function( _,
            Backbone,
            Activity ) {

  var ActivityGroup = Backbone.View.extend({
    tagName: 'ul',
    className: 'timeline__group-ul',
    duration: 0,

    initialize: function() {
      this.activityCollection = new Backbone.Collection();
      this.add( this.model );
      this.addModelListener( this.model );
      return this;
    },

    addModelListener: function( model ) {
      this.listenTo( model, 'destroy',
                     function() {
                      this.removeModel( model );
                     }.bind( this ));

      return this;
    },

    add: function( model ) {
      var _view = new Activity( { model: model } );
      model._view = _view;

      this.activityCollection.push( model );
      this.addModelListener( model );
      this.render();

      return this;
    },

    removeModel: function( activity ) {
      this.activityCollection.remove( activity );

      /* only re-render when we removed the last item */
      if( !this.activityCollection.models.length ) {
        this.render();
      }

      return this;
    },

    sort: function () {
      this.activityCollection.models =
      _.sortBy( this.activityCollection.models, function( activity ) {
        var _attr = activity.get( this.attributes.sortBy );

        if( ['start', 'end'].indexOf( this.attributes.sortBy ) !== -1 ) {
          return _attr.format('HH:mm:ss');
        }

        return _attr;
      }.bind( this ));

      return this;
    },

    render: function() {
      this.sort();

      _.forEach( this.activityCollection.models, function( activity ) {
        this.duration = this.duration + activity.getDuration( true );
        this.$el.append( activity._view.render().$el );
      }.bind( this ));

      /* insert visual grouping element */
      if( !this.$el.children('.timeline__groupHeader').length ) {
        this.$el.prepend('<li class="timeline__groupHeader"><strong>' +
                         this.attributes.groupLabel +
                          '</strong>' + ' - ' + this.duration + 'sec</li>');
      }

      /* no models */
      if( !this.activityCollection.models.length ) {
        this.$el.children('.timeline__groupHeader').remove();
        return this;
      }

      return this;
    }
  });

  return ActivityGroup;
});