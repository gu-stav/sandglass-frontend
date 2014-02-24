define([ 'lodash',
         'backbone',
         'models/activity' ],
  function( _,
            Backbone,
            Activity ) {

  var Activity = Backbone.View.extend({
    tagName: 'li',
    className: 'timeline__item',
    template: _.template( '<% if (!tracking) { %>' +
                          '<button class="timeline__item-delete timeline__button ' +
                                         'button button--link"></button>' +
                          '<% } %>' +

                          '<% if( tracking ) { %>' +
                          '<button class="timeline__item-end timeline__button ' +
                                          'button button--link"></button>' +
                          '<% } %>' +

                          '<% if (!tracking) { %>' +
                          '<button class="timeline__item-edit timeline__button ' +
                                         'button button--link"></button>' +
                          '<% } %>' +

                          /* activity & project */
                          '<h2 class="timeline__headline">' +
                             '<span class="timeline__task">${ task }</span> - ' +
                             '<span class="timeline__project">${ project }</span>' +
                          '</h2>' +

                          /* description */
                          '<p class="timeline__description">' +
                          '${ parsedDescription }' +
                          '</p>' +

                          '<div class="timeline__time">'+
                          '<strong class="timeline__duration">${ duration }</strong>' +
                          '<small class="timeline__parsedStartEnd">' +
                          '<span class="timeline__parsedStarted">${ parsedStarted }</span>' +
                          ' - <span class="timeline__parsedEnded">${ parsedEnded }</span>' +
                          '</small>' +
                          '</div>'),

    events: {
      'click .timeline__item-edit':   'edit',
      'click .timeline__item-delete': 'delete',
      'click .timeline__item-end':    'end'
    },

    inConflict: false,

    /* editable elements in edit mode */
    editable: [ 'task',
                'project',
                'description',
                'parsedStarted',
                'parsedEnded' ],

    initialize: function() {
      this.listenTo( this.model, 'sync', this.render );
    },

    render: function( extraData ) {
      var _data = {
        task: Sandglass.collections.task
                .getNameById ( this.model.get('task_id') ),
        project: Sandglass.collections.project
                  .getNameById ( this.model.get('project_id') ),
        parsedDescription: this.model.get('description'),
        duration: this.model.getDuration(),
        parsedStarted: this.model.getFormattedTime( 'start' ),
        parsedEnded: this.model.get('end') ?
                        this.model.getFormattedTime( 'end' ) : undefined,
        tracking: this.model.get('end') ? false : true
      };

      _data = _.assign( _data, extraData );

      this.$el.html( this.template( _data ) );

      /* add/remove tracking indicator class */
      this
        .$el[ ( _data.tracking ?
                  'add' : 'remove' ) + 'Class']( 'timeline__item--track' );

      /* add/ remove conflict indicator class */
      if( !_data.hasOwnProperty( 'conflict' ) ) {
        _data.conflict = this.inConflict;
      } else {
        this.inConflict = _data.conflict;
      }

      this
        .$el[ ( _data.conflict ? 'add' : 'remove' ) + 'Class']( 'timeline__item--conflict' );

      /* enable/disable automatical updates of the duration */
      this[ ( _data.tracking ? 'set' : 'clear' ) + 'Interval' ]();

      return this;
    },

    /* start automatic updates */
    setInterval: function() {
      if( this.timer ) {
        return this;
      }

      this.timer = setInterval(function() {
        this.render();
        this.model.trigger( 'duration_change' );
      }.bind( this ), ( 1000 / 3 ) * 60 );

      return this;
    },

    /* stop automatic updates */
    clearInterval: function() {
      clearInterval( this.timer );

      return this;
    },

    /* start editing */
    edit: function( e ) {
      if( e ) {
        e.preventDefault();
      }

      if( this.edit === true ) {
        return this.endEdit( e );
      }

      Backbone.history.navigate( '/track/' + this.model.get('id') + '/edit' );

      this.clearInterval();

      this.$el.addClass('timeline__item--edit');
      this.edit = true;

      _.forEach( this.editable, function( item ) {
        var $el = this.$el.find('.timeline__' + item );

        $el
          .prop( 'contenteditable', true )
          .on( 'blur.activity_edit', function( e ) {
            var _text = $(e.target).text(),
                _currentText = this.model.get( item );

            if( ['parsedStarted', 'parsedEnded'].indexOf( item ) !== -1 ) {
              item = ( item === 'parsedStarted' ? 'start' : 'end' );

              var _parsed = /^(\d+):(\d+)$/.exec( _text ),
                  _text = this.model.getDate( this.model.get( item ) )
                              .hours( _parsed[1] )
                              .minutes( _parsed[2] );
            }

            /* do not update when nothing has changed */
            if( _text === _currentText ) {
              return;
            }

            /* save silently, because the whole activity is getting saved,
               when the edit mode ends to avoid requests and wrong durations,
               caused by navigation with tab */
            this.model.set( item, _text, { silent: true } );
          }.bind( this ));
      }.bind( this ));

      /* when clicking somewhere outside of the element, bring the edit
         mode to an edn */
      $( window )
        .on('click.activity_edit', function( e ) {
          if( !$(e.target).closest( this.$el ).length ) {
            this.endEdit( e );
          }
        }.bind( this ));

      return this;
    },

    /* end the edit mode */
    endEdit: function( e ) {
      e.preventDefault();

      /* save changes */
      this.model
        .update()
        .then(function() {
          this.$el.removeClass('timeline__item--edit');
          this.edit = false;

          this.setInterval();

          Backbone.history.navigate( '/track' );

          /* remove clickhandler, for ending edit mode */
          $( window ).off('.activity_edit');

          _.forEach( this.editable, function( item ) {
            this.$el.find('.timeline__' + item )
              .prop( 'contenteditable', false );
          }.bind( this ));
        }.bind( this ));

      return this;
    },

    delete: function( e ) {
      e.preventDefault();

      if( !confirm('Sure, you want to delete this?') ) {
        return this;
      }

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