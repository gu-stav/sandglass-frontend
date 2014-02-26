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

    /* load activities for a given timerange (default this - 1month) */
    loadRecent: function( from, to ) {
      return new Promise(function( res, rej ) {
        /* default today minus 1 month */
        if( !from ) {
          from = moment().utc().subtract( 'months', 1 ).format();
        }

        /* use now as end date */
        if( !to ) {
          to = moment().utc()
                .hour( 23 )
                .minute( 59 )
                .second( 59 )
                .format();
        }

        /* always empty the whole collection, so we call it later with
           a new timerange */
        if( this.models.length ) {
          this.reset();
        }

        this.fetch({
          /* see #1 */
          url: defaults.urlRoot + 'users/' +
               Backbone.user.get('id') +
               '/' +
               '@activities' +
               '?from=' + encodeURIComponent( from ) +
               '&to=' + encodeURIComponent( to ) +
               '/'
        }).done(function() {
          res( this.models );
        }.bind( this ))
          .fail( rej );
      }.bind( this ));
    }
  });

  return ActivityCollection;
});