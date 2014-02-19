define([ 'lodash',
         'backbone',
         'moment',
         'defaults',
         'models/activity' ],
  function( _,
            Backbone,
            moment,
            defaults,
            ActivityModel ) {

  var Activity = Backbone.View.extend({
    tagName: 'li',
    className: 'timeline__item',
    template: _.template( '<% if (!tracking) {%><button class="timeline__item-delete timeline__button button button--link"></button><%}%>' +
                          '<button class="timeline__item-end timeline__button button button--link"></button>' +
                          '<% if (!tracking) {%><button class="timeline__item-clone timeline__button button button--link"></button><%}%>' +
                          '<% if (!tracking) {%><button class="timeline__item-edit timeline__button button button--link"></button><%}%>' +

                          /* activity & project */
                          '<h2 class="timeline__headline">' +
                             '<span class="timeline__task">${ task }</span> - ' +
                             '<span class="timeline__project">${ project }</span>' +
                          '</h2>' +

                          /* description */
                          '<p class="timeline__description">${ parsedDescription }</p>' +

                          '<div class="timeline__time">'+
                             '<strong class="timeline__duration">${ duration }</strong>' +
                             '<small class="timeline__parsedStartEnd">' +
                                '<span class="timeline__parsedStarted">${ parsedStarted }</span>' +
                                ' - <span class="timeline__parsedEnded">${ parsedEnded }</span>' +
                             '</small>' +
                          '</div>'),

    events: {
      'click .timeline__item-edit': 'edit',
      'click .timeline__item-clone': 'clone',
      'click .timeline__item-delete': 'delete',
      'click .timeline__item-end': 'end'
    },

    initialize: function() {
      this.editable = ['duration', 'task', 'project',
                       'description', 'parsedStarted', 'parsedEnded'];

      this.listenTo( this.model, 'sync', this.render );
    },

    render: function() {
      var _data = {
        task: Sandglass.collections.task.getNameById ( this.model.get('task_id') ),
        project: Sandglass.collections.project.getNameById ( this.model.get('project_id') ),
        parsedDescription: this.model.get('description'),
        duration: this.model.getDuration(),
        parsedStarted: this.model.get('start').format( defaults.timeFormat ),
        parsedEnded: this.model.get('end') ? this.model.get('end').format( defaults.timeFormat ) : undefined,
        tracking: !this.model.get('end')
      };

      this.$el.html( this.template( _data ) );
      this.$el[ ( _data.tracking ? 'add' : 'remove' ) + 'Class']( 'timeline__item--track' );

      /* enables automatical updates of the duration */
      if( _data.tracking ) {
        this.setInterval();
      } else {
        this.clearInterval();
      }

      return this;
    },

    setInterval: function() {
      if( this.timer ) {
        return this;
      }

      this.timer = setInterval(function() {
        this.render();
      }.bind( this ), ( 1000 / 3 ) * 60);
    },

    clearInterval: function() {
      clearInterval( this.timer );
    },

    edit: function( e ) {
      e.preventDefault();

      if( this.edit === true ) {
        return this.endEdit( e );
      }

      _.forEach( this.editable, function( item ) {
        var $el = this.$el.find('.timeline__' + item );

        $el
          .prop( 'contenteditable', true )
          .on('blur', function( e ) {
            var _text = $(e.target).text();

            if( ['parsedStarted', 'parsedEnded'].indexOf( item ) !== -1 ) {
              var _internalKey = ( item === 'parsedStarted' ? 'start' : 'end' )
                  _parsed = /(\d+):(\d+)/.exec( _text ),
                  _text = this.model.getDate( this.model.get( _internalKey ) )
                              .hours( _parsed[1] )
                              .minutes( _parsed[2] );

              item = _internalKey;
            }

            this.model.set( item, _text, { silent: true } );
          }.bind( this ));

      }.bind( this ));

      this.$el.addClass('timeline__item--edit');
      this.edit = true;

      /* TODO - remove that hack */
      setTimeout(function() {
        $( window )
          .on('click.activity_edit', function( e ) {
            if( !$(e.target).closest( this.$el ).length ) {
              this.endEdit( e );
            }
          }.bind( this ));
      }.bind( this ), 10);

      return this;
    },

    endEdit: function( e ) {
      e.preventDefault();

      $( window )
        .off('.activity_edit');

      _.forEach( this.editable, function( item ) {
        this.$el.find('.timeline__' + item ).prop( 'contenteditable', false );
      }.bind( this ));

      this.model.update();
      this.$el.removeClass('timeline__item--edit');
      this.edit = false;

      return this;
    },

    clone: function( e ) {
      e.preventDefault();

      var _overwrites = {
        start: undefined,
        end: undefined,
        id: undefined
      };

      return new ActivityModel( _.assign( {}, this.model.attributes, _overwrites ) )
        .create();
    },

    delete: function( e ) {
      e.preventDefault();

      return new Promise(function( res, rej ) {
        this.model.delete()
          .then(function() {
            this.remove();
            res();
          }.bind( this ),
          function() {
            rej();
          });
      }.bind( this ));
    },

    end: function( e ) {
      e.preventDefault();
      return this.model.end();
    }
  });

  return Activity;
});