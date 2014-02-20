define([ 'lodash',
         'backbone',
         'moment',
         'defaults',
         'models/activity',
         'views/timeline' ],
  function( _,
            Backbone,
            moment,
            defaults,
            Activity,
            TimelineView ) {

  var ActivityCollection = Backbone.Collection.extend({
    url: defaults.urlRoot + 'activities/',
    model: Activity,

    initialize: function() {
      this._views = [];

      /* fetch of a whole new set - complete rerender */
      this.on('reset', function() {
        Sandglass.views.timeline.remove();
        Sandglass.views.timeline = new TimelineView();
      });
    },

    /* load activities for a given timerange (default this - 1month) */
    loadRecent: function( from, to ) {
      this.off('add');

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
        if( this.models.length ) {
          this.reset();
        }

        this.fetch({
          /* see #1 */
          url: defaults.urlRoot + 'users/' +
               Sandglass.User.get('id') +
               '/' +
               '?action=activities' +
               '&from=' + encodeURIComponent( from ) +
               '&to=' + encodeURIComponent( to ) +
               '/'
        }).done(function() {

          /* initially push the whole collection, to avoid repaints */
          Sandglass.views.timeline
            .add( this.models );

          /* when adding a new model, rerender the timeline */
          this
            .on('add', function( model ) {
              Sandglass.views.timeline.add( model );
            }.bind( this ));

          res();

        }.bind(this))
          .fail( rej );
      }.bind( this ));
    }
  });

  return ActivityCollection;
});