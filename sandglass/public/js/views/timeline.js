define([ 'lodash',
         'backbone',
         'defaults',
         'views/activityGroup' ],
  function( _,
            Backbone,
            defaults,
            ActivityGroup ) {

  var Timeline = Backbone.View.extend({
    el: $('.timeline'),

    initialize: function() {
      this._activityGroups = [];
      this._activities = [];

      this.attributes = {
        sortBy: defaults.sortActivitiesBy
      };
    },

    sort: function( index, keepBuild ) {
      this.attributes.sortBy = index;

      if( !keepBuild ) {
        _.forEach( this._activityGroups, function( activityGroup ) {
          activityGroup.remove();
        });

        this._activityGroups = [];

        _.forEach( this._activities, function( activity ) {
          this.createGroup( activity );
        }.bind( this ));
      }

      /* re-order all groups */
      _.sortBy( this._activityGroups, function( activityGroup ) {
        return activityGroup.groupName;
      });

      if( this.attributes.sortBy === 'start' ) {
        this._activityGroups.reverse();
      }

      this.render();
    },

    add: function( model ) {
      this._activities.push( model );
      this.createGroup( model );
      this.sort( this.attributes.sortBy );
    },

    createGroup: function( model ) {
      var _modelFindBy = model.get( this.attributes.sortBy ),
          _added = false,
          _view;

      if( this.attributes.sortBy === 'start' ) {
        if( typeof _modelFindBy === 'string' ) {
          _modelFindBy = moment( _modelFindBy );
        }

        _modelFindBy = _modelFindBy.format('YYYY-MM-DD');
      }

      _.each(['task', 'project'], function( item ) {
        if( this.attributes.sortBy === item + '_id' ) {
          _modelFindBy = Sandglass.collections.task
                          .getNameById( model.get( item + '_id' ) );
        }
      }.bind( this ));

      _.forEach( this._activityGroups, function( groupView ) {
        if( groupView.attributes.groupName === _modelFindBy ) {
          groupView.add( model );
          _added = true;
        }
      });

      if( !_added ) {
        _view = new ActivityGroup( { attributes: { sortBy: this.attributes.sortBy,
                                                   groupName: _modelFindBy } } );
        _view.add( model );
        this._activityGroups.push( _view );
      }
    },

    render: function() {
      _.forEach( this._activityGroups, function( activityGroup ) {
        this.$el
          .append( activityGroup.render().$el );
      }.bind( this ));
    }
  });

  return Timeline;
});