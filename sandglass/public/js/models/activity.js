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

    initialize: function() {
      this.set( 'user_id',  Sandglass.User.get('id') );
      this.set( 'start', this.getDate( this.get('start') || undefined ) );
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
        async.parallel([
          function( cb ) {
            this.setProjectId()
              .then( cb )
          }.bind( this ),

          function( cb ) {
            this.setTaskId()
              .then( cb );
          }.bind( this )
        ], function() {
          this.save( undefined , {
            url: this.url + this.get('id') + '/'
          })
          .done(function() {
             res();
          })
          .fail( rej )
        }.bind( this ));
      }.bind( this ));
    },

    create: function() {
      return new Promise(function( res, rej ) {
        async.parallel([
          function( cb ) {
            this.setProjectId()
              .then( cb )
          }.bind( this ),

          function( cb ) {
            this.setTaskId()
              .then( cb );
          }.bind( this )
        ], function() {
          if( !this.isNew() ) {
            return res( this );
          }

          this.save()
            .done(function() {
              this.toCollection();
              return res( this );
            }.bind( this ))
            .fail( rej );
        }.bind( this ));
      }.bind( this ));
    },

    toCollection: function() {
      Sandglass.collections.activity.add( this );
    },

    setProjectId: function() {
      return new Promise(function( res, rej ) {
        if( !this.get('project') ) {
          return res();
        }

        var foundInCollection =
          Sandglass.collections.project
            .findWhere({ name: this.get('project') });

        if( foundInCollection ) {
          this.set('project_id', foundInCollection.id);
          return res();
        }

        return new Project({
          name: this.get('project'),
          user_id: Sandglass.User.get('id')
        }).create().then( function( project ) {
          this.set( 'project_id', project.get('id') );
          res();
        }.bind( this ), rej );

      }.bind( this ));
    },

    setTaskId: function() {
      return new Promise(function( res, rej ) {
        if( !this.get('task') ) {
          return res();
        }

        var foundInCollection =
          Sandglass.collections.task
            .findWhere({ name: this.get('task') });

        if( foundInCollection ) {
          this.set('task_id', foundInCollection.id);
          return res()
        }

        return new Task({
          name: this.get('task'),
          user_id: Sandglass.User.get('id')
        }).create().then( function( task ) {
          this.set( 'task_id', task.get('id') );
          res();
        }.bind( this ), rej );

      }.bind( this ));
    },

    getTimezoneOffset: function() {
      return new Date().getTimezoneOffset();
    },

    getDate: function( date, timeformat ) {
      return moment( date || undefined, timeformat || undefined )
              .zone( this.getTimezoneOffset() )
              .utc();
    },

    start: function() {
      return new Promise(function( res, rej ) {
        this.set( { 'start': this.getDate() } );
      }.bind( this ));
    },

    end: function() {
      return new Promise(function( res, rej ) {
        this.set( { 'end': this.getDate() } );
        this.save( undefined , {
          url: this.url + this.get('id') + '/'
        })
          .done( res )
          .fail( rej );
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
      var _start = this.get('start'),
          _end = this.get('end') || this.getDate(),
          duration = parseInt( _end.diff( _start, raw ? 'seconds' : 'minutes' ) );

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