define([ 'lodash',
         'backbone',
         'defaults',
         'moment',
         'models/activity' ],
  function( _,
            Backbone,
            defaults,
            moment,
            Activity ) {

  var Track = Backbone.View.extend({
    tagName: 'form',
    className: 'sandglass__search',

    template: _.template( '  <div class="sandglass__sortby">' +
                          '    <i class="fa fa-sort sandglass__sortby-icon"></i>' +
                          '    <button class="sandglass__sortby-button"' +
                          '            value="start">Date</button>' +
                          '    <button class="sandglass__sortby-button"' +
                          '            value="task_id">Task</button>' +
                          '    <button class="sandglass__sortby-button"' +
                          '            value="project_id">Project</button>' +
                          '  </div>' +

                          '  <div class="sandglass__search-startend">' +
                          '    <i class="fa fa-search sandglass__search-icon"></i>' +
                          '    <input type="text"' +
                          '           class="sandglass__search-start"' +
                          '           name="filter_start"' +
                          '           placeholder="always" /> - ' +

                          '    <input type="text"' +
                          '           class="sandglass__search-end"' +
                          '           name="filter_end"' +
                          '           placeholder="today" />' +
                          '  </div>' ),

    events: {
      'click .sandglass__sortby-button': 'sort',
      'change .sandglass__search-startend > input': 'loadRecent',
    },

    initialize: function() {
      var _uiDateFormat = defaults.dateFormat;

      /* mapping for jquery ui dateformat */
      _uiDateFormat = _uiDateFormat.replace('MM', 'mm');
      _uiDateFormat = _uiDateFormat.replace('DD', 'dd');
      _uiDateFormat = _uiDateFormat.replace('YYYY', 'yy');

      this._uiDateFormat = _uiDateFormat;

      this.render();

      /* add autocomplete & datepicker */
      require([ 'jquery.ui.autocomplete',
                'jquery.ui.datepicker'], function() {
                  /* apply autocomplete */
                  _.forEach( ['project', 'task'], function( item ) {
                    this.$('input[name="' + item + '"]')
                      .autocomplete({
                        minLength: 0,
                        source: function( req, res ) {
                          var term = req.term,
                              filtered;

                          /* filter elements */
                          filtered =
                            _.map( Backbone.collections[ item ].getAutocompleteList(),
                                   function( el ) {
                                     if( el.label.indexOf( term ) !== -1 ) {
                                       return el;
                                     }
                                   });

                          res( _.compact( filtered ) );
                        },

                        /* do not fill input when focusing elements */
                        focus: function() {
                          return false;
                        },

                        select: function( e, ui ) {
                          var $target = $(e.target);

                          /* fill with label & save the id */
                          $target
                            .val( ui.item.label )
                            .data( 'selectedId', ui.item.value );

                          /* focus next input field */
                          $target
                            .parent()
                            .next('div')
                              .children('input')
                                .focus();

                          return false;
                        }.bind( this ),

                        delay: 0
                      });
                  }.bind( this ));

                  _.forEach( [ 'start', 'end' ], function( item ) {
                    this.$('input[name="date_' + item + '"]')
                      .datepicker({
                        dateFormat: this._uiDateFormat,
                        maxDate: new Date()
                      });
                  }.bind( this ));

                  /* apply datepicker */
                  _.forEach(['start', 'end'], function( item ) {
                    this.$('.sandglass__search-' + item)
                      .datepicker({
                        dateFormat: this._uiDateFormat,
                        maxDate: new Date()
                      })
                      .datepicker( 'setDate',
                                   item === 'start' ? '-1m' : new Date() );
                  }.bind( this ));
                }.bind( this ));
    },

    sort: function( e ) {
      e.preventDefault();

      var _val = this.$(e.target).val();

      this
        .$('button[value="'+ _val +'"].sandglass__sortby-button')
          .addClass('sandglass__sortby-button--active')
          .siblings()
            .removeClass('sandglass__sortby-button--active');

      this.trigger('sort', { value: _val });
    },

    loadRecent: function( e ) {
      var from,
          to,
          $target = $(e.target),
          $other = $target.siblings('input');

      if( $target.attr('name') === 'filter_start' ) {
        from = $target.val();
        to = $other.val();
      } else {
        to = $target.val();
        from = $other.val();
      }

      if( from ) {
        from = moment( from, defaults.dateFormat );
      }

      if( to ) {
        to = moment( to, defaults.dateFormat )
              .hour( 23 )
              .minute( 59 )
              .second( 59 );
      }

      this.trigger( 'load_recent', { from: from, to: to } );
    },

    render: function() {
      var _data = {
        dateFormat: defaults.dateFormat,
        timeFormat: defaults.timeFormat
      };

      this.$el.html( this.template( _data ) );

      this
        .$('button[value="start"].sandglass__sortby-button')
        .addClass('sandglass__sortby-button--active');

      this.$el.appendTo( '.track' );

      return this;
    }
  });

  return Track;
});