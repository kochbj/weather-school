function widgetScroll ( evt ) {
	if ( !evt ) { evt = { type : null }; }
	switch ( evt.type ) {
		case 'initialize' :
			manageScroll( this.settings.container );
			break;
		case 'render' :
			manageScroll( this.settings.container );
			break;
	}
}

function locExSample ( evt ) {
	if ( !evt ) { evt = { type : null }; }
	var wInstance = this;
	if ( evt.type == 'initialize' ) {
		this.settings.container.find( '.widget.dataSelect' ).addClass( 'width-200' );
		setTimeout( function ( ) {
			wInstance.map.date.ui.dpDiv.datepicker( 'setDate' , new Date( 1995 , 5 , 22 ) );
			wInstance.map.date.ui.find('.ui-state-active').click();
			google.maps.event.trigger( wInstance.map , 'click' , { latLng : new google.maps.LatLng( 40.71 , -74.0 ) } );
			google.maps.event.trigger( wInstance.map , 'click' , { latLng : new google.maps.LatLng( 24.55 , -81.78 ) } );
		} , 1000 );
	}
}
function cbDaylightEx1 ( evt ) {
	if ( !evt ) { evt = { type : null }; }
	var wInstance = this;
	if ( evt.type == 'initialize' ) {
		this.settings.container.find( '.widget.dataSelect' ).addClass( 'width-200' );
		setTimeout( function ( ) {
			google.maps.event.trigger( wInstance.map , 'click' , { latLng : new google.maps.LatLng( 40.81 , -73.96 ), staticmap: true } );
			wInstance.map.date.find('.datepicker' ).datepicker('option' , { altField : '.date-start input' } ).datepicker( 'setDate' ,  new Date( 2004 , 0 , 0 ) );
			wInstance.map.date.find('.datepicker' ).datepicker('option' , { altField : '.date-end input' } ).datepicker( 'setDate' ,  new Date( 2004 , 11 , 30 ) );
 			wInstance.map.date.ui.find('.ui-state-active').click();
		} , 1000 );
	}
}
function cbDaylightEx2 ( evt ) {
	if ( !evt ) { evt = { type : null }; }
	var wInstance = this;
	if ( evt.type == 'initialize' ) {
		this.settings.container.find( '.widget.dataSelect' ).addClass( 'width-200' );
		setTimeout( function ( ) {
			google.maps.event.trigger( wInstance.map , 'click' , { latLng : new google.maps.LatLng( 40.81 , -73.96 ), staticmap:true } );
			google.maps.event.trigger( wInstance.map , 'click' , { latLng : new google.maps.LatLng( 44.70 , -73.45 ), staticmap:true } );
			wInstance.map.date.find('.datepicker' ).datepicker('option' , { altField : '.date-start input' } ).datepicker( 'setDate' ,  new Date( 2004 , 0 , 0 ) );
			wInstance.map.date.find('.datepicker' ).datepicker('option' , { altField : '.date-end input' } ).datepicker( 'setDate' ,  new Date( 2004 , 11 , 30 ) );
 			wInstance.map.date.ui.find('.ui-state-active').click();
		} , 1000 );
	}
}
function cbDaylightEx3 ( evt ) {
	if ( !evt ) { evt = { type : null }; }
	var wInstance = this;
	if ( evt.type == 'initialize' ) {
		this.settings.container.find( '.widget.dataSelect' ).addClass( 'width-200' );
		setTimeout( function ( ) {
			google.maps.event.trigger( wInstance.map , 'click' , { latLng : new google.maps.LatLng( 5.07 , -74.53 ), staticmap:true } );
			wInstance.map.date.find('.datepicker' ).datepicker('option' , { altField : '.date-start input' } ).datepicker( 'setDate' ,  new Date( 2004 , 0 , 0 ) );
			wInstance.map.date.find('.datepicker' ).datepicker('option' , { altField : '.date-end input' } ).datepicker( 'setDate' ,  new Date( 2004 , 11 , 30 ) );
 			wInstance.map.date.ui.find('.ui-state-active').click();
		} , 1000 );
	}
}
function cbDaylightEx4 ( evt ) {
	if ( !evt ) { evt = { type : null }; }
	var wInstance = this;
	if ( evt.type == 'initialize' ) {
		this.settings.container.find( '.widget.dataSelect' ).addClass( 'width-200' );
		setTimeout( function ( ) {
			google.maps.event.trigger( wInstance.map , 'click' , { latLng : new google.maps.LatLng( 0.15 , -78.35 ), staticmap:true } );
			wInstance.map.date.find('.datepicker' ).datepicker('option' , { altField : '.date-start input' } ).datepicker( 'setDate' ,  new Date( 2004 , 0 , 0 ) );
			wInstance.map.date.find('.datepicker' ).datepicker('option' , { altField : '.date-end input' } ).datepicker( 'setDate' ,  new Date( 2004 , 11 , 30 ) );
 			wInstance.map.date.ui.find('.ui-state-active').click();
		} , 1000 );
	}
}
function cbRelation2 ( evt ) {
	if ( !evt ) { evt = { type : null }; }
	var wInstance = this;
	if ( evt.type == 'initialize' ) {
		this.settings.container.find( '.widget.dataSelect' ).addClass( 'width-200' );
		setTimeout( function ( ) {
			wInstance.map.date.find( '.start-date .datepicker' ).datepicker( 'setDate' , new Date( 1999 , 8 , 22 ) );
			wInstance.map.date.find( '.end-date .datepicker' ).datepicker( 'setDate' , new Date( 2001 , 11 , 31 ) );
 			wInstance.map.date.ui.find('.ui-state-active').click();
			google.maps.event.trigger( wInstance.map , 'click' , { latLng : new google.maps.LatLng( 40.71 , -74.0 ) } );
		} , 1000 );
	}
}
function cbRelation3 ( evt ) {
	if ( !evt ) { evt = { type : null }; }
	var wInstance = this;
	if ( evt.type == 'initialize' ) {
		this.settings.container.find( '.widget.dataSelect' ).addClass( 'width-200' );
		setTimeout( function ( ) {
			wInstance.map.date.data( 'value' , [ new Date(1995,0,15) , new Date(1995,1,15) , new Date(1995,2,15) , new Date(1995,3,15) , new Date(1995,4,15) , new Date(1995,5,15) , new Date(1995,6,15) , new Date(1995,7,15) , new Date(1995,8,15) , new Date(1995,9,15) , new Date(1995,10,15) , new Date(1995,11,15) ] );
 			wInstance.map.date.ui.find('.ui-state-active').click();
			google.maps.event.trigger( wInstance.map , 'click' , { latLng : new google.maps.LatLng( 40.71 , -74.0 ) } );
		} , 1000 );
	}
}
function cbBonaire ( evt ) {
	if ( !evt ) { evt = { type : null }; }
	var wInstance = this;
	if ( evt.type == 'initialize' ) {
		this.settings.container.find( '.widget.dataSelect' ).addClass( 'width-200' );
		setTimeout( function ( ) {
			google.maps.event.trigger( wInstance.map , 'click' , { latLng : new google.maps.LatLng( 39.18 , -76.67 ) } );
			google.maps.event.trigger( wInstance.map , 'click' , { latLng : new google.maps.LatLng( 12.16 , -68.23 ) } );
		} , 1000 );
	}
}
function cbHeightSunAirTempEx (evt) {
	if ( !evt ) { evt = { type : null }; }
	var wInstance = this;
	if ( evt.type == 'initialize' ) {
		this.settings.container.find( '.widget.dataSelect' ).addClass( 'width-200' );
		console.log(wInstance);
		setTimeout( function ( ) {
			google.maps.event.trigger( wInstance.map , 'click' , { latLng : new google.maps.LatLng( 40.81 , -73.96 ) } );
			//wInstance.map.date.data( 'value' , [ new Date(1995,0,15) , new Date(1995,1,15)/* , new Date(1995,2,15) , new Date(1995,3,15) , new Date(1995,4,15) , new Date(1995,5,15) , new Date(1995,6,15) , new Date(1995,7,15) , new Date(1995,8,15) , new Date(1995,9,15) , new Date(1995,10,15) , new Date(1995,11,15) ] );
			//wInstance.map.date.find('.datepicker' ).datepicker('option' , { altField : '.input input' } ).datepicker( 'setDate' ,  new Date( 2004 , 0 , 20 ) );
 			wInstance.map.date.ui.find('.ui-state-active').click();
		} , 1000 );
	}
}




function cbRelationSunEnergy ( evt ) {
	if ( !evt ) { evt = { type : null }; }
	var evtType = evt.type.split( '-' );
	var wInstance = this;
	if ( evtType[0] == 'data' && ( evtType[1] == 'load' || evtType[1] == 'ready' ) && this.settings.displayStatus == 'map' ) {
		// FIXME: add a resize method to the wInstance so that the resizing can be done there, passing just the width, height, and delay. Let the wInstance take care of the map.
		mapCenter = this.map.getCenter();
		this.settings.container
			.css( { 'border-right':'3px groove gray' , 'width':'auto' } )
			.animate(
				{ right:'63%' } ,
				1000 ,
				function ( ) {
					google.maps.event.trigger(wInstance.map, 'resize');
					wInstance.map.setCenter(mapCenter);
				}
			)
			.find( '.widget.dataSelect' ).addClass( 'width-200' );
		this.settings.displayWidgets[0].settings.container
			.show()
			.css( { 'width':'auto' } )
			.animate(
				{ left:'37%' } ,
				1000 ,
				'swing' ,
				function ( ) {
					if ( wInstance.settings.displayWidgets[0].highChart ) {
						wInstance.settings.displayWidgets[0].highChart.setSize( $( this ).width( ) , $( this ).height( ) );
					}
				}
			);
		this.settings.displayWidgets[0].settings.displayWidgets[0].settings.container
			.show()
			.css( { 'width':'auto' } )
			.animate(
				{ left:'37%' } ,
				1000 ,
				'swing' ,
				function ( ) {
					if ( wInstance.settings.displayWidgets[0].highChart ) {
						wInstance.settings.displayWidgets[0].highChart.setSize( $( this ).width( ) , $( this ).height( ) );
					}
				}
			);
		this.settings.displayStatus = 'vis';
	} else if ( evtType == 'initialize' ) {
		this.settings.displayStatus = 'map';
	}
}
function mapXvis ( evt ) {
	if ( !evt ) { evt = { type : null }; }
	var evtType = evt.type.split( '-' );
	var wInstance = this;
	if ( evtType[0] == 'data' && ( evtType[1] == 'load' || evtType[1] == 'ready' ) && this.settings.displayStatus == 'map' ) {
		// FIXME: add a resize method to the wInstance so that the resizing can be done there, passing just the width, height, and delay. Let the wInstance take care of the map.
		mapCenter = this.map.getCenter();
		this.settings.container
			.css( { 'width':'auto' } )
			.animate(
				{ right:'64%' } ,
				1000 ,
				function ( ) {
					google.maps.event.trigger(wInstance.map, 'resize');
					wInstance.map.setCenter(mapCenter);
				}
			)
			.find( '.widget.dataSelect' ).addClass( 'width-200' );
		this.settings.displayWidgets[0].settings.container
			.show()
			//.css( { 'width':'auto' } )
			/*.animate(
				{ left:'36%' } ,
				1000 ,
				'swing' ,
			);*/
		this.settings.displayStatus = 'vis';
	} else if ( evtType == 'initialize' ) {
		this.settings.displayStatus = 'map';
	}
}
/**
 * Callback for managing the location explorer instructions state
 **/
function locExInstruct ( evt ) {
	// Since we rely on the evt object it needs to be instantiated if it does not exist
	if ( !evt ) { evt = { type : null }; }
	var evtType = evt.type.split( '-' );
	var wInstance = this;
	var instrSlider = this.settings.container.parents( '.child' ).find( '.instructions .slider' )[0].sliderObj;
	if ( evtType[0] == 'user' && [ 'select' , 'remove' ].indexOf( evtType[1] ) !== -1 ) {
		var instrSlider = this.settings.container.parents( '.child' ).find( '.instructions .slider' )[0].sliderObj;
		var hasMarker = ( ( markerKeys = Object.keys( this.markers ) ).length > 0 ? true : false );
		var hasDate = ( !this.map.date || !this.map.date.data( 'value' ) ? false : true );
		if ( !hasDate ) {
			instrSlider.toSlide( 0 );
		} else if ( hasDate && !hasMarker ) {
			instrSlider.toSlide( 1 );
		}
	} else if ( evtType[0] == 'data' && evtType[1] == 'ready' && instrSlider.currentSlideIndex < 2 ) {
		instrSlider.toSlide( 2 );
		// FIXME: should we disable this callback here (?); we don't need to go back to the previous slides at this point
	} else if ( evtType[0] == 'initialize' ) {
		instrSlider.options.afterSlide = function ( psobj ) {
			if ( psobj.currentSlideIndex == 4 ) {
				wInstance.settings.maxPoints = 2;
			}
		}
	}
}

function cbDailyTempEx ( evt ) {
	// Since we rely on the evt object it needs to be instantiated if it does not exist
	if ( !evt ) { evt = { type : null }; }
	var evtType = evt.type.split( '-' );
	var wInstance = this;
	if ( evt.type == 'initialize' ) {
	this.settings.container.find( '.widget.dataSelect' ).addClass( 'width-200' );
	setTimeout( function ( ) {
		google.maps.event.trigger( wInstance.map , 'click' , { latLng : new google.maps.LatLng( 38.8935965, -77.014576 ), staticmap: true } );
		wInstance.map.date.find('.datepicker' ).datepicker('option' , { altField : '.date-start input' } ).datepicker( 'setDate' ,  new Date( 1999 , 3 , 1 ) );
		wInstance.map.date.find('.datepicker' ).datepicker('option' , { altField : '.date-end input' } ).datepicker( 'setDate' ,  new Date( 2003 , 3 , 25 ) );
		//total hack because of the filter thing
		console.log(wInstance);
		//wInstance.map.date.find('.date-start input' ).val('2003');
 		wInstance.map.date.ui.find('.ui-state-active').click();
	} , 1000 );
	}
}
function cbHeightSunEx ( evt ) {
	// Since we rely on the evt object it needs to be instantiated if it does not exist
	if ( !evt ) { evt = { type : null }; }
	var evtType = evt.type.split( '-' );
	var wInstance = this;
	if ( evt.type == 'initialize' ) {
	this.settings.container.find( '.widget.dataSelect' ).addClass( 'width-200' );
	setTimeout( function ( ) {
		google.maps.event.trigger( wInstance.map , 'click' , { latLng : new google.maps.LatLng( 41.85, -87.62 ), staticmap: true } );
		wInstance.map.date.find('.datepicker' ).datepicker('option' , { altField : '.date-start input' } ).datepicker( 'setDate' ,  new Date( 2004 , 0 , 0 ) );
		wInstance.map.date.find('.datepicker' ).datepicker('option' , { altField : '.date-end input' } ).datepicker( 'setDate' ,  new Date( 2004 , 11 , 30 ) );
 		wInstance.map.date.ui.find('.ui-state-active').click();
	} , 1000 );
	}
}
function cbDailyTempOld ( evt ) {
	return;
	// Since we rely on the evt object it needs to be instantiated if it does not exist
	if ( !evt ) { evt = { type : null }; }
	var evtType = evt.type.split( '-' );
	var wInstance = this;
	var instrSlider = this.settings.container.parents( '.child' ).find( '.instructions .slider' )[0].sliderObj;
	if ( evtType[0] == 'user' && [ 'select' , 'remove' ].indexOf( evtType[1] ) !== -1 ) {
		var instrSlider = this.settings.container.parents( '.child' ).find( '.instructions .slider' )[0].sliderObj;
		var hasMarker = ( ( markerKeys = Object.keys( this.markers ) ).length > 0 ? true : false );
		var hasDate = ( !this.map.date || !this.map.date.data( 'value' ) ? false : true );
		if ( !hasMarker ) {
			instrSlider.toSlide( 0 );
		} else if ( hasMarker && !hasDate ) {
			instrSlider.toSlide( 1 );
		}
	} else if ( evtType[0] == 'data' && evtType[1] == 'ready' && instrSlider.currentSlideIndex < 2 ) {
		instrSlider.toSlide( 2 );
		// FIXME: should we disable this callback here, we don't need to go back to the previous slides at this point?
	} else if ( evtType[0] == 'initialize' ) {
		instrSlider.options.currentTimeout = 0;
		instrSlider.options.afterSlide = function ( psobj ) {
			if ( [6,7].indexOf( psobj.currentSlideIndex ) !== -1 ) {
				if ( psobj.options.currentTimeout == 0 ) {
					psobj.options.currentTimeout = setTimeout(
						function ( ) {
							psobj.options.rectHL = wInstance.settings.displayWidgets[0].highChart.renderer.rect(65, 135, 10, 10, 1).attr( { fill:'lightblue' , zIndex:3 , opacity:.4 } ).add( );
							psobj.options.rectHL.animate( { width:165 , height:165 } , { duration:2000 } );
						} ,
						2500
					);
				}
			} else if ( psobj.options.currentTimeout != 0 ) {
				clearTimeout( psobj.options.currentTimeout );
				psobj.options.currentTimeout = 0;
				if ( typeof( psobj.options.rectHL ) == 'object' ) {
					psobj.options.rectHL.destroy();
				}
			}
			if ( [8,9,10].indexOf( psobj.currentSlideIndex ) !== -1 ) {
				wInstance.settings.displayWidgets[0].highChart.yAxis[0].setExtremes( 20 , 80 );
			} else {
				wInstance.settings.displayWidgets[0].highChart.xAxis[0].setExtremes();
				wInstance.settings.displayWidgets[0].highChart.yAxis[0].setExtremes();
			}
		}
	} else {
		//if ( instrSlider.currentSlideIndex == 2 ) {
		//	instrSlider.toSlide( 3 );
		//} else if ( instrSlider.currentSlideIndex == 3 ) {
		//	this.settings.maxPoints = 2;
		//	instrSlider.toSlide( 4 );
		//} else if ( !instrSlider.currentSlideIndex == 4 ) {
		//	this.settings.maxPoints = 2;
		//	instrSlider.toSlide( 4 );
		//}
	}
}

function cbTempLatNorthern ( evt ) {
	// Since we rely on the evt object it needs to be instantiated if it does not exist
	if ( !evt ) { evt = { type : null }; }
	var evtType = evt.type.split( '-' );
	var wInstance = this;
	if ( evt.type == 'initialize' ) {
	this.settings.container.find( '.widget.dataSelect' ).addClass( 'width-200' );
	setTimeout( function ( ) {
		google.maps.event.trigger( wInstance.map , 'click' , { latLng : new google.maps.LatLng( 49.886083,-97.152921 ), staticmap: true } );
		google.maps.event.trigger( wInstance.map , 'click' , { latLng : new google.maps.LatLng( 29.461029,-98.697739 ), staticmap: true } );
		wInstance.map.date.find('.datepicker' ).datepicker('option' , { altField : '.date-start input' } ).datepicker( 'setDate' ,  new Date( 2004 , 0 , 0 ) );
		wInstance.map.date.find('.datepicker' ).datepicker('option' , { altField : '.date-end input' } ).datepicker( 'setDate' ,  new Date( 2004 , 11 , 30 ) );
 		wInstance.map.date.ui.find('.ui-state-active').click();
	} , 1000 );
	}
}

function cbTempLatSouthern ( evt ) {
	// Since we rely on the evt object it needs to be instantiated if it does not exist
	if ( !evt ) { evt = { type : null }; }
	var evtType = evt.type.split( '-' );
	var wInstance = this;
	if ( evt.type == 'initialize' ) {
	this.settings.container.find( '.widget.dataSelect' ).addClass( 'width-200' );
	setTimeout( function ( ) {
		google.maps.event.trigger( wInstance.map , 'click' , { latLng : new google.maps.LatLng( -17.800000,-63.166670 ), staticmap: true } );
		google.maps.event.trigger( wInstance.map , 'click' , { latLng : new google.maps.LatLng( -31.398930,-64.182129 ), staticmap: true } );
		wInstance.map.date.find('.datepicker' ).datepicker('option' , { altField : '.date-start input' } ).datepicker( 'setDate' ,  new Date( 2004 , 0 , 0 ) );
		wInstance.map.date.find('.datepicker' ).datepicker('option' , { altField : '.date-end input' } ).datepicker( 'setDate' ,  new Date( 2004 , 11 , 30 ) );
 		wInstance.map.date.ui.find('.ui-state-active').click();
	} , 1000 );
	}
}	

function cbElevExample ( evt ) {
	// Since we rely on the evt object it needs to be instantiated if it does not exist
	if ( !evt ) { evt = { type : null }; }
	var evtType = evt.type.split( '-' );
	var wInstance = this;
	if ( evt.type == 'initialize' ) {
	this.settings.container.find( '.widget.dataSelect' ).addClass( 'width-200' );
	setTimeout( function ( ) {
		//console.log(wInstance.map.widget);
		google.maps.event.trigger( wInstance.map , 'click' , { latLng : new google.maps.LatLng( 39.73,-104.98 ), stationNames: ["LAKE CO", "LIMON MUNI"], staticmap: true } );
		wInstance.map.date.find('.datepicker' ).datepicker('option' , { altField : '.date-start input' } ).datepicker( 'setDate' ,  new Date( 2004 , 0 , 0 ) );
		wInstance.map.date.find('.datepicker' ).datepicker('option' , { altField : '.date-end input' } ).datepicker( 'setDate' ,  new Date( 2004 , 11 , 30 ) );
		wInstance.map.setZoom(6);
 		wInstance.map.date.ui.find('.ui-state-active').click();
//		setTimeout( function () {
//		google.maps.event.clearListeners(wInstance.map, 'click');
//		wInstance.map.setOptions({draggable: false, disableDoubleClickZoom: true}); }, 2000 );
	} , 1000 );
	}
}	
function cbLargeBodiesWaterExample ( evt ) {
	// Since we rely on the evt object it needs to be instantiated if it does not exist
	if ( !evt ) { evt = { type : null }; }
	var evtType = evt.type.split( '-' );
	var wInstance = this;
	if ( evt.type == 'initialize' ) {
	this.settings.container.find( '.widget.dataSelect' ).addClass( 'width-200' );
	setTimeout( function ( ) {
		//console.log(wInstance.map.widget);
		google.maps.event.trigger( wInstance.map , 'click' , { latLng : new google.maps.LatLng( 37.297,-121.817 ), stationNames: ["SAN FRANCISCO INTL", "MODESTO CITY CO HAR"], staticmap: true } );
		wInstance.map.date.find('.datepicker' ).datepicker('option' , { altField : '.date-start input' } ).datepicker( 'setDate' ,  new Date( 2004 , 0 , 0 ) );
		wInstance.map.date.find('.datepicker' ).datepicker('option' , { altField : '.date-end input' } ).datepicker( 'setDate' ,  new Date( 2004 , 11 , 30 ) );
		wInstance.map.setZoom(7);
 		wInstance.map.date.ui.find('.ui-state-active').click();
	} , 1000 );
	}
}	

function cbTempLatitude ( evt ) {
	// Since we rely on the evt object it needs to be instantiated if it does not exist
	var markerKeys;
	if ( !evt ) { evt = { type : null }; }
	var evtType = evt.type.split( '-' );
	var wInstance = this;
	var instrSlider = this.settings.container.parents( '.child' ).find( '.instructions .slider' )[0].sliderObj;
	var hasMarker = ( ( markerKeys = Object.keys( this.markers ) ).length > 0 ? true : false );
	var hasDate = ( !this.map.date || !this.map.date.data( 'value' ) ? false : true );
	if ( evtType[0] == 'user' && [ 'select' , 'remove' ].indexOf( evtType[1] ) !== -1 ) {
		if ( !hasMarker ) {
			instrSlider.toSlide( 1 );
		} else if ( hasMarker && !hasDate ) {
			instrSlider.toSlide( 2 );
		}
	} else if ( evtType[0] == 'data' && evtType[1] == 'ready' && instrSlider.currentSlideIndex < 3 ) {
		instrSlider.toSlide( 3 );
		// FIXME: should we disable this callback here, we don't need to go back to the previous slides at this point?
	} else {
		//if ( instrSlider.currentSlideIndex == 2 ) {
		//	instrSlider.toSlide( 3 );
		//} else if ( instrSlider.currentSlideIndex == 3 ) {
		//	this.settings.maxPoints = 2;
		//	instrSlider.toSlide( 4 );
		//} else if ( !instrSlider.currentSlideIndex == 4 ) {
		//	this.settings.maxPoints = 2;
		//	instrSlider.toSlide( 4 );
		//}
	}
	if ( typeof(markerKeys) !== 'undefined' && markerKeys.length == 2) {
		var colorText = [];
		for (colorKey in _colors.colors ) {
			if ( _colors.colors[colorKey] == this.markers[ markerKeys[0] ].color ) {
				colorText.push( _colors.legend[colorKey] );
			}
			if ( _colors.colors[colorKey] == this.markers[ markerKeys[1] ].color ) {
				colorText.push( _colors.legend[colorKey] );
			}
		}
		if ( this.markers[ markerKeys[0] ].userCoords.lat( ) > this.markers[ markerKeys[1] ].userCoords.lat( ) ) {
			this.settings.container.parents( '.child' ).find( '.instructions .lat-high' ).html( colorText[0] );
			this.settings.container.parents( '.child' ).find( '.instructions .lat-low' ).html( colorText[1] );
		} else {
			this.settings.container.parents( '.child' ).find( '.instructions .lat-high' ).html( colorText[1] );
			this.settings.container.parents( '.child' ).find( '.instructions .lat-low' ).html( colorText[0] );
		}
	} else {
		this.settings.container.parents( '.child' ).find( '.instructions .lat-high' ).html( 'higher' );
		this.settings.container.parents( '.child' ).find( '.instructions .lat-low' ).html( 'lower' );
	}
}

/**
 * Widget initialization object.
 *
 * This object defines the widgets associated with each slide. When a particular
 * slide is activated the widgets on it are initialized .
**/

var slideInit = {
	'locationExplorer-sample' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'location-stats' },
					date           : { type:'month-day' , max:1 },
					maxPoints      : 2,
					container      : $( '#dataSelector-sample' ),
					readOnly       : true ,
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'statspanel',
							{
								container : $( '#statspanel-sample' ) ,
								callbacks : [ widgetScroll ]
							}
						)
					],
					callbacks : [ locExSample ]
				}
			);
		}
	} ,
	'locationExplorer' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'location-stats' },
					date           : { type:'month-day' , max:1 },
					maxPoints      : 1,
					container      : $( '#dataSelector1' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'statspanel',
							{
								container : $( '#statspanel1' ) ,
								callbacks : [ widgetScroll ]
							}
						)
					],
					callbacks : [ locExInstruct , mapXvis ]
				}
			);
		}
	} ,
	'locationExplorer2' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'location-stats' },
					date           : { type:'month-day' , max:1 },
					maxPoints      : 2,
					container      : $( '#dataSelector2' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'statspanel',
							{
								container : $( '#statspanel2' ) ,
								callbacks : [ widgetScroll ]
							}
						)
					],
					callbacks : [ mapXvis ]
				}
			);
		}
	} ,
	'locationExplorer3' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'location-stats' },
					date           : { type:'month-day' , max:1 },
					maxPoints      : 2,
					container      : $( '#dataSelector3' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'statspanel',
							{
								container : $( '#statspanel3' ) ,
								callbacks : [ widgetScroll ]
							}
						)
					],
					callbacks : [  mapXvis ]
				}
			);
		}
	} ,
	'locationExplorer-tryit' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'location-stats' },
					date           : { type:'month-day' , max:1 },
					maxPoints      : 1,
					container      : $( '#dataSelector-tryit' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'statspanel',
							{
								container : $( '#statspanel-tryit' ) ,
								callbacks : [ widgetScroll ]
							}
						)
					],
					callbacks : [ mapXvis ]
				}
			);
		}
	} ,
	'daily-temperature-example' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'gsod' },
					date           : { type:'year-month-day-range-double-restricted' , 'range':1 },
					maxPoints      : 1,
					container      : $( '#daily-temperature-example-ds' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'linechart',
							{
								tooltip   : { position:'fixed' , detail:'short' } ,
								container : $( '#daily-temperature-example-tc' ),
								filter : function ( data ) {
									var wInstance = aaasClimateViz.widgets[this.container.widget.index+2];
									var testDateStart = new Date( wInstance.map.date.data('value')[0][0].valueOf( ) );
									var testDateStart = new Date( 2000, 3, 1 );
									//if ( testDateStart && wInstance.settings.date.range ) { testDateStart.setFullYear( testDateStart.getFullYear() - 1 ); }
									//var testDateEnd = new Date( wInstance.map.date.data('value')[0][1].valueOf( ) );
									var testDateEnd = new Date( 2000, 3, 25 );
									//if ( testDateEnd && wInstance.settings.date.range ) { testDateEnd.setFullYear( testDateEnd.getFullYear() + 1 ); }
									filteredData = {};
									for ( dataID in data ) {
										filteredData[dataID] = { data:[] , dataMeta:data[dataID].dataMeta , seriesMeta:data[dataID].seriesMeta };
										for ( i in data[dataID].data ) {
											if ( data[dataID].data[i].date_recorded >= testDateStart && data[dataID].data[i].date_recorded <= testDateEnd ) {
												filteredData[dataID].data.push( data[dataID].data[i] );
											}
										}
									}
									// http://stackoverflow.com/questions/1669190/javascript-min-max-array-values
									return filteredData;
								}
							}
						),
						aaasClimateViz.loadWidget(
							'linechart',
							{
								tooltip   : { position:'fixed' , detail:'short' } ,
								container : $( '#annual-temperature-display-tc' )
							}
						)
					],
					callbacks : [ cbDailyTempEx ]
				}
			);
		}
	} ,
	'annual-temperature-display' : {
		is_initialized : false ,
		initialize : function ( ) {
		if (!(slideInit['daily-temperature-example'].is_initialized)) {
			slideInit['daily-temperature-example'].initialize();
			slideInit['daily-temperature-example'].is_initialized=true;
		}
		}
	} ,
	'annual-temperature-explore' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'gsod' },
					date           : { type:'year-month-day-range-double' },
					maxPoints      : 1,
					container      : $( '#annual-temperature-explore-ds' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'linechart',
							{
								tooltip   : { position:'fixed' , detail:'short' } ,
								container : $( '#annual-temperature-explore-tc' )
							}
						)
					],
					callbacks : [ mapXvis ]
				}
			);
		}
	} ,
	'temperature-lat-northern' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'gsod' },
					date           : { type:'year-month-day-range-double-restricted' },
					maxPoints      : 2,
					container      : $( '#temperature-lat-northern-ds' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'linechart',
							{
								tooltip   : { position:'fixed' , detail:'short' } ,
								container : $( '#temperature-lat-northern-tc' )
							}
						)
					],
					callbacks : [ cbTempLatNorthern ]
				}
			);
		}
	} ,
	'temperature-lat-southern' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'gsod' },
					date           : { type:'year-month-day-range-double-restricted' },
					maxPoints      : 2,
					container      : $( '#temperature-lat-southern-ds' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'linechart',
							{
								tooltip   : { position:'fixed' , detail:'short' } ,
								container : $( '#temperature-lat-southern-tc' )
							}
						)
					],
					callbacks : [ cbTempLatSouthern  ]
				}
			);
		}
	} ,
	'temperature-lat-explore' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'gsod' },
					date           : { type:'year-month-day-range-double' },
					maxPoints      : 2,
					container      : $( '#temperature-lat-explore-ds' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'linechart',
							{
								tooltip   : { position:'fixed' , detail:'short' } ,
								container : $( '#temperature-lat-explore-tc' )
							}
						)
					],
					callbacks : [ cbTempLatitude , mapXvis ]
				}
			);
		}
	} ,
	'temperature-elevation-example' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'gsod' },
					date           : { type:'year-month-day-range-double-restricted' },
					maxPoints      : 1,
					maxStations    : 2,
					container      : $( '#temperature-elevation-example-ds' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'linechart',
							{
								tooltip   : { position:'fixed' , detail:'short' } ,
								container : $( '#temperature-elevation-example-tc' )
							}
						)
					],
					callbacks : [ cbElevExample ]
				}
			);
		}
	} ,
	'temperature-elevation-explore' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'gsod' },
					date           : { type:'year-month-day-range-double' },
					maxPoints      : 1,
					maxStations    : 2,
					container      : $( '#temperature-elevation-explore-ds' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'linechart',
							{
								tooltip   : { position:'fixed' , detail:'short' } ,
								container : $( '#temperature-elevation-explore-tc' )
							}
						)
					],
					callbacks : [ mapXvis ]
				}
			);
		}
	} ,
	'temperature-water-example' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'gsod' },
					date           : { type:'year-month-day-range-double-restricted' },
					maxPoints      : 1,
					maxStations    : 2,
					container      : $( '#temperature-water-example-ds' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'linechart',
							{
								tooltip   : { position:'fixed' , detail:'short' } ,
								container : $( '#temperature-water-example-tc' )
							}
						)
					],
					callbacks : [ cbLargeBodiesWaterExample ]
				}
			);
		}
	} ,
	'temperature-water-explore' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'gsod' },
					date           : { type:'year-month-day-range-double' },
					maxPoints      : 1,
					maxStations    : 2,
					container      : $( '#temperature-water-explore-ds' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'linechart',
							{
								tooltip   : { position:'fixed' , detail:'short' } ,
								container : $( '#temperature-water-explore-tc' )
							}
						)
					],
					callbacks : [ mapXvis ]
				}
			);
		}
	} ,
	'height-sun-example' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'sunangle' , fields:['date','sunAngle'] },
					date           : { type:'year-month-day-range-double-restricted' },
					maxPoints      : 1,
					container      : $( '#height-sun-example-ds' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'linechart',
							{
								tooltip   : { position:'fixed' , detail:'short' } ,
								container : $( '#height-sun-example-tc' )
							}
						)
					],
					callbacks : [ cbHeightSunEx ]
				}
			);
		}
	},
	'height-sun-explore' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'sunangle' , fields:['date','sunAngle'] },
					date           : { type:'year-month-day-range-double' },
					maxPoints      : 1,
					container      : $( '#height-sun-explore-ds' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'linechart',
							{
								tooltip   : { position:'fixed' , detail:'short' } ,
								container : $( '#height-sun-explore-tc' )
							}
						)
					],
					callbacks : [ mapXvis ]
				}
			);
		}
	},
	'height-sun-air-temperature-example' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'location-stats' , fields:['-sunImage'] },
					date           : { type:'month-day' , max:12 },
					maxPoints      : 1,
					container      : $( '#height-sun-air-temperature-example-ds' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'table',
							{
								container : $( '#height-sun-air-temperature-example-tb' ) ,
								selectForOutput : 2,
								displayWidgets : [
									aaasClimateViz.loadWidget(
										'linechart',
										{
											tooltip   : { position:'fixed' , detail:'short' } ,
											container : $( '#height-sun-air-temperature-example-tc' )
										}
									)
								] ,
								callbacks : [ widgetScroll ]
							}
						)
					],
					callbacks : [ cbHeightSunAirTempEx, cbRelationSunEnergy ]
				}
			);
		}
	},
	'height-sun-air-temperature-explore' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'location-stats' , fields:['-sunImage'] },
					date           : { type:'month-day' , max:12 },
					maxPoints      : 1,
					container      : $( '#height-sun-air-temperature-explore-ds' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'table',
							{
								container : $( '#height-sun-air-temperature-explore-tb' ) ,
								selectForOutput : 2,
								displayWidgets : [
									aaasClimateViz.loadWidget(
										'linechart',
										{
											tooltip   : { position:'fixed' , detail:'short' } ,
											container : $( '#height-sun-air-temperature-explore-tc' )
										}
									)
								] ,
								callbacks : [ widgetScroll ]
							}
						)
					],
					callbacks : [ cbRelationSunEnergy ]
				}
			);
		}
	},
	'daylight-example1' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'sunangle' , fields:['date','sunHours'] },
					date           : { type:'year-month-day-range-double-restricted' , max:1 },
					maxPoints      : 1,
					container      : $( '#daylight-example1-ds' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'linechart',
							{
								tooltip   : { position:'fixed' , detail:'short' } ,
								container : $( '#daylight-example1-tc' ) ,
								callbacks : [ ]
							}
						)
					],
					callbacks : [ cbDaylightEx1 ]
				}
			);
		}
	} ,
	'daylight-example2' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'sunangle' , fields:['date','sunHours'] },
					date           : { type:'year-month-day-range-double-restricted' },
					maxPoints      : 2,
					container      : $( '#daylight-example2-ds' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'linechart',
							{
								tooltip   : { position:'fixed' , detail:'short' } ,
								container : $( '#daylight-example2-tc' )
							}
						)
					],
					callbacks : [ cbDaylightEx2 ]
				}
			);
		}
	} ,
	'daylight-example3' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'sunangle' , fields:['date','sunHours'] },
					date           : { type:'year-month-day-range-double-restricted' },
					maxPoints      : 1,
					container      : $( '#daylight-example3-ds' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'linechart',
							{
								tooltip   : { position:'fixed' , detail:'short' } ,
								container : $( '#daylight-example3-tc' )
							}
						)
					],
					callbacks : [ cbDaylightEx3 ]
				}
			);
		}
	} ,
	'daylight-example4' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'sunangle' , fields:['date','sunHours'] },
					date           : { type:'year-month-day-range-double-restricted' },
					maxPoints      : 1,
					container      : $( '#daylight-example4-ds' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'linechart',
							{
								tooltip   : { position:'fixed' , detail:'short' } ,
								container : $( '#daylight-example4-tc' )
							}
						)
					],
					callbacks : [ cbDaylightEx4 ]
				}
			);
		}
	} ,
	'daylight-practice' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'sunangle' , fields:['date','sunHours',] },
					date           : { type:'year-month-day-range-double' },
					maxPoints      : 2,
					container      : $( '#daylight-explore-ds' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'linechart',
							{
								tooltip   : { position:'fixed' , detail:'short' } ,
								container : $( '#daylight-explore-tc' )
							}
						)
					],
					callbacks : [ mapXvis ]
				}
			);
		}
	} ,
	'daylight-air-temperature-example' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'location-stats' , fields:['-sunImage'] },
					date           : { type:'month-day' , max:12 },
					maxPoints      : 1,
					container      : $( '#daylight-air-temperature-example-ds' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'table',
							{
								container : $( '#daylight-air-temperature-example-tb' ) ,
								selectForOutput : 2,
								displayWidgets : [
									aaasClimateViz.loadWidget(
										'linechart',
										{
											tooltip   : { position:'fixed' , detail:'short' } ,
											container : $( '#daylight-air-temperature-example-tc' )
										}
									)
								] ,
								callbacks : [ widgetScroll ]
							}
						)
					],
					callbacks : [ cbRelationSunEnergy ]
				}
			);
		}
	},
	'daylight-air-temperature-explore' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'location-stats' , fields:['-sunImage'] },
					date           : { type:'month-day' , max:12 },
					maxPoints      : 1,
					container      : $( '#daylight-air-temperature-explore-ds' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'table',
							{
								container : $( '#daylight-air-temperature-explore-tb' ) ,
								selectForOutput : 2,
								displayWidgets : [
									aaasClimateViz.loadWidget(
										'linechart',
										{
											tooltip   : { position:'fixed' , detail:'short' } ,
											container : $( '#daylight-air-temperature-explore-tc' )
										}
									)
								] ,
								callbacks : [ widgetScroll ]
							}
						)
					],
					callbacks : [ cbRelationSunEnergy ]
				}
			);
		}
	},
	'relationships-intro2' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'gsod' },
					date           : { type:'year-month-day-range' },
					maxPoints      : 1,
					container      : $( '#relations-intro2-map' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'linechart',
							{
								tooltip   : { position:'fixed' , detail:'short' } ,
								container : $( '#relations-intro2-graph' )
							}
						)
					],
					callbacks : [ cbRelation2 ]
				}
			);
		}
	} ,
	'relationships-intro3' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'sunangle' , fields:['sunAngle','sunEnergyT'] },
					date           : { type:'month-day' },
					maxPoints      : 1,
					container      : $( '#relations-intro3-map' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'linechart',
							{
								tooltip   : { position:'fixed' , detail:'short' } ,
								container : $( '#relations-intro3-graph' )
							}
						)
					],
					callbacks : [ cbRelation3 ]
				}
			);
		}
	} ,
	'relationships-bonaire' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					date           : { type:'year-month-day-range' },
					maxPoints      : 2,
					container      : $( '#relations-bonaire-map' ),
					data : { source:function( evt ) {
						this.data['bonair-to-baltimore'] = {
							seriesMeta : {
								series : 'bonair-to-baltimore',
								label : 'Bonaire to Baltimore',
								seriesSort : function (a,b) { return 0; },
								dataSort : function (a,b) { return a.date.getTime()-b.date.getTime(); }
							},
							dataMeta : {
								altitude : { type : 'float' , label : 'Altitude' , range: [0,50000] , format : function ( val ) { return Math.round( val ) + ' Feet'; } },
								temp : { type : 'float' , label : 'Temperature' , range : [-100,100] , format : function ( val ) { return Math.round( val ) + '°F'; } },
							},
							data : [{altitude:0,temp:80},{altitude:10000,temp:50},{altitude:20000,temp:20},{altitude:30000,temp:-30},{altitude:40000,temp:-75}],
						};
						for (i in this.settings.displayWidgets) {
							this.settings.displayWidgets[i].notify('ready');
							this.settings.displayWidgets[i].loadData(this.data);
						}
					} },
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'linechart',
							{
								tooltip   : { position:'fixed' , detail:'short' } ,
								container : $( '#relations-bonaire-graph' )
							}
						)
					],
					callbacks : [ cbBonaire ]
				}
			);
		}
	} ,
	'relationships-sun-energy' : {
		is_initialized : false ,
		initialize : function ( ) {
			aaasClimateViz.loadWidget(
				'dataSelect',
				{
					data           : { source:'location-stats' , fields:['-sunImage'] },
					date           : { type:'month-day' , max:12 },
					maxPoints      : 1,
					container      : $( '#variables-selection-2' ),
					displayWidgets : [
						aaasClimateViz.loadWidget(
							'table',
							{
								container : $( '#variables-table-2' ) ,
								selectForOutput : 2,
								displayWidgets : [
									aaasClimateViz.loadWidget(
										'linechart',
										{
											tooltip   : { position:'fixed' , detail:'short' } ,
											container : $( '#variables-graph-2' )
										}
									)
								] ,
								callbacks : [ widgetScroll ]
							}
						)
					],
					callbacks : [ cbRelationSunEnergy ]
				}
			);
		}
	}
};
