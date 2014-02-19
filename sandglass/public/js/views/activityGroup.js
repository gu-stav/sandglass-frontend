define([ 'lodash',
         'backbone',
         'views/activity' ],
  function( _,
            Backbone,
            ActivityView ) {

  var ActivityGroup = Backbone.View.extend({
    tagName: 'ul',
    className: 'timeline__group-ul',
    duration: 0,

    template: _.template( '<% if ( modelCount ) { %>' +
                          '<li class="timeline__groupHeader">' +
                          '<strong><%= groupLabel %></strong>' +
                          ' <%= duration %>' +
                          '</li>' +
                          '<% } %>' ),

    initialize: function() {
      this.activityCollection = new Backbone.Collection();
      this.add( this.model );
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
      var _view = new ActivityView( { model: model } );
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

    getFormattedDuration: function() {
      var _minutes = parseInt( this.duration / 120, 10 );

      if( _minutes === 0 ) {
        return '< 1min';
      }

      return  _minutes + 'min';
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

      _.forEach( this.activityCollection.models, function( activity ) {
        this.duration = this.duration + activity.getDuration( true );
      }.bind( this ));

      var _data = {
        groupLabel: this.attributes.groupLabel,
        duration: this.getFormattedDuration(),
        modelCount: this.activityCollection.models.length > 0
      };

      this.sort();

      this.$el.html( this.template( _data ) );

      _.forEach( this.activityCollection.models, function( activity ) {
        this.$el.append( activity._view.render().$el );
      }.bind( this ));

      return this;
    }
  });

  return ActivityGroup;
});