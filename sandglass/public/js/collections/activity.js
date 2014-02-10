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

      this.on('reset', function() {
        Sandglass.views.timeline.render();
      });
    },

    loadRecent: function( from, to ) {
      return new Promise(function( res, rej ) {
        /* default today minus 1 month */
        if( !from ) {
          from = moment().zone( defaults.timezoneOffset ).subtract( 'months', 1 );
        }

        /* use now as end date */
        if( !to ) {
          to = moment();
        }

        /* always empty the whole collection, so we call it later with
           a new timerange */
        this.reset();

        this.fetch({
          /* see #1 */
          url: defaults.urlRoot + 'users/' + Sandglass.User.get('id') +
               '/?action=get_activities&from=' + encodeURIComponent( from.format() )
               + '&to=' + encodeURIComponent( to.format() ) + '/'
        })
          .done( res )
          .fail( rej );
      }.bind( this ));
    }
  });

  return ActivityCollection;
});