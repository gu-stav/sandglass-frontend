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
                            .color( [ '#53B482',
                                      '#A0D1B8',
                                      '#2F7551' ] )
                            .showLegend( false )
                            .showControls( false )
                            .showYAxis( false )
                            .showXAxis( false )
                            .transitionDuration( 0 )
                            .delay( 0 )
                            .stacked( true )
                            .reduceXTicks( false )
                            .margin( {
                              bottom: 5,
                              top: 5,
                              left: 5,
                              right: 5
                            } );
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