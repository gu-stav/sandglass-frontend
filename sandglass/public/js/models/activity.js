define([ 'lodash',
         'backbone',
         'moment',
         'defaults',
         'models/notification',
         'models/project',
         'models/task',
         'async' ],
  function( _,
            Backbone,
            moment,
            defaults,
            Notification,
            Project,
            Task,
            async ) {

  var Activity = Backbone.Model.extend({
    urlRoot: defaults.urlRoot,
    url: 'activities/',

    initialize: function() {
      return new Promise(function( res, rej ) {
        this.toCollection();

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
          if( this.isNew() ) {
            this.save()
              .done( res )
              .fail( rej );
          }
        }.bind( this ));
      }.bind( this ));
    },

    toCollection: function() {
      Sandglass.collections.activity.add( this );
    },

    setProjectId: function() {
      return new Promise(function( res, rej ) {

        if( this.get('projectId') ) {
          return res();
        }

        var foundInCollection =
          Sandglass.collections.project
            .findWhere({ name: this.get('project') });

        if( foundInCollection ) {
          this.set('projectId', foundInCollection.id);
          return res();
        }

        return new Project({
          name: this.get('project')
        });

      }.bind( this ));
    },

    setTaskId: function() {
      return new Promise(function( res, rej ) {

        if( this.get('taskId') ) {
          return res();
        }

        var foundInCollection =
          Sandglass.collections.task
            .findWhere({ name: this.get('task') });

        if( foundInCollection ) {
          this.set('taskId', foundInCollection.id);
          return res()
        }

        return new Task({
          name: this.get('task')
        });

      }.bind( this ));
    },

    start: function() {
      return new Promise(function( res, rej ) {
        this.set('started', moment);
      }.bind( this ));
    },

    end: function() {
      return new Promise(function( res, rej ) {
        this.set('ended', moment);
      }.bind( this ))
    }
  });

  return Activity;
});