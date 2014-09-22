

// FIXME: pass in chart property with list of variables to chart, if that doesn't exist just chart first two variables. Any other variables can go in the infobubble for the data point
// FIXME: Might also have a setting to determine if we want to chart more than two variables (multiple Y-axis)
// FIXME: Might have instances where we want to map the datetime as a non-timeseries value (e.g. 1-Dec, 22-Dec, 13-Jan instead of 13-Jan, 1-Dec, 22-Dec) (use categories and omit X values?)
function createChart (wInstance) {
	console.log(wInstance);
	var series,dataSeries,seriesName,datearray;
	/* reset the chart type since it may have been redefined during previous data processing */
	wInstance.chart.colors = [];
	wInstance.chart.chart.type = 'scatter';
	wInstance.chart.plotOptions.series.marker.enabled = true;
	if (typeof(wInstance.settings.chart) !== "undefined") { $.extend(true, wInstance.chart, wInstance.settings.chart); }
	wInstance.chart.series = [];
	var yMin=0;
	var yMax=100;
	for (series in wInstance.data) {
		dataSeries = [];
		seriesName = wInstance.data[series].seriesMeta.label;
		//FIXME: use a isHEX function here?
		wInstance.chart.colors.push( (
			typeof( wInstance.data[series].seriesMeta.color ) !== 'undefined' && wInstance.data[series].seriesMeta.color.length > 0 ?
				wInstance.data[series].seriesMeta.color :
				'#' + ( function( h ) { return new Array ( 7-h.length ).join( "0" ) + h } ) ( ( Math.random( ) * ( 0xFFFFFF+1 ) << 0 ).toString( 16 ) )
		) );
		dataKeys = Object.keys(wInstance.data[series].dataMeta);
		chartAxis = ['x','y'];
		for (i in wInstance.data[series].data) {
			if (wInstance.data[series].dataMeta[dataKeys[0]].type == 'datetime') {
				dataX = wInstance.data[series].data[i][dataKeys[0]].getTime();
				wInstance.chart.chart.type = 'line';
				wInstance.chart.plotOptions.series.lineWidth = 1;
				wInstance.chart.plotOptions.series.marker.enabled = false;
			} else {
				dataX = wInstance.data[series].data[i][dataKeys[0]];
			}
			dataY = wInstance.data[series].data[i][dataKeys[1]];
			yMin=Math.min(yMin,dataY);
			yMax=Math.max(yMax,dataY);
			dataSeries.push([dataX,dataY]);
		}
		for (idxDataKey in dataKeys) {
			if (wInstance.data[series].dataMeta[dataKeys[idxDataKey]].type == 'datetime') {
				wInstance.chart[chartAxis[idxDataKey]+'Axis'].type = 'datetime';
				if (wInstance.data[series].dataMeta[dataKeys[idxDataKey]].highchart.axis.dateTimeLabelFormats) {
					wInstance.chart[chartAxis[idxDataKey]+'Axis'].dateTimeLabelFormats = wInstance.data[series].dataMeta[dataKeys[idxDataKey]].highchart.axis.dateTimeLabelFormats;
				} else {
					wInstance.chart[chartAxis[idxDataKey]+'Axis'].dateTimeLabelFormats = null;
				}
			} else {
				wInstance.chart[chartAxis[idxDataKey]+'Axis'].type = 'linear';
				wInstance.chart[chartAxis[idxDataKey]+'Axis'].dateTimeLabelFormats = null;
			}
			if (wInstance.settings.tooltip && wInstance.settings.tooltip.detail && wInstance.settings.tooltip.detail == 'short' && wInstance.data[series].dataMeta[dataKeys[idxDataKey]].labelShort) {
				wInstance.chart[chartAxis[idxDataKey]+'Axis'].title.text = wInstance.data[series].dataMeta[dataKeys[idxDataKey]].labelShort;
			} else if (wInstance.data[series].dataMeta[dataKeys[idxDataKey]].label) {
				wInstance.chart[chartAxis[idxDataKey]+'Axis'].title.text = wInstance.data[series].dataMeta[dataKeys[idxDataKey]].label;
			} else {
				wInstance.chart[chartAxis[idxDataKey]+'Axis'].title.text = null;
			}
			if (wInstance.data[series].dataMeta[dataKeys[idxDataKey]].range && chartAxis[idxDataKey]=='y') {
				wInstance.chart[chartAxis[idxDataKey]+'Axis'].min = Math.min(yMin,wInstance.data[series].dataMeta[dataKeys[idxDataKey]].range[0]);
				wInstance.chart[chartAxis[idxDataKey]+'Axis'].max = Math.max(yMax,wInstance.data[series].dataMeta[dataKeys[idxDataKey]].range[1]);}
			else if (wInstance.data[series].dataMeta[dataKeys[idxDataKey]].range && chartAxis[idxDataKey]=='x'){
				wInstance.chart[chartAxis[idxDataKey]+'Axis'].min = wInstance.data[series].dataMeta[dataKeys[idxDataKey]].range[0];
				wInstance.chart[chartAxis[idxDataKey]+'Axis'].max = wInstance.data[series].dataMeta[dataKeys[idxDataKey]].range[1];}
			else if (chartAxis[idxDataKey]=='y') {
				wInstance.chart[chartAxis[idxDataKey]+'Axis'].min=yMin; 
				wInstance.chart[chartAxis[idxDataKey]+'Axis'].max=yMax; 
			}
			else {
				wInstance.chart[chartAxis[idxDataKey]+'Axis'].min = null;
				wInstance.chart[chartAxis[idxDataKey]+'Axis'].max = null;
			}
			console.log(yMin,yMax);
			/*wInstance.chart.tooltip.formatter = function () {
				if (typeof(wInstance.data[series].dataMeta[dataKeys[0]]) != 'undefined' && 'format' in wInstance.data[series].dataMeta[dataKeys[0]] && typeof(wInstance.data[series].dataMeta[dataKeys[0]].format) == 'function' || typeof(wInstance.data[series].dataMeta[dataKeys[0]].format) == 'object') {
					xVal = wInstance.data[series].dataMeta[dataKeys[0]].format( (this.series.xAxis.options.type=='datetime'?new Date(this.x):this.x) );
				} else {
					xVal = this.x;
				}
				if (typeof(wInstance.data[series].dataMeta[dataKeys[1]]) != 'undefined' && 'format' in wInstance.data[series].dataMeta[dataKeys[1]] && typeof(wInstance.data[series].dataMeta[dataKeys[1]].format) == 'function' || typeof(wInstance.data[series].dataMeta[dataKeys[1]].format) == 'object') {
					yVal = wInstance.data[series].dataMeta[dataKeys[1]].format( (this.series.yAxis.options.type=='datetime'?new Date(this.y):this.y) );
				} else {
					yVal = this.y;
				}
				if ( wInstance.settings.tooltip && wInstance.settings.tooltip.detail && wInstance.settings.tooltip.detail == 'short' ) {
					return this.series.xAxis.options.title.text + ': ' + xVal + ' ¦ ' + this.series.yAxis.options.title.text + ': ' + yVal;
				} else {
					return '<b>'+ this.series.name +'</b><br/>'+
						this.series.xAxis.options.title.text + ': ' + xVal + '<br>' +
						this.series.yAxis.options.title.text + ': ' + yVal;
				}
			};*/
		}
		wInstance.chart.series.push({name : seriesName , data : dataSeries});
		if (wInstance.chart.chart.type == 'scatter' && dataSeries.length > 1) {
			wInstance.chart.series.push( {
				dashStyle           : 'Dash' ,
				data                : ( fitData( dataSeries ) ).data.sort( function ( a , b ) { return a[0] - b[0]; } ) ,
				enableMouseTracking : false ,
				lineWidth           : 1 ,
				marker              : { enabled : false } ,
				name                : 'Line of Best Fit' ,
				showCheckbox        : true ,
				showInLegend        : true ,
				type                : 'line' ,
				visible             : false ,
				
				events : {
					checkboxClick : function ( evt ) {
						evt.checked ? this.show() : this.hide();
					} ,
					legendItemClick : function ( evt ) {
						this.select( !this.visible );
					}
				}
			} );
		}
	}
	wInstance.highChart.destroy();
	wInstance.highChart = new Highcharts.Chart(wInstance.chart);
	
	// FIXME: make this part of the chart? ref: http://jsfiddle.net/FwSbd/
	wInstance.settings.container.find( '.canvas .highcharts-container' ).append('<div class="ctrl-pan"></div>');
	wInstance.settings.container.find( '.canvas .ctrl-pan' ).click( function ( evt ) {
		var currentOffset = $( this ).offset( );
		var clickPoint = {
			x : evt.pageX - currentOffset.left ,
			y : evt.pageY - currentOffset.top
		};
		// FIXME: does the wInstance closure cause memory issues? closures!
		// var wInstance = aaasClimateViz.widgets[ aaasClimateViz.widgetLookup[ '#' + $( this ).parents( '.widget.linechart' ).parent() ] ];
		panX = ( wInstance.highChart.xAxis[0].max - wInstance.highChart.xAxis[0].min ) / 4;
		panY = ( wInstance.highChart.yAxis[0].max - wInstance.highChart.yAxis[0].min ) / 4;
		if ( clickPoint.y <= 11 && clickPoint.x >= 10 && clickPoint.x <= 21 ) {
			wInstance.highChart.yAxis[0].setExtremes( wInstance.highChart.yAxis[0].min + panY , wInstance.highChart.yAxis[0].max + panY );
			if ( typeof( wInstance.highChart.resetZoomButton) == 'undefined' ) { wInstance.highChart.showResetZoom(); }
		} else if ( clickPoint.y >= 21 && clickPoint.x >= 10 && clickPoint.x <= 21 ) {
			wInstance.highChart.yAxis[0].setExtremes( wInstance.highChart.yAxis[0].min - panY , wInstance.highChart.yAxis[0].max - panY );
			if ( typeof( wInstance.highChart.resetZoomButton) == 'undefined' ) { wInstance.highChart.showResetZoom(); }
		} else if ( clickPoint.y > 11 && clickPoint.y < 21 && clickPoint.x <= 11 ) {
			wInstance.highChart.xAxis[0].setExtremes( wInstance.highChart.xAxis[0].min - panX , wInstance.highChart.xAxis[0].max - panX );
			if ( typeof( wInstance.highChart.resetZoomButton) == 'undefined' ) { wInstance.highChart.showResetZoom(); }
		} else if ( clickPoint.y > 11 && clickPoint.y < 21 && clickPoint.x >= 21 ) {
			wInstance.highChart.xAxis[0].setExtremes( wInstance.highChart.xAxis[0].min + panX , wInstance.highChart.xAxis[0].max + panX );
			if ( typeof( wInstance.highChart.resetZoomButton) == 'undefined' ) { wInstance.highChart.showResetZoom(); }
		}
	} );
}

function linechart_reset(wInstance){
	wInstance.highChart.destroy();
	wInstance.highChart = new Highcharts.Chart(wInstance.defaultChart);
	//linechart_instantiate(wInstance);
	for ( i in wInstance.settings.displayWidgets ) {
		wInstance.settings.displayWidgets[i].notify( 'reset' );
	}
	wInstance._callback({'type':'reset'});
}

function linechart_notify ( noticeType , wInstance ) {
	wInstance._callback({'type':noticeType});
	switch ( noticeType ) {
		case 'loading' :
			break;
		case 'ready' :
			break;
		case 'data-error' :
			break;
		case 'reset' :
			linechart_reset(wInstance);
			break;
	}
}
function linechart_instantiate(wInstance) {
	wInstance.defaultChart = {
		chart : {
			alignTicks : true,
			renderTo   : wInstance.settings.container.find('.widget.linechart .canvas')[0],
			height : wInstance.settings.container.height(),
			width : wInstance.settings.container.width(),
			resetZoomButton : {
				position : {
					x : -50,
					y : 0
				}
			} ,
			type       : 'scatter',
			zoomType   : 'xy'
		},
		credits : { enabled : false },
		legend : {
			align          : 'right' ,
			borderWidth    : 0 ,
			enabled        : true ,
			floating       : true ,
			itemCheckboxStyle : { marginLeft : '-130px', top: '173px'  } ,
			//itemHiddenStyle: { color: '#274b6d' } ,
			//padding        : 4 ,
			symbolWidth    : 0 ,
			symbolPadding  : 0 ,
			verticalAlign  : 'bottom' ,
			x              : 0 ,
			y              : 5
		},
		plotOptions : {
			series: {
				animation : false ,
				lineWidth : 0 ,
				marker : {
					enabled : true,
					states :{ hover: { enabled : true } }
				} ,
				showInLegend : false ,
				states : { hover : { lineWidth : 1, halo: null  } }
			} 
		},
		series : [],
		title : { text : null },
		tooltip: { style : { padding : '6px' }, shape: 'square', animation: false },
		xAxis : { lineColor: '#ACACAC', title : { style:{color:'#CC0000'} }  },
		yAxis : { title : { style:{color:'#1640BC'} } }
	}
	wInstance.chart=$.extend( true, {}, wInstance.defaultChart);
	if ( wInstance.settings.tooltip && wInstance.settings.tooltip.position && wInstance.settings.tooltip.position == 'fixed' ) {
		wInstance.chart.tooltip.positioner = function ( labelWidth , labelHeight , point ) {
			return {
				x : 4 ,
				y : this.chart.chartHeight - labelHeight - 2
			};
		}
	}
	Highcharts.setOptions( {
		lang : {
			resetZoom : 'Reset View'
		}
	} );	
	wInstance.highChart = new Highcharts.Chart(wInstance.chart);
	
	wInstance.loadData = function (data) {
		this.data = ( this.settings.filter ? this.settings.filter( data ) : data );
		if ( this.settings.showControls ) {
			var labels = {};
			wgtControls = this.settings.container.find( '.controls' );
			for (series in this.data) {
				dataSeries = [];
				dataKeys = Object.keys(this.data[series].dataMeta);
				chartAxis = ['x','y'];
				for (idxDataKey in dataKeys) {
					if (this.data[series].dataMeta[dataKeys[idxDataKey]].label) {
						labels[chartAxis[idxDataKey]] = this.data[series].dataMeta[dataKeys[idxDataKey]].label;
					} else {
						labels[chartAxis[idxDataKey]] = null;
					}
				}
			}
			wgtControls.html( '<span>Series: ' + this.data[series].seriesMeta.label + '</span> &nbsp; <span>X-Axis: ' + labels.x + '</span> &nbsp; <span>Y-Axis: ' + labels.y + '</span> &nbsp; <button class="graph">Graph It!</button>' );
			wgtControls.find( '.graph' ).click( function (evt) { createChart( wInstance ); } )
		} else {
			createChart( this );
		}
	}
	
	wInstance.notify = function ( noticeType ) {
		linechart_notify( noticeType , this );
	}
	wInstance.reset = function(){
		linechart_reset(this);
	}
	wInstance.callbacks = $.extend( {} , wInstance.callbacks , wInstance.settings.callbacks , true );
	wInstance._callbacks = [];
	wInstance._callback = function (evt) {
		for (cbIdx in this.callbacks) {
			this.callbacks[cbIdx].call(this, evt);
		}
		for (cbIdx in this._callbacks) {
			this._callbacks[cbIdx].call(this, evt);
		}
	}
}
function linechart_initialize () {
	$.getScript(aaasClimateViz.settings.__libraryURI+'/js/highcharts.regression.js');
	
	aaasClimateViz.widgetLibrary.linechart.status = 'initialized';
	aaasClimateViz.widgetLibrary.linechart.load();
}
// $.getScript(aaasClimateViz.settings.__libraryURI+'/js/highcharts/highcharts.js', linechart_initialize);
$.getScript('http://code.highcharts.com/4/highcharts.src.js', linechart_initialize);
