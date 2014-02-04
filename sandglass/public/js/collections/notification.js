define([ 'lodash',
         'backbone',
         'models/notification',
         'views/notification' ],
  function( _,
            Backbone,
            NotificationModel,
            NotificationView ) {

  var Notification = Backbone.Collection.extend({
        el: $('ul.notification'),

        initialize: function() {
          this._views = [];
        }
      }),

      Collection = new Notification();

  Collection.on('add', function( addedModel ) {
    var _this = this;

    this.el.empty();

    _.forEach( this.models, function( model ) {
      /* only render the newly added models into views */
      if( addedModel.cid === model.cid ) {
        _this._views.push( new NotificationView( { model: model } ) );
      }
    });

    _.forEach( this._views, function( view ) {
      _this.el
        .prepend( view.render().el )
    });
  });

  return Collection;
});