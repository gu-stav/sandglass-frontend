define([ 'lodash',
         'nvd3' ],
  function( _, nv ) {
    var Chart = function( data ) {
      var $wrapper = $('<div/>')
                        .addClass('sandglass__graph')
                        .attr('id', 'graph')
                        .append('<svg/>');

      $wrapper.insertAfter('.track');

      this.svg = d3.select( '#graph svg' );
      this.chart = nv.models.multiBarChart()
                            .color( [ '#333',
                                      '#e4e4e4' ] )
                            .showControls( false )
                            .showYAxis( false )
                            .showXAxis( true )
                            .transitionDuration( 0 )
                            .stacked( false )
                            .delay( 0 )
                            .reduceXTicks( true )
                            .groupSpacing( 0.1 )
                            .tooltip(function(key, x, y, e, graph) {
                              return '<h3>' + key + '</h3>' +
                                     '<p>' +  y + ' minutes</p>';
                            })
                            .margin( {
                              bottom: 30,
                              top: 25,
                              left: 5,
                              right: 5
                            } );

      /* format the minutes to full integers */
      this.chart.yAxis
        .tickFormat(d3.format(',.f'));
    },

    controls;

    controls = {
      update: function( data ) {
        this.svg
          .datum( data || [] )
          .call( this.chart );
      }
    };

  _.forOwn( controls, function( control, key ) {
    Chart.prototype[ key ] = control;
  });

  return Chart;

});