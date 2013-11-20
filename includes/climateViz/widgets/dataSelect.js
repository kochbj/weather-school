var geocoder;
var elevation;
var places;
var pService;
var _colors = {
	legend : {
		'00ffff' : 'aqua',
		'3366cc' : 'blue',
		'33cc33' : 'green',
		'00ff00' : 'light green',
		'cc3333' : 'red',
		'cccc33' : 'dark yellow',
		'ffa500' : 'orange',
		'cc66cc' : 'purple',
		'ff6666' : 'pink',
		'60b0b0' : 'teal'
	} ,
	colors : {
		'00ffff' : '#00ffff',
		'3366cc' : '#3366cc',
		'33cc33' : '#33cc33',
		'00ff00' : '#00ff00',
		'cc3333' : '#cc3333',
		'cccc33' : '#cccc33',
		'ffa500' : '#ffa500',
		'cc66cc' : '#cc66cc',
		'ff6666' : '#ff6666',
		'60b0b0' : '#60b0b0'
	} ,
	keys       : [] ,
	currentKey : 0
};
_colors.keys = Object.keys( _colors.colors );
_colors.keys.sort( function ( a , b ) { return ( Math.random( ) < 0.5 ? -1 : 1 ); } );

function dataSelect_initialize() {
	$.getScript("http://google-maps-utility-library-v3.googlecode.com/svn/tags/infobox/1.1.9/src/infobox.js");
	elevation = new google.maps.ElevationService();
	geocoder = new google.maps.Geocoder();
	
	$.getScript(aaasClimateViz.settings.__libraryURI+'/js/solar.js');
	
	aaasClimateViz.widgetLibrary.dataSelect.status = 'initialized';
	aaasClimateViz.widgetLibrary.dataSelect.load();
}

function dataSelect_instantiate(wInstance) {
	var myLatlng = new google.maps.LatLng(38,-95);
	pointInfo({latLng:myLatlng},wInstance);
	var myOptions = {
		zoom: 3,
		center: myLatlng,
		mapTypeId: google.maps.MapTypeId.TERRAIN,
		streetViewControl: false,
		overviewMapControl : false,
		overviewMapControlOptions : { opened : true }
	}
	
	var mapCanvas = wInstance.settings.container.find('.map-canvas');
	// mapCanvas.parent().resizable({
	//	alsoResize : mapCanvas,
	//	maxWidth : mapCanvas.parent().width(),
	//	/* minWidth : mapCanvas.parent().width(), */
	//	start : function () {
	//		this.mapCenter = wInstance.map.getCenter();
	//	},
	//	stop : function() {
	//		google.maps.event.trigger(wInstance.map, 'resize');
	//		wInstance.map.setCenter(this.mapCenter);
	//	}
	// });
	
	wInstance.map = new google.maps.Map(mapCanvas[0], myOptions);
	
	// https://developers.google.com/maps/documentation/javascript/examples/overlay-symbol-dashed
	var lineCoordinates = [
		new google.maps.LatLng(0, -180),
		new google.maps.LatLng(0, 0),
		new google.maps.LatLng(0, 180)
	];
	var lineSymbol = {
		path: 'M 0,-2 0,2',
		strokeOpacity: .35,
		scale: 3,
		strokeWeight: 1
		
	};
	var line = new google.maps.Polyline({
		path: lineCoordinates,
		strokeOpacity: 0,
		icons: [{
			icon: lineSymbol,
			offset: '0',
			repeat: '20px'
		}],
		map: wInstance.map
	});
	
	wInstance.map.widget = wInstance;
	wInstance.events = {
		parent : wInstance,
		addLocation : function(e){
			addLocation(e,wInstance);
		},
		pointInfo : function(e) {
			pointInfo(e,wInstance);
		},
		pointInfoHide : function(e) {
			pointInfoHide(e,wInstance);
		},
		pointInfoShow : function(e) {
			pointInfoShow(e,wInstance);
		}
	}
	google.maps.event.addListener(wInstance.map, 'click', wInstance.events.addLocation);
	google.maps.event.addListener(wInstance.map, 'mousemove', wInstance.events.pointInfo);
	google.maps.event.addListener(wInstance.map, 'mouseover', wInstance.events.pointInfoShow);
	google.maps.event.addListener(wInstance.map, 'mouseout', wInstance.events.pointInfoHide);
	
	wInstance.markers = {};
	
	pService = new google.maps.places.PlacesService(wInstance.map);
	
	wInstance.callbacks = $.extend( {} , wInstance.callbacks , wInstance.settings.callbacks , true );
	wInstance.addCallback = function (callback) {
		this.callbacks.push(callback);
	}
	wInstance._callbacks = [];
	wInstance._callback = function (evt) {
		var evtType = evt.type.split( '-' );
		for (cbIdx in this.callbacks) {
			this.callbacks[cbIdx].call(this, evt);
		}
		for (cbIdx in this._callbacks) {
			this._callbacks[cbIdx].call(this, evt);
		}
		if ( evtType[0] != 'data' ) {
			this.dataProvider.call( this , evt )
		}
	}
	
	wInstance.reset = dataSelect_reset;
	
	wInstance.requestQueue = {};
	
	switch (wInstance.settings.data.source) {
		case 'gsod' :
			wInstance.dataProvider = refreshStations;
			break;
		case 'sunangle' :
			wInstance.dataProvider = calculatedSolarDataFetch;
			break;
		case 'location-stats' :
			wInstance.dataProvider = fetchStats;
			break;
		default :
			if ( typeof( wInstance.settings.data.source ) !== 'undefined' && ( typeof( wInstance.settings.data.source ) == 'function' || typeof( wInstance.settings.data.source ) == 'object' ) ) {
				wInstance.dataProvider = wInstance.settings.data.source;
			}
	}
	
	wInstance.map.date = wInstance.settings.container.find('.map-date');
	if (wInstance.settings.date) {
		wInstance.map.date.html( '<div class="toggle"></div><div class="datepicker"></div>' );
		switch (wInstance.settings.date.type) {
			case 'year' :
				wInstance.map.date.ui = wInstance.map.date.find( '.datepicker' );
				selectUI = '<div style="padding: .25em; background-color: #ccf0ff;">Select A Year</div><select style="width: 100%; border: none;" size="10">';
				for ( selectUIOptions = 1917 ; selectUIOptions < ( new Date() ).getFullYear() ; selectUIOptions++ ) {
					selectUI += '<option value="' + selectUIOptions + '">' + selectUIOptions + '</option>';
				}
				selectUI += '</select>';
				wInstance.map.date.ui.html( selectUI );
				wInstance.map.date.ui.find( 'select' ).change( function ( evt ) {
					yearMin = parseInt( $( this ).val() , 10 ) - parseInt( ( wInstance.settings.date.range ? wInstance.settings.date.range : 0 ) , 10 );
					yearMax = parseInt( $( this ).val() , 10 ) + parseInt( ( wInstance.settings.date.range ? wInstance.settings.date.range : 0 ) , 10 );
					$( this ).parents( '.widget.dataSelect .map-date' ).data(
						'value' ,
						[ [ new Date( yearMin , 0 , 1 ) , new Date( yearMax , 11 , 31 ) ] ]
					);
					wInstance.map.date.attr( 'title' , 'Selected: '+$( this ).val() );
					wInstance._callback({type:'user-select-date'});
				} ).val( ( wInstance.settings['date']['default'] ? wInstance.settings['date']['default'] : 2000 ) ).change();
				wInstance.map.date.ui.hide();
				wInstance.map.date.find( '.toggle' ).click( function ( evt ) {
					$( this ).parent().find( '.datepicker' ).slideToggle();
				} );
				break;
			case 'z-month-day' :
				/* Instance.map.date.months = {
					'Jan':31,
					'Feb':28,
					'Mar':31,
					'Apr':30,
					'May':31,
					'Jun':30,
					'Jul':31,
					'Aug':31,
					'Sep':30,
					'Oct':31,
					'Nov':30,
					'Dec':31
				};*/
				wInstance.map.date.attr( 'title' , 'No date selected' );
				wInstance.map.date.ui = wInstance.map.date.find('.datepicker');
				wInstance.map.date.ui.addClass('fullwidth');
				wInstance.map.date.ui.wInstance = wInstance;
				wInstance.map.date.ui.datepicker({
					changeMonth : false,
					changeYear : false,
					numberOfMonths : [1,12],
					showButtonPanel : false,
					defaultDate : new Date(1995,0,1),
					minDate : new Date(1995,0,1),
					maxDate : new Date(1995,11,31),
					buttonImageOnly : true,
					onSelect : function (value,ui) {
						// FIXME: we should automatically adjust the selected date's year from 1995 to 2000
						var selectedDate = new Date(2000,ui.selectedMonth,ui.selectedDay);
						var selectedDates = $(this).parents('.widget.dataSelect .map-date').data('value');
						if (typeof(selectedDates) !== 'array' && typeof(selectedDates) !== 'object') {
							selectedDates = [];
						}
						/* Remove the date if it already exists */
						duplicateDate = false;
						for (i in selectedDates) {
							if ( selectedDate.getTime() == selectedDates[i].getTime() ) {
								selectedDates.splice(i,1);
								duplicateDate = true;
							}
						}
						if (!duplicateDate) {
							/* Check to see if the max number of dates have been selected and remove the date at the top of the array if so */
							if (wInstance.settings.date.max && selectedDates.length == wInstance.settings.date.max) {
								selectedDates.shift();
							}
							selectedDates.push(selectedDate);
						}
						ui.dpDiv.datepicker('refresh');
						// FIXME: add sorting of `selectedDates` and update the display (for multiple date selections)
						$(this).parents('.widget.dataSelect .map-date').data('value',selectedDates);
						if (selectedDates.length > 0) {
							displayStr = '';
							for (i in selectedDates) {
								displayStr += ' ' + $.datepicker.formatDate('MM d', selectedDates[i]) + ' ';
								wInstance.map.date.attr( 'title' , 'Selected: '+displayStr );
							}
						} else {
							wInstance.map.date.attr( 'title' , 'No date selected' );
						}
						wInstance._callback({type:'user-select-date'});
					},
					onClose : function (inputElem,ui) {
						// FIXME: we should automatically adjust the selected date's year from 1995 to 2000
						var selectedDates = $(this).parents('.widget.dataSelect .map-date').data('value');
						if (typeof(selectedDates) !== 'array' && typeof(selectedDates) !== 'object') {
							selectedDates = [];
						}
						ui.dpDiv.datepicker('refresh');
						// FIXME: add sorting of `selectedDates` and update the display (for multiple date selections)
						if (selectedDates.length > 0) {
							displayStr = '';
							for (i in selectedDates) {
								displayStr += ' ' + $.datepicker.formatDate('MM d', selectedDates[i]) + ' ';
								wInstance.map.date.attr( 'title' , 'Selected: '+displayStr );
							}
						} else {
							wInstance.map.date.attr( 'title' , 'No date selected' );
						}
						wInstance._callback({type:'user-select-date'});
					},
					beforeShow : function (inputElem,ui) {
						// FIXME: we should automatically adjust the selected date's year from 1995 to 2000
						var selectedDates = $(this).parents('.widget.dataSelect .map-date').data('value');
						if (typeof(selectedDates) !== 'array' && typeof(selectedDates) !== 'object') {
							selectedDates = [];
						}
						ui.dpDiv.datepicker('refresh');
						// FIXME: add sorting of `selectedDates` and update the display (for multiple date selections)
						if (selectedDates.length > 0) {
							displayStr = '';
							for (i in selectedDates) {
								displayStr += ' ' + $.datepicker.formatDate('MM d', selectedDates[i]) + ' ';
								wInstance.map.date.attr( 'title' , 'Selected: '+displayStr );
							}
						} else {
							wInstance.map.date.attr( 'title' , 'No date selected' );
						}
						wInstance._callback({type:'user-select-date'});
					},
					beforeShowDay: function ( dateObj ) {
						// http://stackoverflow.com/questions/1452066/jquery-ui-datepicker-multiple-date-selections
						var selectedDates = $(this).parents('.widget.dataSelect .map-date').data('value');
						var testDate = new Date();
						for (i in selectedDates) {
							/* Enable date so it can be deselected. Set style to be highlighted */
							testDate.setTime( selectedDates[i].getTime() );
							testDate.setFullYear( 1995 );
							if ( dateObj.getTime() == testDate.getTime() ) {
								return [true,"selected"];
							}
						}
						/* Dates not in the array are left enabled, but with no extra style */
						return [true, ""];
					}
				});
				wInstance.map.date.ui.hide();
				wInstance.map.date.ui.find('.ui-datepicker').addClass('hideYear');
				if (wInstance.settings.date.max > 1) { wInstance.map.date.ui.addClass('hideNav'); }
				wInstance.map.date.find( '.showDialog,.displayfield' ).click( function ( evt ) { wInstance.map.date.ui.toggle(); } );
				wInstance.map.date.find( '.toggle' ).click( function ( evt ) {
					$( this ).parent().find( '.datepicker' ).slideToggle();
				} );
				break;
			case 'select-single-date' :
				wInstance.map.date.datepicker({
					changeMonth : true,
					changeYear : true,
					defaultDate : new Date(2000,0,1),
					yearRange : '1917:'+(new Date()).getFullYear(),
					onSelect : function (value,ui) {
						$(this).data('value',new Date(aaasClimateViz.dateParser(value)));
						wInstance._callback({type:'user-select-date'});
					}
				});
				wInstance.map.date.data('value',wInstance.map.date.datepicker('getDate'));
				wInstance._callback({type:'user-select-date'});
				break;
			case 'month-day' :
				wInstance.map.date.addClass( 'month-day' ).html( '<div class="toggle"></div><div class="visual-control"><div class="title">Select a Month &amp; Day</div><div class="input"><input type="text" size="12" /></div><div class="datepicker"></div></div>' );
				/* Instance.map.date.months = {
					'Jan':31,
					'Feb':28,
					'Mar':31,
					'Apr':30,
					'May':31,
					'Jun':30,
					'Jul':31,
					'Aug':31,
					'Sep':30,
					'Oct':31,
					'Nov':30,
					'Dec':31
				};*/
				wInstance.map.date.attr( 'title' , 'No date selected' );
				wInstance.map.date.ui = wInstance.map.date.find('.visual-control');
				wInstance.map.date.ui.addClass( wInstance.map.date.width() >= 410 ? 'width-410' : 'width-200' );
				wInstance.map.date.ui.wInstance = wInstance;
				wInstance.map.date.ui.events = {
					onSelect : function ( value , ui ) {
						// FIXME: we should automatically adjust the selected date's year from 1995 to 2000
						var selectedDate = new Date(2000,ui.selectedMonth,ui.selectedDay);
						var selectedDates = $(this).parents('.widget.dataSelect .map-date').data('value');
						if (typeof(selectedDates) !== 'array' && typeof(selectedDates) !== 'object') {
							selectedDates = [];
						}
						/* Remove the date if it already exists */
						duplicateDate = false;
						for (i in selectedDates) {
							if ( selectedDate.getTime() == selectedDates[i].getTime() ) {
								selectedDates.splice(i,1);
								duplicateDate = true;
							}
						}
						if (!duplicateDate) {
							/* Check to see if the max number of dates have been selected and remove the date at the top of the array if so */
							if (wInstance.settings.date.max && selectedDates.length == wInstance.settings.date.max) {
								selectedDates.shift();
							}
							selectedDates.push(selectedDate);
						}
						// FIXME: add sorting of `selectedDates` and update the display (for multiple date selections)
						$( this ).parents( '.widget.dataSelect .map-date' ).data( 'value' , selectedDates );
						if (selectedDates.length > 0) {
							displayStr = '';
							for (i in selectedDates) {
								displayStr += ' ' + $.datepicker.formatDate('MM d', selectedDates[i]) + ' ';
								wInstance.map.date.attr( 'title' , 'Selected: '+displayStr );
							}
						} else {
							wInstance.map.date.attr( 'title' , 'No date selected' );
						}
						ui.dpDiv.datepicker( 'refresh' );
						wInstance._callback({type:'user-select-date'});
					} ,
					beforeShowDay : function ( dateObj ) {
						// http://stackoverflow.com/questions/1452066/jquery-ui-datepicker-multiple-date-selections
						var selectedDates = $(this).parents('.widget.dataSelect .map-date').data('value');
						var testDate = new Date();
						for (i in selectedDates) {
							/* Enable date so it can be deselected. Set style to be highlighted. */
							testDate.setTime( selectedDates[i].getTime() );
							testDate.setFullYear( 1995 );
							if ( dateObj.getTime() == testDate.getTime() ) {
								return [true,"selected"];
							}
						}
						/* Dates not in the array are left enabled, but with no extra style */
						return [true, ""];
					}
				};
				wInstance.map.date.ui.find( '.datepicker' ).datepicker( {
					altField        : wInstance.map.date.find( '.input input' ) ,
					altFormat       : 'MM dd' ,
					changeMonth     : false ,
					changeYear      : false ,
					showButtonPanel : false ,
					defaultDate     : new Date( 1995 , 0 , 1 ) ,
					minDate         : new Date( 1995 , 0 , 1 ) ,
					maxDate         : new Date( 1995 , 11 , 31 ) ,
					buttonImageOnly : true ,
					onSelect        : wInstance.map.date.ui.events.onSelect ,
					beforeShowDay   : wInstance.map.date.ui.events.beforeShowDay
				});
				wInstance.map.date.ui.dpDiv = wInstance.map.date.ui.find( '.datepicker' );
				wInstance.map.date.ui.hide();
				wInstance.map.date.ui.find( '.input input' ).change( function ( evt ) {
					var elInput = $( this );
					var usrDate = aaasClimateViz.dateParser( elInput.val() );
					// perhaps the user didn't enter a year
					if ( usrDate === false ) {
						usrDate = aaasClimateViz.dateParser( elInput.val() + ' 1995' );
					}
					if ( usrDate !== false ) {
						usrDate = new Date( usrDate );
						// make sure the year is 1995 (required for this control)
						usrDate.setFullYear( 1995 );
						wInstance.map.date.ui.events.onSelect.call(
							wInstance.map.date.ui.dpDiv[0] ,
							$.datepicker.formatDate( 'mm/dd/yy' , usrDate ) ,
							{
								selectedDay   : usrDate.getDate() ,
								selectedMonth : usrDate.getMonth() ,
								dpDiv         : $( wInstance.map.date.ui.dpDiv.find( 'div.ui-datepicker-inline' ) )
							}
						);
						wInstance.map.date.ui.dpDiv.datepicker( 'setDate' , usrDate );
					}
				} );
				wInstance.map.date.ui.find('.ui-datepicker').addClass('hideYear');
				if (wInstance.settings.date.max > 1) { wInstance.map.date.ui.addClass('hideNav'); }
				wInstance.map.date.find( '.toggle' ).click( function ( evt ) {
					$( this ).parent( ).removeClass( wInstance.map.date.width() > 200 ? 'width-410' : 'width-200' ).addClass( wInstance.map.date.width() > 200 ? 'width-410' : 'width-200' );
					$( this ).parent( ).find( '.visual-control' ).slideToggle();
				} );
				wInstance.map.date.find( '.input input' ).val( '' );
				break;
			case 'month-day-alt' :
				wInstance.map.date.addClass( 'month-day-alt' ).html( '<div class="date-selection"><div class="visual-control inline"><div class="input"><input type="text" size="3" placeholder="Select a Day" /></div><div class="datepicker"></div></div><div class="toggle"></div></div>' );
				wInstance.map.date.attr( 'title' , 'No date selected' );
				wInstance.map.date.ui = wInstance.map.date.find('.visual-control');
				wInstance.map.date.ui.addClass( wInstance.map.date.width() > 200 ? 'width-410' : 'width-200' );
				wInstance.map.date.ui.wInstance = wInstance;
				wInstance.map.date.ui.events = {
					onSelect : function ( value , ui ) {
						// FIXME: we should automatically adjust the selected date's year from 1995 to 2000
						var selectedDate = new Date(2000,ui.selectedMonth,ui.selectedDay);
						var selectedDates = $(this).parents('.widget.dataSelect .map-date').data('value');
						if (typeof(selectedDates) !== 'array' && typeof(selectedDates) !== 'object') {
							selectedDates = [];
						}
						/* Remove the date if it already exists */
						duplicateDate = false;
						for (i in selectedDates) {
							if ( selectedDate.getTime() == selectedDates[i].getTime() ) {
								selectedDates.splice(i,1);
								duplicateDate = true;
							}
						}
						if (!duplicateDate) {
							/* Check to see if the max number of dates have been selected and remove the date at the top of the array if so */
							if (wInstance.settings.date.max && selectedDates.length == wInstance.settings.date.max) {
								selectedDates.shift();
							}
							selectedDates.push(selectedDate);
						}
						// FIXME: add sorting of `selectedDates` and update the display (for multiple date selections)
						$( this ).parents( '.widget.dataSelect .map-date' ).data( 'value' , selectedDates );
						if (selectedDates.length > 0) {
							displayStr = '';
							for (i in selectedDates) {
								displayStr += ' ' + $.datepicker.formatDate('MM d', selectedDates[i]) + ' ';
								wInstance.map.date.attr( 'title' , 'Selected: '+displayStr );
							}
						} else {
							ui.dpDiv.parents( '.visual-control' ).find( '.input input' ).val( null );
							wInstance.map.date.attr( 'title' , 'No date selected' );
						}
						ui.dpDiv.parent().datepicker( 'refresh' );
						ui.dpDiv.parent().fadeOut();
						wInstance._callback({type:'user-select-date'});
					} ,
					beforeShowDay : function ( dateObj ) {
						// http://stackoverflow.com/questions/1452066/jquery-ui-datepicker-multiple-date-selections
						var selectedDates = $(this).parents('.widget.dataSelect .map-date').data('value');
						var testDate = new Date();
						for (i in selectedDates) {
							/* Enable date so it can be deselected. Set style to be highlighted. */
							testDate.setTime( selectedDates[i].getTime() );
							testDate.setFullYear( 1995 );
							if ( dateObj.getTime() == testDate.getTime() ) {
								return [true,"selected"];
							}
						}
						/* Dates not in the array are left enabled, but with no extra style */
						return [true, ""];
					}
				};
				wInstance.map.date.ui.find( '.datepicker' ).datepicker( {
					altField        : wInstance.map.date.find( '.input input' ) ,
					altFormat       : 'MM dd' ,
					changeMonth     : false ,
					changeYear      : false ,
					showButtonPanel : false ,
					defaultDate     : new Date( 1995 , 0 , 1 ) ,
					minDate         : new Date( 1995 , 0 , 1 ) ,
					maxDate         : new Date( 1995 , 11 , 31 ) ,
					buttonImageOnly : true ,
					onSelect        : wInstance.map.date.ui.events.onSelect ,
					beforeShowDay   : wInstance.map.date.ui.events.beforeShowDay
				});
				wInstance.map.date.ui.dpDiv = wInstance.map.date.ui.find( '.datepicker' );
				wInstance.map.date.ui.dpDiv.hide();
				wInstance.map.date.ui.find( '.input input' ).change( function ( evt ) {
					var elInput = $( this );
					if ( elInput.val() == '' ) {
						wInstance.map.date.data( 'value' , [] );
						wInstance.map.date.attr( 'title' , 'No date selected' );
						wInstance.map.date.ui.dpDiv.datepicker( 'refresh' );
					}
					var usrDate = aaasClimateViz.dateParser( elInput.val() );
					// perhaps the user didn't enter a year
					if ( usrDate === false ) {
						usrDate = aaasClimateViz.dateParser( elInput.val() + ' 1995' );
					}
					if ( usrDate !== false ) {
						usrDate = new Date( usrDate );
						// make sure the year is 1995 (fixed year used by this control during selection)
						usrDate.setFullYear( 1995 );
						wInstance.map.date.ui.dpDiv.datepicker( 'setDate' , usrDate );
						// make sure the year is 2000 (fixed year stored by this control)
						usrDate.setFullYear( 2000 );
						var selectedDates = elInput.parents('.widget.dataSelect .map-date').data('value');
						for (i in selectedDates) {
							if ( usrDate.getTime() == selectedDates[i].getTime() ) {
								return;
							}
						}
						// make sure the year is 1995 (fixed year used by this control during selection)
						usrDate.setFullYear( 1995 );
						wInstance.map.date.ui.events.onSelect.call(
							wInstance.map.date.ui.dpDiv[0] ,
							$.datepicker.formatDate( 'mm/dd/yy' , usrDate ) ,
							{
								selectedDay   : usrDate.getDate() ,
								selectedMonth : usrDate.getMonth() ,
								dpDiv         : $( wInstance.map.date.ui.dpDiv.find( 'div.ui-datepicker-inline' ) )
							}
						);
					}
				} );
				wInstance.map.date.ui.find('.ui-datepicker').addClass('hideYear');
				if (wInstance.settings.date.max > 1) { wInstance.map.date.ui.addClass('hideNav'); }
				wInstance.map.date.find( '.toggle' ).click( function ( evt ) {
					$( this ).parents( '.map-date' ).removeClass( wInstance.map.date.width() > 200 ? 'width-410' : 'width-200' ).addClass( wInstance.map.date.width() > 200 ? 'width-410' : 'width-200' );
					$( this ).parents( '.map-date' ).find( '.visual-control .datepicker' ).fadeToggle();
				} );
				wInstance.map.date.find( '.input input' ).focus( function ( evt ) {
					$( this ).parents( '.map-date' ).removeClass( wInstance.map.date.width() > 200 ? 'width-410' : 'width-200' ).addClass( wInstance.map.date.width() > 200 ? 'width-410' : 'width-200' );
					$( this ).parents( '.map-date' ).find( '.visual-control .datepicker' ).fadeIn();
				} );
				wInstance.map.date.find( '.input input' ).val( '' );
				break;
			case 'year-month-day-range' :
				wInstance.map.date.addClass( 'year-month-day-range' ).html( '<div class="toggle"></div><div class="visual-control"><div class="title">Select a Start &amp; End Date</div><div class="start-date"><div class="input"><input type="text" size="12" /></div><div class="datepicker"></div></div><div class="end-date"><div class="input"><input type="text" size="12" /></div><div class="datepicker"></div></div></div>' );
				/* Instance.map.date.months = {
					'Jan':31,
					'Feb':28,
					'Mar':31,
					'Apr':30,
					'May':31,
					'Jun':30,
					'Jul':31,
					'Aug':31,
					'Sep':30,
					'Oct':31,
					'Nov':30,
					'Dec':31
				};*/
				wInstance.map.date.attr( 'title' , 'No date selected' );
				wInstance.map.date.ui = wInstance.map.date.find('.visual-control');
				wInstance.map.date.ui.addClass( wInstance.map.date.width() > 400 ? 'width-410' : 'width-200' );
				wInstance.map.date.ui.wInstance = wInstance;
				wInstance.map.date.ui.events = {
					onSelect : function (value,ui) {
						var startDate = $( this ).parents( '.visual-control' ).find( '.start-date .datepicker' ).datepicker( 'getDate' );
						var endDate = $( this ).parents( '.visual-control' ).find( '.end-date .datepicker' ).datepicker( 'getDate' );
						if ( startDate === null || endDate === null || startDate >= endDate) {
							wInstance.map.date.attr( 'title' , 'No date selected' );
							$( this ).parents( '.widget.dataSelect .map-date' ).data(
								'value' ,
								null
							);
						} else {
							if ( wInstance.settings.date.range ) { endDate.setFullYear( endDate.getFullYear() + wInstance.settings.date.range ); }
							if ( wInstance.settings.date.range ) { startDate.setFullYear( startDate.getFullYear() - wInstance.settings.date.range ); }
							$( this ).parents( '.widget.dataSelect .map-date' ).data(
								'value' ,
								[ [ startDate , endDate ] ]
							);
							displayStr = $.datepicker.formatDate('yy-M-d', startDate) + ' to ' + $.datepicker.formatDate('yy-M-d', endDate);
							wInstance.map.date.attr( 'title' , 'Selected: '+displayStr );
						}
						ui.input.parents( '.visual-control' ).find( '.datepicker' ).datepicker( 'refresh' );
						wInstance._callback({type:'user-select-date'});
					} ,
					beforeShowDay: function ( dateObj ) {
						// http://stackoverflow.com/questions/1452066/jquery-ui-datepicker-multiple-date-selections
						var selectedDates = $(this).parents('.widget.dataSelect .map-date').data('value');
						var testDateStart = new Date();
						var testDateEnd = new Date();
						for (i in selectedDates) {
							/* Enable date so it can be deselected. Set style to be highlighted */
							testDateStart.setTime( selectedDates[0][0].getTime() );
							if ( testDateStart && wInstance.settings.date.range ) { testDateStart.setFullYear( testDateStart.getFullYear() + wInstance.settings.date.range ); }
							testDateEnd.setTime( selectedDates[0][1].getTime() );
							if ( testDateEnd && wInstance.settings.date.range ) { testDateEnd.setFullYear( testDateEnd.getFullYear() - wInstance.settings.date.range ); }
							if ( dateObj.getTime() >= testDateStart.getTime() && dateObj.getTime() <= testDateEnd.getTime() ) {
								return [true,"selected"];
							}
							/* Dates not in the array are left enabled, but with no extra style */
							return [true, ""];
						}
						/* Dates not in the array are left enabled, but with no extra style */
						return [true, ""];
					}
				}
				wInstance.map.date.ui.find( '.datepicker' ).datepicker( {
					altFormat       : 'yy M dd' ,
					changeMonth     : false ,
					changeYear      : false ,
					showButtonPanel : false ,
					defaultDate     : new Date(2000,0,1) ,
					/* should be set based on data source
					minDate         : new Date(1995,0,1) ,
					maxDate         : new Date(1995,11,31) ,
					*/
					buttonImageOnly : true,
					onSelect        : wInstance.map.date.ui.events.onSelect ,
					beforeShowDay   : wInstance.map.date.ui.events.beforeShowDay
				} );
				wInstance.map.date.ui.dpDiv = wInstance.map.date.ui.find( '.datepicker' );
				wInstance.map.date.find( '.start-date .datepicker' ).datepicker( 'option' , { altField : wInstance.map.date.find( '.start-date .input input' ) } );
				wInstance.map.date.find( '.end-date .datepicker' ).datepicker( 'option' , { altField : wInstance.map.date.find( '.end-date .input input' ) } );
				wInstance.map.date.ui.hide();
				wInstance.map.date.ui.find( '.input input' ).change( function ( evt ) {
					var elInput = $( this );
					var usrDate = aaasClimateViz.dateParser( elInput.val() );
					if ( usrDate !== false ) {
						usrDate = new Date( usrDate );
						var dpDiv = wInstance.map.date.ui.dpDiv.parent( '.' + elInput.parent().parent().attr( 'class' ) ).find( '.datepicker' );
						dpDiv.datepicker( 'setDate' , usrDate );
						wInstance.map.date.ui.events.onSelect.call(
							dpDiv[0] ,
							$.datepicker.formatDate( 'mm/dd/yy' , usrDate ) ,
							{
								dpDiv         : dpDiv.find( 'div.ui-datepicker-inline' ) ,
								input         : dpDiv ,
								selectedDay   : usrDate.getDate() ,
								selectedMonth : usrDate.getMonth()
							}
						);
					}
				} );
				if (wInstance.settings.date.max > 1) { wInstance.map.date.ui.addClass('hideNav'); }
				wInstance.map.date.find( '.toggle' ).click( function ( evt ) {
					$( this ).parent( ).removeClass( wInstance.map.date.width() > 200 ? 'width-410' : 'width-200' ).addClass( wInstance.map.date.width() > 200 ? 'width-410' : 'width-200' );
					$( this ).parent( ).find( '.visual-control' ).slideToggle();
				} );
				wInstance.map.date.find( '.input input' ).val( '' );
				break;
			case 'year-month-day-range-alt' :
				wInstance.map.date.addClass( 'year-month-day-range-alt' ).html( '<div class="start-date"><div class="visual-control inline"><div class="input"><input type="text" placeholder="Start Date" /></div><div class="datepicker"></div></div><div class="toggle"></div></div><div class="end-date"><div class="visual-control inline"><div class="input"><input type="text" placeholder="End Date" /></div><div class="datepicker"></div></div><div class="toggle"></div></div>' );
				wInstance.map.date.attr( 'title' , 'No date selected' );
				wInstance.map.date.ui = wInstance.map.date.find('.visual-control');
				wInstance.map.date.ui.addClass( wInstance.map.date.width() > 400 ? 'width-410' : 'width-200' );
				wInstance.map.date.ui.wInstance = wInstance;
				wInstance.map.date.ui.events = {
					onSelect : function (value,ui) {
						var startDate = $( this ).parents( '.map-date' ).find( '.start-date .datepicker' ).datepicker( 'getDate' );
						var endDate = $( this ).parents( '.map-date' ).find( '.end-date .datepicker' ).datepicker( 'getDate' );
						if ( startDate === null || endDate === null || startDate >= endDate || $( this ).parents( '.map-date' ).find( '.visual-control .input input' ).val() == '' ) {
							wInstance.map.date.attr( 'title' , 'No date selected' );
							$( this ).parents( '.widget.dataSelect .map-date' ).data(
								'value' ,
								null
							);
						} else {
							if ( wInstance.settings.date.range ) { endDate.setFullYear( endDate.getFullYear() + wInstance.settings.date.range ); }
							if ( wInstance.settings.date.range ) { startDate.setFullYear( startDate.getFullYear() - wInstance.settings.date.range ); }
							$( this ).parents( '.widget.dataSelect .map-date' ).data(
								'value' ,
								[ [ startDate , endDate ] ]
							);
							displayStr = $.datepicker.formatDate('yy-M-d', startDate) + ' to ' + $.datepicker.formatDate('yy-M-d', endDate);
							wInstance.map.date.attr( 'title' , 'Selected: '+displayStr );
						}
						ui.dpDiv.parents( '.map-date' ).find( '.datepicker' ).datepicker( 'refresh' );
						ui.dpDiv.parents( '.map-date' ).find( '.datepicker' ).fadeOut();
						wInstance._callback({type:'user-select-date'});
					} ,
					beforeShowDay: function ( dateObj ) {
						// http://stackoverflow.com/questions/1452066/jquery-ui-datepicker-multiple-date-selections
						var selectedDates = $(this).parents('.widget.dataSelect .map-date').data('value');
						var testDateStart = new Date();
						var testDateEnd = new Date();
						for (i in selectedDates) {
							/* Enable date so it can be deselected. Set style to be highlighted */
							testDateStart.setTime( selectedDates[0][0].getTime() );
							if ( testDateStart && wInstance.settings.date.range ) { testDateStart.setFullYear( testDateStart.getFullYear() + wInstance.settings.date.range ); }
							testDateEnd.setTime( selectedDates[0][1].getTime() );
							if ( testDateEnd && wInstance.settings.date.range ) { testDateEnd.setFullYear( testDateEnd.getFullYear() - wInstance.settings.date.range ); }
							if ( dateObj.getTime() >= testDateStart.getTime() && dateObj.getTime() <= testDateEnd.getTime() ) {
								return [true,"selected"];
							}
							/* Dates not in the array are left enabled, but with no extra style */
							return [true, ""];
						}
						/* Dates not in the array are left enabled, but with no extra style */
						return [true, ""];
					}
				}
				wInstance.map.date.ui.find( '.datepicker' ).datepicker( {
					altFormat       : 'yy M dd' ,
					changeMonth     : false ,
					changeYear      : false ,
					showButtonPanel : false ,
					defaultDate     : new Date(2000,0,1) ,
					/* should be set based on data source
					minDate         : new Date(1995,0,1) ,
					maxDate         : new Date(1995,11,31) ,
					*/
					onSelect        : wInstance.map.date.ui.events.onSelect ,
					beforeShowDay   : wInstance.map.date.ui.events.beforeShowDay
				} );
				wInstance.map.date.ui.dpDiv = wInstance.map.date.ui.find( '.datepicker' );
				wInstance.map.date.find( '.start-date .datepicker' ).datepicker( 'option' , { altField : wInstance.map.date.find( '.start-date .input input' ) } );
				wInstance.map.date.find( '.end-date .datepicker' ).datepicker( 'option' , { altField : wInstance.map.date.find( '.end-date .input input' ) } );
				wInstance.map.date.ui.dpDiv.hide();
				wInstance.map.date.ui.find( '.input input' ).change( function ( evt ) {
					var elInput = $( this );
					if ( elInput.val() == '' ) {
						wInstance.map.date.data( 'value' , [] );
						wInstance.map.date.attr( 'title' , 'No date selected' );
						wInstance.map.date.ui.dpDiv.datepicker( 'refresh' );
					}
					var usrDate = aaasClimateViz.dateParser( elInput.val() );
					if ( usrDate !== false ) {
						usrDate = new Date( usrDate );
						var dpDiv = wInstance.map.date.ui.dpDiv.parents( '.' + elInput.parents( '.visual-control' ).parent( ).attr( 'class' ) ).find( '.datepicker' );
						dpDiv.datepicker( 'setDate' , usrDate );
						if ( elInput.val() == '' ) {
							wInstance.map.date.data( 'value' , [] );
							dpDiv.datepicker( 'refresh' );
						}
						dpDiv.datepicker( 'setDate' , usrDate );
						var selectedDates = elInput.parents('.widget.dataSelect .map-date').data('value');
						for (i in selectedDates) {
							if ( usrDate.getTime() == selectedDates[i][ dpDiv.parents( '.visual-control' ).parent( ).attr( 'clas' ) == 'start-date' ? 0 : 1 ].getTime() ) {
								return;
							}
						}
						wInstance.map.date.ui.events.onSelect.call(
							dpDiv[0] ,
							$.datepicker.formatDate( 'mm/dd/yy' , usrDate ) ,
							{
								dpDiv         : dpDiv.find( 'div.ui-datepicker-inline' ) ,
								input         : dpDiv ,
								selectedDay   : usrDate.getDate() ,
								selectedMonth : usrDate.getMonth()
							}
						);
					}
				} );
				if (wInstance.settings.date.max > 1) { wInstance.map.date.ui.addClass('hideNav'); }
				wInstance.map.date.find( '.toggle' ).click( function ( evt ) {
					$( this ).parent( ).parent( ).removeClass( wInstance.map.date.width() > 200 ? 'width-410' : 'width-200' ).addClass( wInstance.map.date.width() > 200 ? 'width-410' : 'width-200' );
					$( this ).parent( ).siblings( ).find( '.visual-control .datepicker' ).fadeOut();
					$( this ).parent( ).find( '.visual-control .datepicker' ).fadeToggle();
				} );
				wInstance.map.date.find( '.input input' ).focus( function ( evt ) {
					$( this ).parents( '.map-date' ).removeClass( wInstance.map.date.width() > 200 ? 'width-410' : 'width-200' ).addClass( wInstance.map.date.width() > 200 ? 'width-410' : 'width-200' );
					$( this ).parents( '.map-date' ).find( '.datepicker' ).fadeOut();
					$( this ).parents( '.visual-control' ).find( '.datepicker' ).fadeIn();
				} );
				wInstance.map.date.find( '.input input' ).val( '' );
				break;
		}
	} else {
		wInstance.map.date.hide();
	}
	
	wInstance._callback({'type':'initialize'});
}

function dataSelect_reset () {
	for ( markerID in this.markers ) { removeLocation( markerID , this ); }
	this.map.date.data( 'value' , [] );
	this.map.date.ui.datepicker( 'setDate' , null );
	this.map.date.attr( 'title' , 'No date selected' );
	this.data = {};
	wInstance._callback({'type':'reset'});
}

// FIXME: make the info display part of the map (i.e. place it in one of the map layers
function pointInfo (e,wInstance) {
	wInstance.settings.container.find('.map-info .lat').html(Math.abs(Math.round(e.latLng.lat()*100)/100)+(e.latLng.lat()<0?'S':'N'));
	wInstance.settings.container.find('.map-info .lng').html(Math.abs(Math.round(e.latLng.lng()*100)/100)+(e.latLng.lng()<0?'W':'E'));
	clearTimeout(wInstance.elevUpdateID);
	wInstance.elevUpdateID = setTimeout("elevation.getElevationForLocations( {locations:[new google.maps.LatLng("+e.latLng.lat()+","+e.latLng.lng()+")]}, function (elevations) { $('" + wInstance.settings.container.selector + "').find('.map-info .elev').html(Math.round((elevations[0].elevation*3.2808399))+'ft'); })",150);
}
function pointInfoHide (e,wInstance) { /*wInstance.settings.container.find('.map-info').fadeOut('slow')*/ }
function pointInfoShow (e,wInstance) { /*wInstance.settings.container.find('.map-info').fadeIn('slow')*/ }

function addLocation (e,wInstance) {
	if (wInstance.settings.maxPoints && (Object.keys(wInstance.markers)).length >= wInstance.settings.maxPoints) {
		for (i in wInstance.markers) {
			removeLocation(i,wInstance);
			if ((Object.keys(wInstance.markers)).length < wInstance.settings.maxPoints) {
				break; // only remove one property
			}
		}
	}
	var marker = new google.maps.Marker({
		position: new google.maps.LatLng(e.latLng.lat(),e.latLng.lng()), 
		map: wInstance.map,
		visible:true
	});
	
	if ( typeof( wInstance.settings.maxStations ) == 'undefined' || wInstance.settings.maxStations == 1 ) {
		marker.color = _colors.colors[ _colors.keys [ ( _colors.currentKey++ % _colors.keys.length ) ] ];
		// random hex color via http://paulirish.com/2009/random-hex-color-code-snippets/
		// '#'+(function(h){return new Array(7-h.length).join("0")+h})((Math.random()*(0xFFFFFF+1)<<0).toString(16))
		
		// http://stackoverflow.com/a/7686977/264628
		marker.setIcon(
			new google.maps.MarkerImage(
				"http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + marker.color.substring( 1 ) ,
				new google.maps.Size( 21 , 34 ) ,
				new google.maps.Point( 0 , 0 ) ,
				new google.maps.Point( 10 , 34 )
			)
		);
		marker.setShadow(
			new google.maps.MarkerImage(
				"http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
				new google.maps.Size( 40 , 37 ),
				new google.maps.Point( 0 , 0 ),
				new google.maps.Point( 12 , 35 )
			)
		);
	}
	
	// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
	marker.id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
	marker.name = Math.round(e.latLng.lat()*100)/100+','+Math.round(e.latLng.lng()*100)/100;
	marker.userCoords = new google.maps.LatLng(e.latLng.lat(),e.latLng.lng());
	wInstance.markers[marker.id] = marker;
	
	wInstance.map.panTo(marker.getPosition());
	// FIXME: do this only if we're showing stations (?)
	// setTimeout('aaasClimateViz.widgets['+wInstance.index+'].map.setZoom(5)',1500);
	
	// places service via google
	marker.init = (function(results,status) {
		// https://developers.google.com/maps/documentation/javascript/geocoding#GeocodingAddressTypes
		this.location = { country:null , state:null , city:null };
		
		if (status == google.maps.GeocoderStatus.OK) {
			for (i in results[0].address_components) {
				if ($.inArray('country',results[0].address_components[i].types) !== -1) {
					this.location.country = results[0].address_components[i].short_name;
				}
				if ($.inArray('administrative_area_level_1',results[0].address_components[i].types) !== -1) {
					this.location.state = results[0].address_components[i].short_name;
				}
				if ($.inArray('administrative_area_level_2',results[0].address_components[i].types) !== -1 && !this.location.city) {
					this.location.city = results[0].address_components[i].long_name;
				}
				if ($.inArray('locality',results[0].address_components[i].types) !== -1) {
					this.location.city = results[0].address_components[i].long_name;
				}
			}
			this.name = (this.location.city?this.location.city+', ':'') + (this.location.state?this.location.state+', ':'') + (this.location.country?this.location.country:'');
		} else {
			this.name = Math.round(this.userCoords.lat()*100)/100+','+Math.round(this.userCoords.lng()*100)/100
		}
		
		var contentString = '<div class="infoWindow">';
		contentString += '<div class="name">'+(this.location.city?this.location.city:'')+'</div><div class="location">'+(this.location.state?this.location.state+', ':'')+(this.location.country?this.location.country:'')+'</div>';
		contentString += '<div class="user coords">User Coordinates: '+Math.abs(Math.round(marker.userCoords.lat()*100)/100)+(marker.userCoords.lat()<0?'S':'N')+','+Math.abs(Math.round(marker.userCoords.lng()*100)/100)+(marker.userCoords.lng()<0?'W':'E')+'</div>';
		contentString += '<div class="remove-link"><a href="#" onclick="event.preventDefault(); event.stopPropagation(); removeLocation(\''+this.id+'\',aaasClimateViz.widgets['+wInstance.index+']);">remove this marker</a></div>';
		contentString += '</div>';
		var infowindow = new google.maps.InfoWindow({
			content: contentString
		});
		google.maps.event.addListener(this, 'click', function() {
			infowindow.open(wInstance.map,this);
		});
		this.infoWindow = infowindow;
		
		wInstance._callback({type:'user-select-location',data:{marker:marker}});
	});
	geocoder.geocode( { latLng:marker.position } , function(results, status) { marker.init(results,status); } );
}

function createListItem (marker) {
	mlBlock = $('<li class="m'+marker.id+'"></li>');
	mlName = $('<div class="m'+marker.id+' name">'+marker.name+'</div>');
	mlName.appendTo(mlBlock);
	mlCoords = $('<div class="m'+marker.id+'-coords">('+Math.abs(Math.round(marker.userCoords.lat()*100)/100)+(marker.userCoords.lat()<0?'S':'N')+','+Math.abs(Math.round(marker.userCoords.lng()*100)/100)+(marker.userCoords.lng()<0?'W':'E')+')</div>')
	mlCoords.appendTo(mlBlock);
	mlBlock.click(function (evt) { if (!$('.view.map').hasClass('on')) { $('.view.map').click(); } map.setCenter(marker.userCoords); marker.infoWindow.open(map,marker); });
	mlBlock.appendTo($('.locationList')).css('opacity', 0).animate({'opacity':1}, 'slow').css('cursor','pointer');
	marker.setTitle(marker.name);
}

function syncList (marker) {
	$('.locationList .m'+marker.id+' .colorpicker').css('background-color',marker.color);
}

function refreshStations ( evt ) {
	// `this` pointing to the execution-time object context, allow closures by assigning `this` to `wInstance`
	wInstance = this;
	if ( !evt.data || !evt.data.marker ) { stationBasedDataFetch( false , false , this ); return; }
	// TODO: implement station removal as a separate callback routine?
	removeStations( evt.data.marker.id , this );
	
	var date_ranges_selection , date_ranges_array = [];
	if ( this.map.date && ( date_ranges_selection = this.map.date.data( 'value' ) ) ) {
		for ( date_ranges_selection_index in date_ranges_selection ) {
			if ( date_ranges_selection[date_ranges_selection_index].hasOwnProperty( 'length' ) && date_ranges_selection[date_ranges_selection_index].length == 2 ) {
				date_ranges_array.push( {
					begin : date_ranges_selection[date_ranges_selection_index][0] ,
					end   : date_ranges_selection[date_ranges_selection_index][1]
				} );
			} else {
				date_ranges_array.push( {
					begin : date_ranges_selection[date_ranges_selection_index] ,
					end   : date_ranges_selection[date_ranges_selection_index]
				} );
			}
		}
	} else {
		date_ranges_array.push( {
			begin : ( this.settings['date']['default'] ? this.settings['date']['default'] : new Date ( 2000 , 0 , 1 ) ),
			end   : ( this.settings['date']['default'] ? this.settings['date']['default'] : new Date ( 2000 , 11 , 31 ) )
		} );
	}
	// fix datetimes to strings in an attempt to avoid timezone adjustments
	for ( i in date_ranges_array ) {
		date_ranges_array[i].begin = $.datepicker.formatDate( 'yy-mm-dd' , date_ranges_array[i].begin ) + ' ' + date_ranges_array[i].begin.toLocaleTimeString();
		date_ranges_array[i].end = $.datepicker.formatDate( 'yy-mm-dd' , date_ranges_array[i].end ) + ' ' + date_ranges_array[i].end.toLocaleTimeString();
	}
	var canSelectStation = ( ('maxStations' in this.settings) && this.settings.maxStations > 0 );
	var query = {
		mid          : evt.data.marker.id,
		lat          : evt.data.marker.getPosition().lat(),
		lng          : evt.data.marker.getPosition().lng(),
		date_ranges  : date_ranges_array,
		num_stations : ( canSelectStation ? 20 : 1 )
	};
	$.ajax( {
		type     : 'GET',
		url      : aaasClimateViz.settings.__libraryURI+'/php/data-local-stations.php',
		dataType : 'jsonp json' /* because of IE */,
		data     : query,
		success : function( servermsg ) {
			wInstance.markers[servermsg[0].mid].stations = servermsg[0].stations;
			for ( i in wInstance.markers[servermsg[0].mid].stations ) {
				wInstance.markers[servermsg[0].mid].stations[i].marker = new google.maps.Marker( {
					position : new google.maps.LatLng( wInstance.markers[servermsg[0].mid].stations[i].lat , wInstance.markers[servermsg[0].mid].stations[i].lng ), 
					map      : wInstance.map,
					visible  : ( canSelectStation ? true : false ),
					icon     :
						{
							path         : google.maps.SymbolPath.CIRCLE,
							fillColor    : 'yellow',
							fillOpacity  : 1,
							strokeWeight : 1,
							scale        : 5
						}
				} );
				wInstance.markers[servermsg[0].mid].stations[i].marker.active = false;
				wInstance.markers[servermsg[0].mid].stations[i].marker.index = i;
				wInstance.markers[servermsg[0].mid].stations[i].marker.parentMarker = servermsg[0].mid;
				
				var contentString = '<div class="infoWindow" style="background-color: #f0f0ff; border: 1px solid #9999cc; font-size: 78%">';
				contentString += '<div class="title"><b>Station Information</b></div>';
				contentString += '<div class="station name">Label: ' + ( wInstance.markers[servermsg[0].mid].stations[i].name ) + '</div>';
				contentString += '<div class="station coords">Coordinates: ' + Math.abs( Math.round( wInstance.markers[servermsg[0].mid].stations[i].lat * 100 ) / 100 ) + ( wInstance.markers[servermsg[0].mid].stations[i].lat < 0 ? 'S' : 'N' ) + ',' + Math.abs( Math.round( wInstance.markers[servermsg[0].mid].stations[i].lng * 100 ) / 100 ) + ( wInstance.markers[servermsg[0].mid].stations[i].lng < 0 ? 'W' : 'E' ) + '</div>';
				contentString += '<div class="station elevation">Elevation: ' + ( Math.round( wInstance.markers[servermsg[0].mid].stations[i].elev * 3.28084 ) ) + ' ft</div>';
				contentString += '</div>';
				
				var myOptions = {
					content                : contentString ,
					disableAutoPan         : true ,
					maxWidth               : 0 ,
					pixelOffset            : new google.maps.Size( -20 , 8 ) ,
					zIndex                 : null ,
					boxStyle               : { "width" : "220px" } ,
					closeBoxMargin         : "10px 2px 2px 2px" ,
					closeBoxURL            : "" ,
					infoBoxClearance       : new google.maps.Size( 1 , 1 ) ,
					isHidden               : false ,
					pane                   : "floatPane" ,
					enableEventPropagation : false
				};
				var ib = new InfoBox( myOptions );
	
				wInstance.markers[servermsg[0].mid].stations[i].marker.infowindow = ib;
				google.maps.event.addListener( wInstance.markers[servermsg[0].mid].stations[i].marker , 'mouseover' , function() {
					var map = aaasClimateViz.widgets[wInstance.index].map;
					var marker = aaasClimateViz.widgets[wInstance.index].markers[this.parentMarker];
					var station = marker.stations[this.index];
					this.toAction = setTimeout( function () { station.marker.infowindow.open( map , station.marker ); } , 250 );
				});
				google.maps.event.addListener( wInstance.markers[servermsg[0].mid].stations[i].marker , 'mouseout' , function() {
					clearTimeout( this.toAction );
					this.infowindow.close();
				});
				google.maps.event.addListener( wInstance.markers[servermsg[0].mid].stations[i].marker , 'click' , function() {
					//FIXME: need to track if the user has selected more stations than allowed
					if ( wInstance.settings.maxStations && wInstance.settings.maxStations == 1 ) {
						for ( j in wInstance.markers[servermsg[0].mid].stations ) {
							wInstance.markers[servermsg[0].mid].stations[j].marker.active = false;
							wInstance.markers[servermsg[0].mid].stations[j].marker.setOptions( { icon : { path : google.maps.SymbolPath.CIRCLE , fillColor : 'yellow' , fillOpacity : 1 , strokeWeight : 1 , scale: 5 } } );
							delete wInstance.data[j];
						}
						this.active = true;
					} else {
						this.active = this.active?false:true;
						if ( this.active == false ) {
							delete wInstance.data[this.index];
						}
					}
					this.setOptions( {
						icon : {
							path : google.maps.SymbolPath.CIRCLE ,
							fillColor : ( this.active && canSelectStation ? _colors.colors[ _colors.keys [ ( _colors.currentKey++ % _colors.keys.length ) ] ] : this.icon.fillColor ) ,
							fillOpacity : 1 ,
							strokeWeight : 1 ,
							scale : 5
						}
					} );
					stationBasedDataFetch( this.parentMarker , this.index , wInstance );
				} );
				if ( !canSelectStation ) {
					wInstance.markers[servermsg[0].mid].stations[i].marker.icon.fillColor = wInstance.markers[servermsg[0].mid].color;
					google.maps.event.trigger( wInstance.markers[servermsg[0].mid].stations[i].marker , 'click' );
				}
			}
		}
	} );
}
function removeLocation ( markerID , wInstance ) {
	removeStations( markerID , wInstance );
	wInstance.markers[markerID].setVisible( false );
	wInstance.markers[markerID].setMap( null );
	delete wInstance.markers[markerID];
	delete wInstance.data[markerID];
	// TODO: alert data processing callback if a selected station was removed
}
function removeStations ( markerID , wInstance ) {
	for ( i in wInstance.markers[markerID].stations ) {
		wInstance.markers[markerID].stations[i].marker.setVisible( false );
		wInstance.markers[markerID].stations[i].marker.setMap( null );
		delete wInstance.data[i];
	}
}

function stationBasedDataFetch( markerID , stationID , wInstance ) {
	var dateMin, dateMax, query, queryID;
	
	if ( wInstance.markers.count == 0 || !wInstance.map.date || !wInstance.map.date.data('value') ) { return; }
	var date_ranges_selection , date_ranges_array = [];
	if ( wInstance.map.date && ( date_ranges_selection = wInstance.map.date.data( 'value' ) ) ) {
		for ( date_ranges_selection_index in date_ranges_selection ) {
			if ( date_ranges_selection[date_ranges_selection_index].hasOwnProperty( 'length' ) && date_ranges_selection[date_ranges_selection_index].length == 2 ) {
				date_ranges_array.push( {
					begin : date_ranges_selection[date_ranges_selection_index][0] ,
					end   : date_ranges_selection[date_ranges_selection_index][1]
				} );
			} else {
				date_ranges_array.push( {
					begin : date_ranges_selection[date_ranges_selection_index] ,
					end   : date_ranges_selection[date_ranges_selection_index]
				} );
			}
		}
	} else {
		date_ranges_array.push( {
			begin : ( wInstance.settings['date']['default'] ? wInstance.settings['date']['default'] : new Date ( 2000 , 0 , 1 ) ),
			end   : ( wInstance.settings['date']['default'] ? wInstance.settings['date']['default'] : new Date ( 2000 , 11 , 31 ) )
		} );
	}
	// fix datetimes to strings in an attempt to avoid timezone adjustments
	for ( i in date_ranges_array ) {
		date_ranges_array[i].begin = $.datepicker.formatDate( 'yy-mm-dd' , date_ranges_array[i].begin ) + ' ' + date_ranges_array[i].begin.toLocaleTimeString();
		date_ranges_array[i].end = $.datepicker.formatDate( 'yy-mm-dd' , date_ranges_array[i].end ) + ' ' + date_ranges_array[i].end.toLocaleTimeString();
	}
	
	// FIXME: There isn't currently a way to only fetch needed data. So we'll first delete all data and rebuild the data cache.
	// We need to build a better data handler because this is extremely inefficent.
	wInstance.data = {};
	
	wInstance._callback({type:'data-load'});
	for ( i in wInstance.settings.displayWidgets ) {
		wInstance.settings.displayWidgets[i].notify( 'loading' );
	}
	
	for ( mid in wInstance.markers ) {
		// wInstance.data[mid] = { stations:{} };
		for ( sid in wInstance.markers[mid].stations ) {
			if ( !wInstance.markers[mid].stations[sid].marker.active ) { continue; }
			wInstance.data[mid+'::'+sid] = { seriesMeta:{} , dataMeta:{} , data:[] };
			// for ( idxDateRange in date_ranges_array ) {
				query = {
					mid          : mid ,
					sid          : sid ,
					dbid         : sid ,
					lat          : wInstance.markers[mid].userCoords.lat() ,
					lng          : wInstance.markers[mid].userCoords.lng() ,
					date_ranges  : date_ranges_array ,
					data_columns : ( typeof( wInstance.settings.data.points ) !== 'undefined' ? wInstance.settings.data.points : [] ) ,
					url          : aaasClimateViz.settings.__libraryURI+'/php/data-station.php',
					widgetIndex  : wInstance.index
				};
				queryID = md5( JSON.stringify( query ) );
				query.queryID = queryID;
				if ( !wInstance.requestQueue.hasOwnProperty( queryID ) ) {
					wInstance.requestQueue[queryID] = { query:query , data:{} , status:'init' };
				}
				if ( !wInstance.requestQueue.hasOwnProperty( queryID ) || $.inArray( wInstance.requestQueue[queryID].status , ['fail','init'] ) != -1 ) {
					stationBasedDataFetchAjax.call( wInstance , { type:'data-load' } );
				} else if ( wInstance.requestQueue[queryID].status == 'success' ) {
					wInstance.data[mid+'::'+sid].seriesMeta = wInstance.requestQueue[queryID].data.seriesMeta;
					wInstance.data[mid+'::'+sid].dataMeta = wInstance.requestQueue[queryID].data.dataMeta;
					$.merge( wInstance.data[mid+'::'+sid].data, wInstance.requestQueue[queryID].data.data);
					wInstance._callback( {type:'data-ready'} );
					for (i in wInstance.settings.displayWidgets) {
						wInstance.settings.displayWidgets[i].notify( 'ready' );
						wInstance.settings.displayWidgets[i].loadData( wInstance.data );
					}
				}
			// }
		}
	}
}

function stationBasedDataFetchAjax ( evt ) {
	if (this.running) {
		return;
	}
	var wInstance = this;
	var fetchData = false;
	for ( queryID in this.requestQueue ) {
		if ( !this.requestQueue.hasOwnProperty( queryID ) || this.requestQueue[queryID].status != 'success' ) {
			fetchData = true;
			this.running = true;
			this.requestQueue[queryID].status = 'fetch';
			break;
		}
	}
	if ( !fetchData ) {
		return;
	}
	$.ajax( {
		
		type     : 'GET' ,
		url      : this.requestQueue[queryID].query.url ,
		dataType : 'jsonp json' , /* because of IE */
		data     : this.requestQueue[queryID].query ,
		
		success : function( servermsg ) {
			var widgetIndex = parseInt( servermsg.query.widgetIndex , 10 );
			var mid = servermsg.results[0].mid;
			var sid = servermsg.results[0].sid;

			var series = {
				seriesMeta : {
					series : mid+'/'+sid,
					label : aaasClimateViz.widgets[widgetIndex].markers[mid].name + ' (' + aaasClimateViz.widgets[widgetIndex].markers[mid].stations[sid].name + ')',
					seriesSort : function (a,b) { return 0; },
					dataSort : function (a,b) { return a.date_recorded.getTime()-b.date_recorded.getTime(); },
					color : aaasClimateViz.widgets[widgetIndex].markers[mid].stations[sid].marker.icon.fillColor
				},
				dataMeta : {},
				data : [],
			};
			var dataPoints = {
				date_recorded : { type : 'datetime' , label : 'Day of the Year' , labelShort : 'Day' , format : function ( dateObj , dateFormat ) { if ( !dateFormat ) { dateFormat = 'yy M d'; }; return $.datepicker.formatDate( dateFormat , dateObj ); } , highchart : { axis : { dateTimeLabelFormats : { second:'%b %e' , minute:'%b %e' , hour:'%b %e' , day:'%b %e' , week:'%b %e' , month:'%b %e' , year:'%b %e' } } } },
				temp : { type : 'float' , label : 'Average air temperature' , labelShort : 'Avg Temp' , range: [0,100] , format : function ( val ) { return Math.round( val ) + '°F'; } }
			};
			if (aaasClimateViz.widgets[widgetIndex].settings.data.fields && aaasClimateViz.widgets[widgetIndex].settings.data.fields.length > 0) {
				var dpInclude = [];
				var dpExclude = [];
				for (userField in aaasClimateViz.widgets[widgetIndex].settings.data.fields) {
					if (aaasClimateViz.widgets[widgetIndex].settings.data.fields[userField].substring(0,1) == '-') {
						dpExclude.push(aaasClimateViz.widgets[widgetIndex].settings.data.fields[userField].substring(1));
					} else {
						dpInclude.push(aaasClimateViz.widgets[widgetIndex].settings.data.fields[userField]);
					}
				}
				if (dpInclude.length > 0) {
					for (i in dpInclude) {
						series.dataMeta[dpInclude[i]] = dataPoints[dpInclude[i]];
					}
				} else {
					series.dataMeta = dataPoints;
				}
				if (dpExclude.length > 0) {
					for (i in dpExclude) {
						delete(series.dataMeta[dpExclude[i]]);
					}
				}
			} else {
				series.dataMeta = dataPoints;
			}
			
			var dataVal;
			for (data_index in servermsg.results[0].station.data) {
				dataVal = {};
				for (dataPoint in series.dataMeta) {
					switch (dataPoint) {
						case 'date_recorded' :
							dataVal.date_recorded = (new Date(aaasClimateViz.dateParser(servermsg.results[0].station.data[data_index].date_recorded)));
							break;
						case 'temp' :
							dataVal.temp = ( isNaN( parseFloat(servermsg.results[0].station.data[data_index].temp) ) ? null : parseFloat(servermsg.results[0].station.data[data_index].temp) );
							break;
					}
				}
				series.data.push(dataVal);
			}
			
			aaasClimateViz.widgets[widgetIndex].requestQueue[ servermsg.query.queryID ].data = series;
			aaasClimateViz.widgets[widgetIndex].data[mid+'::'+sid].seriesMeta = series.seriesMeta;
			aaasClimateViz.widgets[widgetIndex].data[mid+'::'+sid].dataMeta = series.dataMeta;
			$.merge(aaasClimateViz.widgets[widgetIndex].data[mid+'::'+sid].data, series.data);
			aaasClimateViz.widgets[widgetIndex].requestQueue[ servermsg.query.queryID ].status = 'success';
			aaasClimateViz.widgets[widgetIndex]._callback( { type:'data-ready' } );
			for ( i in aaasClimateViz.widgets[widgetIndex].settings.displayWidgets ) {
				aaasClimateViz.widgets[widgetIndex].settings.displayWidgets[i].notify( 'ready' );
				aaasClimateViz.widgets[widgetIndex].settings.displayWidgets[i].loadData( aaasClimateViz.widgets[widgetIndex].data );
			}
		} ,
		
		// TODO: distinguish between different error types (500, unknown data, network timeout, etc)
		error : function ( jqXHR , textStatus , errorThrown ) {
			var widgetIndex = parseInt( $.url( this.url ).param( 'widgetIndex' ) , 10 );
			aaasClimateViz.widgets[widgetIndex].requestQueue[ $.url( this.url ).param( 'queryID' ) ].status = 'fail';
			aaasClimateViz.widgets[widgetIndex]._callback( { type:'data-error' } );
			for ( i in aaasClimateViz.widgets[widgetIndex].settings.displayWidgets ) {
				aaasClimateViz.widgets[widgetIndex].settings.displayWidgets[i].notify( 'data-error' );
			}
			// FIXME: use a jQuery-based dialog instead of the browser window so we can limit to one alert
			console.log($.url( this.url ).param( 'queryID' ) , aaasClimateViz.widgets[widgetIndex].requestQueue[ $.url( this.url ).param( 'queryID' ) ].status , $.inArray( aaasClimateViz.widgets[widgetIndex].requestQueue[ $.url( this.url ).param( 'queryID' ) ].status , ['fail','init'] ) != -1)
			if ( $.inArray( aaasClimateViz.widgets[widgetIndex].requestQueue[ $.url( this.url ).param( 'queryID' ) ].status , ['fail','init'] ) != -1 && confirm( 'There was an error retrieving data. Would you like to try again?' ) ) {
				aaasClimateViz.widgets[widgetIndex]._callback( { type:'data-refresh' } );
			} else {
				delete aaasClimateViz.widgets[widgetIndex].requestQueue[ $.url( this.url ).param( 'queryID' ) ];
			}
		} ,
		
		complete : function ( jqXHR , textStatus ) {
			var widgetIndex = parseInt( $.url( this.url ).param( 'widgetIndex' ) , 10 );
			aaasClimateViz.widgets[widgetIndex].running = false;
			stationBasedDataFetchAjax.call( aaasClimateViz.widgets[widgetIndex] , evt );
		}
	} );
}

function calculatedSolarDataFetch( evt ) {
	// FIXME: Is this calculating for all markers instead of the one specified by markerID. Is this what we want?
	var dateMin, dateMax, sunInfo, sunSettings, sunPower, numhours;
	var wInstance = this;
	
	if ( Object.keys( this.markers ).length == 0 || !this.map.date || !this.map.date.data( 'value' ) ) { return; }
	
	// FIXME: There isn't currently a way to only fetch needed data. So we'll first delete all data and rebuild the data cache.
	// We need to build a better data handler because this is extremely inefficient.
	this.data = { };
	
	this._callback( { type:'data-load' } );
	for (i in this.settings.displayWidgets) {
		this.settings.displayWidgets[i].notify('loading');
	}
	
	for (mid in this.markers) {
		this.data[mid] = {seriesMeta:{},dataMeta:{},data:[]};
		var series = {
			seriesMeta : {
				series : mid,
				label : this.markers[mid].name,
				seriesSort : function (a,b) { return 0; },
				dataSort : function (a,b) { return a.date.getTime()-b.date.getTime(); } ,
				color : this.markers[mid].color
			},
			dataMeta : {},
			data : [],
		};
		var dataPoints = {
			date : { type : 'datetime' , label : 'Day of the Year' , labelShort : 'Day' , format : function (dateObj, dateFormat) { if (!dateFormat) { dateFormat = 'yy M d'; }; return $.datepicker.formatDate(dateFormat, dateObj); } , highchart : { axis : { dateTimeLabelFormats : { second : '%b %e', minute: '%b %e', hour : '%b %e', day : '%b %e', week : '%b %e', month: '%b %e', year : '%b %e' } } } },
			// FIXME: modify lat/lng format to use E/W, N/S instead of +/- (will require a formatter function)
			lat : { type : 'float' , label : 'Latitude' , labelShort : 'Lat' , range: [-90,90] , format : function ( val ) { return ( Math.round( val * 10 ) / 10 ) + '°' + ( val < 0 ? 'S' : 'N' ); } },
			lng : { type : 'float' , label : 'Longitude' , labelShort : 'Lng' , range: [-180,180] , format : function ( val ) { return ( Math.round( val * 10 ) / 10 )+ '°' + ( val < 0 ? 'W' : 'E' ); } },
			sunAngle : { type : 'float' , label : 'Maximum height of the sun in the sky' , labelShort : 'Max Sun Angle' , range : [0,90] , format : function ( val ) { return Math.round( val ) + '°' ; } },
			sunHours : { type : 'float' , label : 'Hours of daylight' , labelShort : 'Hrs Light' , range : [0,24] , format : function ( val ) {  return ( Math.round( val * 10 ) / 10 ) + ' hours'; } },
			sunEnergyT : { type : 'float' , label : 'Energy from the sun (theoretical)' , labelShort : 'Avg Sun Energy (T)' , range : [0,10000] , format : function ( val ) { return Math.round( val ) + ' Watt-hours per meter<sup>2</sup> per day'; } },
			sunImage : { type : 'string' , label : 'How the sun appears at its highest point' , labelShort : 'Sun Appearance' , format : function ( val ) { return '<img src="' + val + '" />'; } }
		};
		if (this.settings.data.fields && this.settings.data.fields.length > 0) {
			var dpInclude = [];
			var dpExclude = [];
			for (userField in this.settings.data.fields) {
				if (this.settings.data.fields[userField].substring(0,1) == '-') {
					dpExclude.push(this.settings.data.fields[userField].substring(1));
				} else {
					dpInclude.push(this.settings.data.fields[userField]);
				}
			}
			if (dpInclude.length > 0) {
				for (i in dpInclude) {
					series.dataMeta[dpInclude[i]] = dataPoints[dpInclude[i]];
				}
			} else {
				series.dataMeta = dataPoints;
			}
			if (dpExclude.length > 0) {
				for (i in dpExclude) {
					delete(series.dataMeta[dpExclude[i]]);
				}
			}
		} else {
			series.dataMeta = dataPoints;
		}
		
		var date_ranges_selection , date_ranges_array = [];
		if ( this.map.date && ( date_ranges_selection = this.map.date.data( 'value' ) ) ) {
			for ( date_ranges_selection_index in date_ranges_selection ) {
				if ( date_ranges_selection[date_ranges_selection_index].hasOwnProperty( 'length' ) && date_ranges_selection[date_ranges_selection_index].length == 2 ) {
					date_ranges_array.push( {
						begin : date_ranges_selection[date_ranges_selection_index][0] ,
						end   : date_ranges_selection[date_ranges_selection_index][1]
					} );
				} else {
					date_ranges_array.push( {
						begin : date_ranges_selection[date_ranges_selection_index] ,
						end   : date_ranges_selection[date_ranges_selection_index]
					} );
				}
			}
		} else {
			date_ranges_array.push( {
				begin : ( this.settings['date']['default'] ? this.settings['date']['default'] : new Date ( 2000 , 0 , 1 ) ),
				end   : ( this.settings['date']['default'] ? this.settings['date']['default'] : new Date ( 2000 , 11 , 31 ) )
			} );
		}
		
		var insertDate = new Date();
		for ( date_range_idx in date_ranges_array ) {
			dateMin = date_ranges_array[date_range_idx].begin;
			dateMax = date_ranges_array[date_range_idx].end;
			for (i = 0; i < Math.round(((dateMax-dateMin)/(1000*60*60*24))+1); i++) {
				insertDate.setTime(dateMin.getTime());
				insertDate.setDate(insertDate.getDate()+i);
				sunSettings = {
					input_longitude         : new String(Math.abs(this.markers[mid].getPosition().lng()))                                ,
					input_east_west         : (this.markers[mid].getPosition().lng() < 0 ? "West" : "East")                              ,
					input_latitude          : new String(Math.abs(this.markers[mid].getPosition().lat()))                                ,
					input_north_south       : (this.markers[mid].getPosition().lat() < 0 ? "South" : "North")                            ,
					input_elevation         : 0 /*could use station data to determine this value*/                                  ,
					input_feet_meters       : "meters"                                                                              ,
					input_month             : MonthNumToMonthString(insertDate.getMonth()+1)                                        ,
					input_date              : insertDate.getDate()                                                                  ,
					input_year              : insertDate.getFullYear()                                                              ,
					input_time              : "1200"                                                                                ,
					input_am_pm             : "24 hr"                                                                               ,
					input_time_basis        : "Solar time"                                                                          ,
					input_time_zone         : 0                                                                                     ,
					input_daylight_savings  : "No"                                                                                  ,
					input_surface_tilt      : ""                                                                                    ,
					input_surface_azimuth   : ""                                                                                    ,
					input_surface_east_west : "West"                                                                                ,
					input_zero_azimuth      : "North"
				};
				sunInfo = compute( jQuery.extend( true , {} , sunSettings ) );
				sunSettings.input_zero_azimuth = (
					sunInfo.input_north_south == 'South' && sunInfo.output_declination < sunInfo.input_latitude ? 'South' : (
						sunInfo.input_north_south == 'North' && sunInfo.output_declination > sunInfo.input_latitude ? 'North' : sunInfo.input_zero_azimuth
					)
				);
				sunPower = [];
				for (j = 0; j < 24; j++) {
					// For some reason compute modifies the input lat/lon, so we need to redefine as strings per the function requirements
					sunSettings.input_longitude = 0; // new String(Math.abs(this.markers[mid].getPosition().lng()));
					sunSettings.input_latitude = new String(Math.abs(this.markers[mid].getPosition().lat()));
					sunSettings.input_time = j+"00";
					sunInfo = compute( jQuery.extend( true , {} , sunSettings ) );
					if ( !isNaN( Number( sunInfo.output_altitude ) ) && Number( sunInfo.output_altitude ) > 0 ) {
						sunPower.push( Number( sunInfo.output_solar_insolation ) );
					}
				}
				sunSettings.input_time = "1200";
				sunInfo = compute( jQuery.extend( true , {} , sunSettings ) );
				
				dataVal = {};
				for (dataPoint in series.dataMeta) {
					switch (dataPoint) {
						case 'date' :
							dataVal.date = new Date( insertDate.getTime( ) );
							break;
						case 'lat' :
							dataVal.lat = this.markers[mid].getPosition().lat();
							break;
						case 'lng' :
							dataVal.lng = this.markers[mid].getPosition().lng();
							break;
						case 'sunAngle' :
							dataVal.sunAngle = parseFloat( sunInfo.output_altitude );
							break;
						case 'sunHours' :
							dataVal.sunHours = ( isNaN( sunInfo.output_day_length ) ? 0 : sunInfo.output_day_length );
							break;
						case 'sunEnergyT' :
							dataVal.sunEnergyT = ( sunPower.length > 1 ? sunPower.reduce( function( a , b ) { return Math.abs( parseFloat( a ) ) + Math.abs( parseFloat( b ) ); } ) : ( sunPower.length == 1 ? sunPower[0] : 0 ) );
							break;
						case 'sunImage' :
							dataVal.sunImage = this.settings.__libraryURI + '/widgets/media/' + ( Math.round( dataVal.sunAngle / 5 ) * 5 ) + '-degrees-sun.png';
							break;
					}
				}
				series.data.push(dataVal);
			}
		}
		
		this.data[mid].seriesMeta = series.seriesMeta;
		this.data[mid].dataMeta = series.dataMeta;
		$.merge(this.data[mid].data, series.data);
		this._callback({type:'data-ready'});
		for (i in this.settings.displayWidgets) {
			this.settings.displayWidgets[i].notify('ready');
			this.settings.displayWidgets[i].loadData(this.data);
		}
	}
}

function fetchStats( evt ) {
	var dateMin, dateMax, query, queryID;
	var wInstance = this;
	
	if ( Object.keys( this.markers ).length == 0 || !this.map.date || !this.map.date.data( 'value' ) ) { return; }
	
	// FIXME: There isn't currently a way to only fetch needed data. So we'll first delete all data and rebuild the data cache.
	// We need to build a better data handler because this is extremely inefficient.
	this.data = {};
	
	this._callback({type:'data-load'});
	for (i in this.settings.displayWidgets) {
		this.settings.displayWidgets[i].notify('loading');
	}
	
	// FIXME: we should first generate simulated data, then retrieve the actual data so that the site dashboard is filled out quickly
	for (mid in this.markers) {
		this.data[mid] = {seriesMeta:{},dataMeta:{},data:[]};
		for (idxDoty in this.map.date.data('value')) {
			query = {
				doty         : (this.map.date.data('value'))[idxDoty].toDateString(),
				lat          : this.markers[mid].getPosition().lat(),
				lng          : this.markers[mid].getPosition().lng(),
				mid          : this.markers[mid].id,
				num_stations : 20,
				url          : aaasClimateViz.settings.__libraryURI+'/php/data-station-summary.php',
				widgetIndex  : this.index
			};
			queryID = md5( JSON.stringify( query ) );
			query.queryID = queryID;
			if ( !this.requestQueue.hasOwnProperty( queryID ) ) {
				this.requestQueue[queryID] = { query:query , data:{} , status:'init' };
			}
			if ( !this.requestQueue.hasOwnProperty( queryID ) || $.inArray( this.requestQueue[queryID].status , ['fail','init'] ) != -1 ) {
				fetchStatsAjax.call( this , evt );
			} else if ( this.requestQueue[queryID].status == 'success' ) {
				this.data[mid].seriesMeta = this.requestQueue[queryID].data.seriesMeta;
				this.data[mid].dataMeta = this.requestQueue[queryID].data.dataMeta;
				$.merge(this.data[mid].data, this.requestQueue[queryID].data.data);
				this._callback({type:'data-ready'});
				for (i in this.settings.displayWidgets) {
					this.settings.displayWidgets[i].notify('ready');
					this.settings.displayWidgets[i].loadData(this.data);
				}
			}
		}
	}
}
function fetchStatsAjax ( evt ) {
	if (this.running) {
		return;
	}
	var wInstance = this;
	var fetchData = false;
	for ( queryID in this.requestQueue ) {
		if ( !this.requestQueue.hasOwnProperty( queryID ) || this.requestQueue[queryID].status != 'success' ) {
			fetchData = true;
			this.running = true;
			this.requestQueue[queryID].status = 'fetch';
			break;
		}
	}
	if ( !fetchData ) {
		return;
	}
	$.ajax( {
		
		type     : 'GET' ,
		url      : this.requestQueue[queryID].query.url ,
		dataType : 'jsonp json' , /* because of IE */
		data     : this.requestQueue[queryID].query ,
		
		success : function( servermsg , textStatus , jqXHR ) {
			var widgetIndex = parseInt( servermsg.query.widgetIndex , 10 );
			var mid = servermsg.results[0].mid;
			var doty = new Date(aaasClimateViz.dateParser(servermsg.query.doty));
			var sunSettings = {
				input_longitude         : 0 /*new String(Math.abs(servermsg.query.lng))*/ ,
				input_east_west         : (servermsg.query.lng < 0 ? "West" : "East") ,
				input_latitude          : new String(Math.abs(servermsg.query.lat)) ,
				input_north_south       : (servermsg.query.lat < 0 ? "South" : "North") ,
				input_elevation         : 0 /*could use station data to determine this value*/ ,
				input_feet_meters       : "meters" ,
				input_month             : MonthNumToMonthString(doty.getMonth()+1) ,
				input_date              : doty.getDate() ,
				input_year              : doty.getFullYear() ,
				input_time              : "1200" ,
				input_am_pm             : "24 hr" ,
				input_time_basis        : "Solar time" ,
				input_time_zone         : 0 ,
				input_daylight_savings  : "No" ,
				input_surface_tilt      : "" ,
				input_surface_azimuth   : "" ,
				input_surface_east_west : (servermsg.query.lng < 0 ? "East" : "West") ,
				input_zero_azimuth      : (servermsg.query.lat < 0 ? "North" : "South")
			};
			var sunInfo = compute( jQuery.extend( true , {} , sunSettings ) );
			sunSettings.input_zero_azimuth = (
				sunInfo.input_north_south == 'South' && sunInfo.output_declination < sunInfo.input_latitude ? 'South' : (
					sunInfo.input_north_south == 'North' && sunInfo.output_declination > sunInfo.input_latitude ? 'North' : sunInfo.input_zero_azimuth
				)
			);
			var sunPower = [];
			for (i = 0; i < 24; i++) {
				// For some reason compute modifies the input lat/lon, so we need to redefine as strings per the function requirements
				sunSettings.input_longitude = 0; // new String(Math.abs(servermsg.query.lng));
				sunSettings.input_latitude = new String(Math.abs(servermsg.query.lat));
				sunSettings.input_time = i+"00";
				sunInfo = compute( jQuery.extend( true , {} , sunSettings ) );
				if ( !isNaN( Number( sunInfo.output_altitude ) ) && Number( sunInfo.output_altitude ) > 0 ) {
					sunPower.push( Number( sunInfo.output_solar_insolation ) );
				}
			}
			//window.sunPower = sunPower;
			//window.sunSettings = sunSettings;
			//window.sunInfo = sunInfo;
			sunSettings.input_time = "1200";
			sunInfo = compute( jQuery.extend( true , {} , sunSettings ) );
			var series = {
				seriesMeta : {
					series : mid+'-'+aaasClimateViz.dateParser(servermsg.query.doty),
					label : aaasClimateViz.widgets[widgetIndex].markers[mid].name,
					seriesSort : function (a,b) { return 0; },
					dataSort : function (a,b) { return a.date.getTime()-b.date.getTime(); } ,
					color : aaasClimateViz.widgets[widgetIndex].markers[mid].color
				},
				dataMeta : {},
				data : [],
			};
			var dataPoints = {
				date : { type : 'datetime' , label : 'Day of the Year' , labelShort : 'Day' , format : function (dateObj, dateFormat) { if (!dateFormat) { dateFormat = 'MM d'; }; return $.datepicker.formatDate(dateFormat, dateObj); } , highchart : { axis : { dateTimeLabelFormats : { second : '%b %e', minute: '%b %e', hour : '%b %e', day : '%b %e', week : '%b %e', month: '%b %e', year : '%b %e' } } } },
				// FIXME: modify lat/lng format to use E/W, N/S instead of +/- (will require a formatter function)
				lat : { type : 'float' , label : 'Latitude' , labelShort : 'Lat' , range: [-90,90] , format : function ( val ) { return ( Math.round( val * 10 ) / 10 ) + '°' + ( val < 0 ? 'S' : 'N' ); } },
				lng : { type : 'float' , label : 'Longitude' , labelShort : 'Lng' , range: [-180,180] , format : function ( val ) { return ( Math.round( val * 10 ) / 10 )+ '°' + ( val < 0 ? 'W' : 'E' ); } },
				tempavg : { type : 'float' , label : 'Average air temperature' , labelShort : 'Avg Temp' , range: [0,100] , format : function ( val ) { return Math.round( val ) + '°F'; } },
				tempmin : { type : 'float' , label : 'Average low temperature' , labelShort : 'Avg Lo Temp' , range: [0,100] , format : function ( val ) { return Math.round( val ) + '°F'; } },
				tempmax : { type : 'float' , label : 'Average high temperature' , labelShort : 'Avg Hi Temp' , range: [0,100] , format : function ( val ) { return Math.round( val ) + '°F' ; } },
				sunAngle : { type : 'float' , label : 'Maximum height of the sun in the sky' , labelShort : 'Max Sun Angle' , range : [0,90] , format : function ( val ) { return Math.round( val ) + '°' ; } },
				sunHours : { type : 'float' , label : 'Hours of daylight' , labelShort : 'Hrs Light' , range : [0,24] , format : function ( val ) { return ( Math.round( val * 10 ) / 10 ) + ' hours'; } },
				sunEnergy : { type : 'float' , label : 'Energy from the sun (recorded)' , labelShort : 'Avg Sun Energy (M)' , range : [0,10000] , format : function ( val ) { return ( isNaN( val ) ? '<i>No record</i>' : Math.round(val) + ' Watt-hours per meter<sup>2</sup> per day' ); } },
				sunEnergyT : { type : 'float' , label : 'Energy from the sun (theoretical)' , labelShort : 'Avg Sun Energy (T)' , range : [0,10000] , format : function ( val ) { return Math.round( val ) + ' Watt-hours per meter<sup>2</sup> per day'; } },
				sunImage : { type : 'string' , label : 'How the sun appears at its highest point' , labelShort : 'Sun Appearance' , format : function ( val ) { return '<img src="' + val + '" />'; } }
			};
			if (aaasClimateViz.widgets[widgetIndex].settings.data.fields && aaasClimateViz.widgets[widgetIndex].settings.data.fields.length > 0) {
				var dpInclude = [];
				var dpExclude = [];
				for (userField in aaasClimateViz.widgets[widgetIndex].settings.data.fields) {
					if (aaasClimateViz.widgets[widgetIndex].settings.data.fields[userField].substring(0,1) == '-') {
						dpExclude.push(aaasClimateViz.widgets[widgetIndex].settings.data.fields[userField].substring(1));
					} else {
						dpInclude.push(aaasClimateViz.widgets[widgetIndex].settings.data.fields[userField]);
					}
				}
				if (dpInclude.length > 0) {
					for (i in dpInclude) {
						series.dataMeta[dpInclude[i]] = dataPoints[dpInclude[i]];
					}
				} else {
					series.dataMeta = dataPoints;
				}
				if (dpExclude.length > 0) {
					for (i in dpExclude) {
						delete(series.dataMeta[dpExclude[i]]);
					}
				}
			} else {
				series.dataMeta = dataPoints;
			}
			var dataVal = {};
			for (dataPoint in series.dataMeta) {
				switch (dataPoint) {
					case 'date' :
						dataVal.date = ( new Date( aaasClimateViz.dateParser( servermsg.query.doty ) ) );
						break;
					case 'lat' :
						dataVal.lat = parseFloat( servermsg.query.lat );
						break;
					case 'lng' :
						dataVal.lng = parseFloat( servermsg.query.lng );
						break;
					case 'tempavg' :
						dataVal.tempavg = parseFloat( servermsg.results[0].station.temp_avg );
						break;
					case 'tempmin' :
						dataVal.tempmin = parseFloat( servermsg.results[0].station.temp_min );
						break;
					case 'tempmax' :
						dataVal.tempmax = parseFloat( servermsg.results[0].station.temp_max );
						break;
					case 'sunAngle' :
						dataVal.sunAngle = parseFloat( sunInfo.output_altitude );
						break;
					case 'sunHours' :
						dataVal.sunHours = ( isNaN( sunInfo.output_day_length ) ? 0 : sunInfo.output_day_length );
						break;
					case 'sunEnergy' :
						dataVal.sunEnergy = parseFloat( servermsg.results[0].station.avg_energy );
						break;
					case 'sunEnergyT' :
						dataVal.sunEnergyT = ( sunPower.length > 1 ? sunPower.reduce( function( a , b ) { return Math.abs( parseFloat( a ) ) + Math.abs( parseFloat( b ) ); } ) : ( sunPower.length == 1 ? sunPower[0] : 0 ) );
						break;
					case 'sunImage' :
						dataVal.sunImage = aaasClimateViz.settings.__libraryURI + '/widgets/media/' + ( Math.round( dataVal.sunAngle / 5 ) * 5 ) + '-degrees-sun.png';
						break;
				}
			}
			series.data.push(dataVal);
			aaasClimateViz.widgets[widgetIndex].requestQueue[ servermsg.query.queryID ].data = series;
			aaasClimateViz.widgets[widgetIndex].data[mid].seriesMeta = series.seriesMeta;
			aaasClimateViz.widgets[widgetIndex].data[mid].dataMeta = series.dataMeta;
			$.merge(aaasClimateViz.widgets[widgetIndex].data[mid].data, series.data);
			aaasClimateViz.widgets[widgetIndex].requestQueue[ servermsg.query.queryID ].status = 'success';
			aaasClimateViz.widgets[widgetIndex]._callback({type:'data-ready'});
			for (i in aaasClimateViz.widgets[widgetIndex].settings.displayWidgets) {
				aaasClimateViz.widgets[widgetIndex].settings.displayWidgets[i].notify('ready');
				aaasClimateViz.widgets[widgetIndex].settings.displayWidgets[i].loadData(aaasClimateViz.widgets[widgetIndex].data);
			}
		} ,
		
		// TODO: distinguish between different error types (500, unknown data, network timeout, etc)
		error : function ( jqXHR , textStatus , errorThrown ) {
			var widgetIndex = parseInt( $.url( this.url ).param( 'widgetIndex' ) , 10 );
			aaasClimateViz.widgets[widgetIndex].requestQueue[ $.url( this.url ).param( 'queryID' ) ].status = 'fail';
			aaasClimateViz.widgets[widgetIndex]._callback({type:'data-error'});
			for ( i in aaasClimateViz.widgets[widgetIndex].settings.displayWidgets ) {
				aaasClimateViz.widgets[widgetIndex].settings.displayWidgets[i].notify( 'data-error' );
			}
			// FIXME: use a jQuery-based dialog instead of the browser window so we can limit to one alert
			if ( $.inArray( aaasClimateViz.widgets[widgetIndex].requestQueue[ $.url( this.url ).param( 'queryID' ) ].status , ['fail','init'] ) != -1 && confirm( 'There was an error retrieving data. Would you like to try again?' ) ) {
				aaasClimateViz.widgets[widgetIndex]._callback( { type:'data-refresh' } );
			} else {
				delete aaasClimateViz.widgets[widgetIndex].requestQueue[ $.url( this.url ).param( 'queryID' ) ];
			}
		} ,
		
		complete : function ( jqXHR , textStatus ) {
			var widgetIndex = parseInt( $.url( this.url ).param( 'widgetIndex' ) , 10 );
			aaasClimateViz.widgets[widgetIndex].running = false;
			fetchStatsAjax.call( aaasClimateViz.widgets[widgetIndex] , evt );
		}
	} );
}

$.getScript("http://maps.googleapis.com/maps/api/js?libraries=places&sensor=false&callback=dataSelect_initialize");
