define([ 'lodash',
         'backbone',
         'views/activityGroup' ],
  function( _,
            Backbone,
            ActivityGroup ) {

  var Timeline = Backbone.View.extend({
    className: 'timeline',

    initialize: function() {
      this._activityGroups = [];

      this.attributes = {
        sortBy: 'start'
      };;
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
          .render()
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
            _modelFindBy = Sandglass.collections[ item ]
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

      _view = new ActivityGroup( { model: model,
                                   attributes: {
                                     sortBy: this.attributes.sortBy,
                                     groupName: _modelFindBy,
                                     groupLabel: _groupLabel ? _groupLabel :
                                                               _modelFindBy }
                                  } );

      this._activityGroups.push( _view );
      return this;
    },

    render: function() {
      _.forEach( this._activityGroups, function( activityGroup ) {
        this.$el
          .append( activityGroup.render().$el );
      }.bind( this ));

      this.$el.appendTo('.sandglass');
    },
  });

  return Timeline;
});