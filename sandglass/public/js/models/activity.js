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
      var _this = this;

      return new Promise(function( res, rej ) {

        if( _this.get('projectId') ) {
          return res();
        }

        var foundInCollection =
          Sandglass.collections.project
            .findWhere({ name: _this.get('project') });

        if( foundInCollection ) {
          _this.set('projectId', foundInCollection.id);
          return res();
        }

        return new Project({
          name: _this.get('project')
        });

      });
    },

    setTaskId: function() {
      var _this = this;

      return new Promise(function( res, rej ) {

        if( _this.get('taskId') ) {
          return res();
        }

        var foundInCollection =
          Sandglass.collections.task
            .findWhere({ name: _this.get('task') });

        if( foundInCollection ) {
          _this.set('taskId', foundInCollection.id);
          return res()
        }

        return new Task({
          name: _this.get('task')
        });

      });
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