define([ 'lodash',
         'backbone',
         'moment',
         'defaults',
         'models/activity' ],
  function( _,
            Backbone,
            moment,
            defaults,
            Activity ) {

  var ActivityCollection = Backbone.Collection.extend({
    url: defaults.urlRoot + 'activities/',
    model: Activity,

    initialize: function() {
      this._views = [];

      /* when adding a new model, rerender the timeline */
      this.on('add', function( model ) {
        Sandglass.views.timeline.add( model );
      }.bind( this ));

      /* fetch of a whole new set - complete rerender */
      this.on('reset', function() {
        Sandglass.views.timeline.render();
      });
    },

    /* load activities for a given timerange (default this - 1month) */
    loadRecent: function( from, to ) {
      return new Promise(function( res, rej ) {
        /* default today minus 1 month */
        if( !from ) {
          from = moment().utc().subtract( 'months', 1 ).format();
        }

        /* use now as end date */
        if( !to ) {
          to = moment().utc().format();
        }

        /* always empty the whole collection, so we call it later with
           a new timerange */
        this.reset();

        this.fetch({
          /* see #1 */
          url: defaults.urlRoot + 'users/' +
               Sandglass.User.get('id') +
               '/' +
               '?action=activities' +
               '&from=' + encodeURIComponent( from ) +
               '&to=' + encodeURIComponent( to ) +
               '/'
        }).done( res )
          .fail( rej );
      }.bind( this ));
    }
  });

  return ActivityCollection;
});