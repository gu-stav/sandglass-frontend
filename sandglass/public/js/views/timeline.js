/*global define*/

define([ 'lodash',
         'backbone',
         'views/activityGroup',
         'views/filter',
         'async' ],
  function( _,
            Backbone,
            ActivityGroup,
            FilterView,
            async ) {
  'use strict';

  var Timeline = Backbone.View.extend({
    className: 'timeline',

    setup: function() {
      return Backbone.promiseGenerator(function( res ) {
        this._activityGroups = [];

        this.attributes = {
          sortBy: 'start'
        };

        /* load recent data */
        async.parallel([
          function( cb ) {
            Backbone.collections.project
              .loadAll()
              .then( cb );
          },
          function( cb ) {
            Backbone.collections.task
              .loadAll()
              .then( cb );
          }
        ], function() {
          this.collection
            .loadRecent()
            /* requires a bit of extra work to not rerender the timeline
               with every model on startup - instead pass in the whole set and
               apply event listener afterwards */
            .then( function( models ) {
              this.filterView = new FilterView();

              this
                .add( models )
                .initListener();

              res();
            }.bind( this ) );
        }.bind( this ));
      }.bind( this ));
    },

    initListener: function() {
      this.collection

        /* fetch of a whole new set - complete rerender */
        .on('reset', function() {
          this.reset();
        }.bind( this ))

        /* when adding a new model, rerender the timeline */
        .on('add', function( model ) {
          this.add( model );
        }.bind( this ) );

      this.filterView

        /* sort whole timeline */
        .on('sort', function( data ) {
          this
            .sort( data.value, false )
            .render();
        }.bind( this ))

        /* load recent activities */
        .on( 'load_recent', function( data ) {
          this.collection.loadRecent( data.from, data.to );
        }.bind( this ));

      return this;
    },

    reset: function() {
      this.$el.empty().detach();
      this.sort( 'start', true );
      this.render();
    },

    sort: function( index, keepBuild ) {
      this.attributes.sortBy = index;

      /* do not delete existing groups - only reorder (no data was added) */
      if( !keepBuild ) {
        _.forEach( this._activityGroups, function( activityGroup ) {
          activityGroup.$el.empty().detach();
        });

        this._activityGroups = [];

        _.forEach( this.collection.models, function( activity ) {
          this.createGroup( activity );
        }.bind( this ));
      }

      /* re-order all groups */
      this._activityGroups =
      _.sortBy( this._activityGroups, function( activityGroup ) {
        return activityGroup.attributes.groupName;
      });

      if( this.attributes.sortBy === 'start' ) {
        this._activityGroups.reverse();
      }

      return this;
    },

    add: function( model ) {
      /* also accept an array of models */
      if( _.isArray( model ) ) {
        _.forEach( model, function( m ) {
          this.createGroup( m );
        }.bind( this ));

        this
          .sort( this.attributes.sortBy, false )
          .render();
      } else {
        this.createGroup( model )
            .sort( this.attributes.sortBy, false )
            .render();
      }

      return this;
    },

    createGroup: function( model ) {
      var _modelFindBy = model.get( this.attributes.sortBy ),
          _added = false,
          _view,
          _groupLabel;

      if( this.attributes.sortBy === 'start' ) {
        _modelFindBy = _modelFindBy.format( 'YYYY-MM-DD' );
        _groupLabel = model.getFormattedDate( this.attributes.sortBy );
      } else {
        _.each(['task', 'project'], function( item ) {
          if( this.attributes.sortBy === item + '_id' ) {
            _modelFindBy = Backbone.collections[ item ]
                            .getNameById( model.get( item + '_id' ) );

            return false;
          }
        }.bind( this ));
      }

      _.forEach( this._activityGroups, function( groupView ) {
        if( groupView.attributes.groupName === _modelFindBy ) {
          groupView.add( model );
          _added = true;

          groupView.listenTo( model,
                              'destroy',
                              function() {
                                groupView.removeModel( model );
                              });

          return false;
        }
      });

      if( _added ) {
        return this;
      }

      var _attrs = {
        sortBy: this.attributes.sortBy,
        groupName: _modelFindBy,
        groupLabel: _groupLabel ? _groupLabel : _modelFindBy
      };

      _view = new ActivityGroup( { model: model,
                                   attributes: _attrs
                                 } );

      this._activityGroups.push( _view );
      return this;
    },

    render: function() {
      _.forEach( this._activityGroups, function( activityGroup ) {
        this.$el.append( activityGroup.render().$el );
      }.bind( this ));

      this.$el.appendTo('.sandglass');
    },
  });

  return Timeline;
});