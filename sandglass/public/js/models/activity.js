define([ 'lodash',
         'backbone',
         'moment',
         'defaults',
         'models/project',
         'models/task',
         'async' ],
  function( _,
            Backbone,
            moment,
            defaults,
            Project,
            Task,
            async ) {

  var Activity = Backbone.Model.extend({
    url: defaults.urlRoot + 'activities/',

    parse: function ( data ) {
      if( data.hasOwnProperty( '0' ) ) {
        return data['0'];
      } else {
        return data;
      }
    },

    initialize: function() {
      this.set( 'user_id',  Backbone.user.get('id') );
      this.set( 'start', this.getDate( this.get('start') ) );

      if( this.get('end') ) {
        this.set( 'end', this.getDate( this.get('end') ) );
      }

      return this;
    },

    /* overwrite to ensure moment() on start/end */
    set: function ( attr, opts ) {
      if( typeof attr === 'string' ) {
        switch( attr ) {
          case 'start':
          case 'end':
            opts = this.getDate( opts );
          break;
        }
      } else if( typeof attr === 'object' ) {
        _.forEach( attr, function( val, index ) {
          if( !val ) {
            return;
          }

          switch( index ) {
            case 'start':
            case 'end':
              attr[index] = this.getDate( val );
            break;
          }
        }.bind( this ));
      }

      return Backbone.Model.prototype.set.call( this, attr, opts );
    },

    update: function() {
      return new Promise(function( res, rej ) {
        this.create( { update: true } )
          .then( res, rej );
      }.bind( this ));
    },

    create: function( data ) {
      if( !data ) {
        data = {};
      }

      return new Promise(function( res, rej ) {
        this.setProjectId()
          .then(function() {
            return this.setTaskId();
          }.bind(this))
          .then( function() {
            return new Promise(function( res, rej ) {
              if( data.hasOwnProperty('update') && data.update === true ) {
                this.save( undefined, {
                 url: this.url + this.get('id') + '/'
                } )
                  .then( res );
              } else {
                this.save()
                  .then( res );
              }
            }.bind( this ));
          }.bind( this ))
          .then( function() {
            this.toCollection();
            res();
          }.bind( this ));
      }.bind( this ));
    },

    toCollection: function() {
      Backbone.collections.activity.add( this );
    },

    setProjectId: function() {
      return new Promise(function( res, rej ) {

        /* TODO: change to rej() */
        if( !this.get('project') ) {
          return res();
        }

        var foundInCollection =
          Backbone.collections.project
            .findWhere({ name: this.get('project') });

        if( foundInCollection ) {
          this.set( 'project_id', foundInCollection.id );
          return res();
        }

        new Project({
          name: this.get('project'),
          user_id: Backbone.user.get('id')
        }).create()
          .then( function( project ) {
            this.set( 'project_id', project.get('id') );
            res();
          }.bind( this ), res );

      }.bind( this ));
    },

    setTaskId: function() {
      return new Promise(function( res, rej ) {

        /* TODO: change to rej() */
        if( !this.get('task') ) {
          return res();
        }

        var foundInCollection,
            _searchBy = { name: this.get('task') },
            _projectId = this.get('project_id');

        /* if the activity has a project_id, search only by tasks of this
           project */
        if( _projectId ) {
          _searchBy.project_id = _projectId;
        }

        foundInCollection = Backbone.collections.task.findWhere( _searchBy );

        if( foundInCollection ) {
          this.set( 'task_id', foundInCollection.id );
          return res();
        }

        new Task({
          name: this.get('task'),
          user_id: Backbone.user.get('id'),
          project_id: _projectId
        }).create()
          .then( function( task ) {
            console.log('set task_id', task.get('id'), this)
            this.set( 'task_id', task.get('id') );
            res();
        }.bind( this ), res );
      }.bind( this ));
    },

    getTimezoneOffset: function() {
      return new Date().getTimezoneOffset();
    },

    getDate: function( date, format ) {
      var _newDate = moment( date || undefined, format || undefined ).utc();

      _newDate.zone( this.getTimezoneOffset() );

      return _newDate;
    },

    /* return the user formatted date */
    getFormattedDate: function( index ) {
      return this.getDate( this.get( index ) )
              .format( defaults.dateFormat );
    },

    /* return the user formatted time */
    getFormattedTime: function( index ) {
      return this.getDate( this.get( index ) )
              .format( defaults.timeFormat );
    },

    start: function() {
      return new Promise(function( res, rej ) {
        this.set( 'start', this.getDate() );
      }.bind( this ));
    },

    end: function() {
      return new Promise(function( res, rej ) {
        this.set( 'end', this.getDate() );
        this.update()
          .then( res, rej );
      }.bind( this ));
    },

    delete: function() {
      return new Promise(function( res, rej ) {
        this.destroy({
          url: this.url + this.get('id') + '/'
        })
          .done( res )
          .fail( rej )
      }.bind( this ));
    },

    getDuration: function( raw ) {
      var _start = this.getDate( this.get('start') ),
          _end =  this.getDate( this.get('end') ),
          duration = _end.diff( _start, 'minutes' );

      if( raw ) {
        return duration;
      }

      if( duration < 1 ) {
        return '< 1min';
      }

      if( duration === 60 ) {
        return '1h';
      }

      if( duration > 60 ) {
        return parseInt( duration / 60 ) + 'h ' +
               ( duration - ( parseInt( duration / 60 ) * 60 ) ) + 'min';
      }

      return duration + 'min';
    }
  });

  return Activity;
});