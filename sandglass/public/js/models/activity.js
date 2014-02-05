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
      var _this = this;

      this.toCollection();

      async.parallel([
        function( cb ) {
          _this.setProjectId()
            .then( cb );
        },
        function( cb ) {
          _this.setTaskId()
            .then( cb );
        }
      ], function() {
        new Notification({
          type: 'success',
          text: 'Create activity'
        });

        _this.save();
      });
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
      this.set('started', moment);
    },

    end: function() {
      this.set('ended', moment);
    }
  });

  return Activity;
});