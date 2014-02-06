define([ 'lodash',
         'backbone',
         'defaults',
         'models/activity' ],
  function( _,
            Backbone,
            defaults,
            Activity ) {

  var ActivityCollection = Backbone.Collection.extend({
    url: defaults.urlRoot + 'activities/',
    el: $('.timeline'),
    model: Activity,

    initialize: function() {
      this._views = [];

      this.on('add', function( model ) {
        Sandglass.views.timeline.add( model );
      }.bind( this ));
    },

    loadRecent: function() {
      return new Promise(function( res, rej ) {
        this.fetch({
          /* see issue: https://bitbucket.org/sandglass/sandglass/issue/1/missing-route-for-user-activities
           url: defaults.urlRoot + 'users/' + Sandglass.User.get('id') + '/activities/' */
        })
          .done( res )
          .fail( rej );
      }.bind( this ));
    }
  });

  return ActivityCollection;
});