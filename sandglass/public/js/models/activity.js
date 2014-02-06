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
      if( !this.get('user_id') ) {
        this.set('user_id', Sandglass.User.get('id'));
      }

      this.set('start', moment( this.get('start') || undefined ));

      if( this.get('end') ) {
        this.set('end', moment( this.get('end') ));
      }

      if( !this.isNew() ) {
        this.toCollection();
      }
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
            return res();
          }

          this.save()
            .done(function() {
              this.toCollection();
              res( this );
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

        if( this.get('project_id') ) {
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

        if( this.get('task_id') ) {
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

    start: function() {
      return new Promise(function( res, rej ) {
        this.set('start', moment());
      }.bind( this ));
    },

    end: function() {
      return new Promise(function( res, rej ) {
        this.save( _.assign( {}, this.attributes, { end: moment() } ) , {
          url: defaults.urlRoot + 'activities/' + this.get('id') + '/'
        })
          .done( res )
          .fail( rej );
      }.bind( this ));
    },

    delete: function() {
      return new Promise(function( res, rej ) {
        this.destroy({
          url: defaults.urlRoot + 'activities/' + this.get('id') + '/'
        })
          .done( res )
          .fail( rej )
      }.bind( this ));
    },

    getDuration: function() {
      var _start = this.get('start'),
          _end = this.get('end') || moment(),
          duration = parseInt( moment( _end ).diff( _start, 'minutes' ) );

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