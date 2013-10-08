// @url http://stackoverflow.com/a/15013673/264628
jQuery.fn.exists = function () {
	return this.length !== 0 && this;
}

// FIXME: create a tutorial JS library that applies to elements that have a relevant class, e.g. "tutorial latlng"
var slideInit;
function ctrlSlider_cb ( psobj ) {
	// NOTE: `psobj` is the callback object, `this` contains the slider settings
	var id = psobj.$currentSlide.attr( 'id' );
	location.hash = '#'+id;
	
	/* Initialize the slide if necessary. */
	if ( slideInit.hasOwnProperty( id ) && !slideInit[id].is_initialized ) {
		slideInit[id].initialize();
		slideInit[id].is_initialized = true;
	}
	
	/* Determine which nav manu item to highlight. */
	$( '#slider-menu .current' ).removeClass( 'current' );
	var navItem = $( '#slider-menu a[href=#'+id+']' );
	var navID = id;
	if ( navItem.length == 0 ) {
		var slideIndex = psobj.currentSlideIndex;
		while ( navItem.length == 0 && slideIndex >= 0 ) {
			slideIndex--;
			navID = $( psobj.$slides[slideIndex] ).attr( 'id' );
			navItem = $( '#slider-menu a[href=#'+navID+']' );
		}
	}
	navItem.addClass( 'current' );
	if ( psobj.currentSlideIndex == 0 ) {
		$( '#slider-navigation .prev ').hide();
		$( '#slider-navigation .next ').show();
	} else if ( psobj.currentSlideIndex == psobj.slideIndexCount ) {
		$( '#slider-navigation .prev ').show();
		$( '#slider-navigation .next ').hide();
	} else {
		$( '#slider-navigation .prev ').show();
		$( '#slider-navigation .next ').show();
	}
	
	$( '#slider-menu .you-are-here .screen-num' ).html( psobj.currentSlideIndex + 1 );
}
var ctrlSlider;
var replayData;
$( function( ) {
	/* Look for a replay session ID and replay the user data if found. */
	if ( typeof( sessionID = $.url( ).param( 'replay' ) ) !== 'undefined' ) {
		// FIXME: make all activities and input elements read only
		/* Set an initialization event to replay the data on widgets. */
		aaasClimateViz.widgetLibrary.dataSelect.__prototype.settings.callbacks.push( replay );
		$.ajax( {
			
			type     : 'GET' ,
			url      : 'ajax-data-replay' ,
			dataType : 'jsonp json' , /* because of IE */
			data     : { instance_id : $.url( ).param( 'instance_id' ) , student_id : $.url( ).param( 'student_id' ) } ,
			
			success  : function ( data , textStatus , jqXHR ) {
				replayData = data;
				if ( Object.keys( data ).length > 0 ) {
					/* Parse the replay data for input elements and populate with the saved values */
					for ( id in data ) {
						if ( data[id].hasOwnProperty( 'usrInput' ) ) {
							$( '#'+id ).val( data[id].usrInput )
						}
					}
				}
			}
			
		} );
	/* Set up event handlers for saving user data if not replaying. */
	} else {
		$( ':input' ).change( saveData );
		aaasClimateViz.widgetLibrary.dataSelect.__prototype.settings.callbacks.push( saveData );
	}
	
	// FIXME: could use !important attributes to allow for application of plusslider rather than relying on a querystring param
	if ( location.search.substring(1) !== 'print' ) {
		ctrlSlider = new $.plusSlider(
			$( '#slider' ),
			{
				autoPlay           : false,
				afterSlide         : ctrlSlider_cb,
				createPagination   : false,
				createArrows       : false,
				disableLoop        : true,
				height             : 600,
				infiniteSlide      : false,
				keyboardNavigation : false,
				sliderEasing       : 'linear',
				sliderType         : 'slider',
				speed              : 0,
				width              : 906,
				onSlide            : function ( psobj ) { if ( psobj.$currentSlide.find( '.scrollable' ).length > 0 ) { psobj.$currentSlide.find( '.scrollable' ).mCustomScrollbar('scrollTo','top'); } }
			}
		);
		
		$( '.instructions .slider' ).each( function ( idx , el ) {
			this.sliderObj = new $.plusSlider(
				$( this ),
				{
					autoPlay           : false,
					createPagination   : true,
					createArrows       : false,
					disableLoop        : true,
					height             : 85,
					infiniteSlide      : false,
					keyboardNavigation : false,
					sliderEasing       : 'linear',
					sliderType         : 'slider',
					speed              : 500,
					width              : 806,
					onSlide            : function ( psobj ) { psobj.$currentSlide.mCustomScrollbar('scrollTo','top'); }
				}
			);
		} );
		
		$( '[data-slide-type="key"]' ).each( function ( idx , el ) {
			$( '#slider-menu ul' ).append( '<li><a href="#' + $( el ).attr( 'id' ) + '">' + $( el ).data( 'slide-title' ) + '</a></li>' );
		} );
		
		if ( $( location.hash ).index() >= 0 ) {
			ctrlSlider.toSlide( $( location.hash ).index() );
		} else {
			ctrlSlider.toSlide( 0 );
		}
		$( '#slider-menu a' ).click( function ( evt ) {
			ctrlSlider.toSlide( $( $( this ).attr( 'href' ) ).index() );
		} );
		
		$( '#slider-menu' ).data( 'width' , $( '#slider-menu' ).width( ) );
		$( '#slider-menu' ).css( { 'right':'auto' , 'left':'100%' , 'width':$( '#slider-menu' ).data( 'width' )+'px' } );
		$( '#slider-menu .access-control' ).click( function ( evt ) {
			var el = $( this ).parent();
			if ( el.hasClass( 'active' ) ) {
				el.removeClass( 'active' );
				el.animate( { left : '100%' } , 450 );
			} else {
				el.addClass( 'active' );
				el.animate( { left : $( '#slider-positioner' ).width( ) - $( '#slider-menu' ).data( 'width' ) - 10 } , 450 );
			}
		} );
		
		$( '#slider-navigation .prev' ).click( function ( evt ) {
			var instrSlider = ( ctrlSlider.$currentSlide.find( '.instructions .slider' ).length > 0 ? ctrlSlider.$currentSlide.find( '.instructions .slider' )[0].sliderObj : false );
			if ( instrSlider && instrSlider.currentSlideIndex > 0 ) {
				instrSlider.toSlide( 'prev' );
			} else {
				ctrlSlider.toSlide( 'prev' );
			}
		} );
		$( '#slider-navigation .prev' ).dblclick( function ( evt ) {
			var instrSlider = ( ctrlSlider.$currentSlide.find( '.instructions .slider' ).length > 0 ? ctrlSlider.$currentSlide.find( '.instructions .slider' )[0].sliderObj : false );
			if ( instrSlider ) {
				setTimeout( function () { instrSlider.toSlide( 0 ) } , 1000 );
			}
			ctrlSlider.toSlide( 'prev' );
		} );
		$( '#slider-navigation .next' ).click( function ( evt ) {
			var instrSlider = ( ctrlSlider.$currentSlide.find( '.instructions .slider' ).length > 0 ? ctrlSlider.$currentSlide.find( '.instructions .slider' )[0].sliderObj : false );
			if ( instrSlider && instrSlider.currentSlideIndex < instrSlider.slideIndexCount ) {
				instrSlider.toSlide( 'next' );
			} else {
				ctrlSlider.toSlide( 'next' );
			}
		} );
		$( '#slider-navigation .next' ).dblclick( function ( evt ) {
			var instrSlider = ( ctrlSlider.$currentSlide.find( '.instructions .slider' ).length > 0 ? ctrlSlider.$currentSlide.find( '.instructions .slider' )[0].sliderObj : false );
			if ( instrSlider ) {
				setTimeout( function () { instrSlider.toSlide( instrSlider.slideIndexCount ) } , 1000 );
			}
			ctrlSlider.toSlide( 'next' );
		} );
		
		$( '#slider-menu .you-are-here .screen-total' ).html( ctrlSlider.slideCount );
	}
	
	$( '.tooltip' ).tooltip( { } );
	
	manageScroll( '.activity .plusslider .child' );
	if ( ( el = $( '.child > .scrollable' ).exists() ) !== false ) {
		el.height( el.parent( ).height() - el.position( ).top - 60 );
	}
	manageScroll( '.scrollable' );
} );

function manageScroll ( el , userOpts ) {
	var defOpts = {
		scrollInertia      : 0 ,
		mouseWheel         : true ,
		autoDraggerLength  : true ,
		autoHideScrollbar  : false ,
		contentTouchScroll : true ,
		mouseWheelPixels   : 15 ,
		advanced : {
			updateOnWindowResize : false ,
			updateOnContentResize : true
		} ,
		scrollButtons : {
			enable : true
		}
	};
	if ( typeof( userOpts ) !== "undefined" ) { $.extend( true , defOpts , userOpts ); }
	if ( !$( el ).hasClass( 'mCustomScrollbar' ) ) {
		$( el ).mCustomScrollbar( defOpts );
	} else {
		$( el ).mCustomScrollbar( 'update' );
	}
}

function saveData ( evt ) {
	var currentSlide = '';
	var record = {};
	if ( typeof( this ) == 'object' && this.type && this.type == 'dataSelect' && evt.type == 'data-load' && !this.settings.readOnly ) {
		// FIXME: should capture the exact selector in case a simple ID isn't used?
		// If so we'll need to update how the user field container is recorded
		record = {
			container : this.settings.container.selector.replace( '#' , '' ) ,
			event     : evt.type ,
			type      : this.type ,
			data      : {
				date : this.map.date.data( 'value' ) ,
				markers : {}
			}
		};
		for ( markerID in this.markers ) {
			record.data.markers[markerID] = {
				lat  : this.markers[markerID].position.lat() ,
				lng  : this.markers[markerID].position.lng()
			};
		};
	} else if ( typeof( this ) == 'object' && evt.type == 'change' ) {
		el = $( this );
		record = {
			container : el.attr( 'id' ) ,
			event     : evt.type ,
			type      : this.type ,
			data      : {
				usrInput  : el.val( )
			}
		};
	}
	if ( Object.keys(record).length > 0 ) {
		$.ajax( {
			type     : 'POST' ,
			url      : 'ajax-data-save' ,
			dataType : 'jsonp json' , /* because of IE */
			data     : { value : record }
		} );
	}
}

function replay ( evt ) {
	// FIXME: could have some timing issues here if the widget is loaded before replayData is populated
	// FIXME: should we make the widget selection, move to the last slide of the instruction slider, and make it again? Some activities modify the operating parameters as the student goes through the instructions.
	/* If we are initializing the widget and have user data then replay the user selections.
	The code currently only supports save/replay on the dataSelect widget. Some modifications
	will need to be made to add support to other widgets. */
	var id = this.settings.container.selector.substring( 1 );
	var wInstance = this;
	if ( evt.type == 'initialize' && replayData.hasOwnProperty( id ) ) {
		var instrSlider = this.settings.container.parents( '.child' ).find( '.instructions .slider' )[0].sliderObj;
		if ( typeof(instrSlider) !== 'undefined' ) {
			instrSlider.toSlide( instrSlider.slideIndexCount );
		}
		/* Delay the replay so that any slider event can trigger. */
		setTimeout( function ( ) {
			if ( typeof( replayData[id].date[0] ) == 'string' ) {
				var selectedDate = new Date( aaasClimateViz.dateParser( replayData[id].date[0] ) );
				if ( wInstance.settings.date.type == 'month-day-alt' ) {
					selectedDate.setFullYear( 1995 );
				}
				wInstance.map.date.ui.dpDiv.datepicker( 'setDate' , selectedDate );
			} else if ( typeof( replayData[id].date[0] ) == 'object' ) {
				wInstance.map.date.ui[0].dpDiv.datepicker( 'setDate' , aaasClimateViz.dateParser( new Date( replayData[id].date[0][0] ) ) );
				wInstance.map.date.ui[1].dpDiv.datepicker( 'setDate' , aaasClimateViz.dateParser( new Date( replayData[id].date[0][1] ) ) );
			}
			wInstance.map.date.ui.find('.ui-state-active').click();
			for ( mid in replayData[id].markers ) {
				google.maps.event.trigger( wInstance.map , 'click' , { latLng : new google.maps.LatLng( replayData[id].markers[mid].lat , replayData[id].markers[mid].lng ) } );
			}
		} , 500 );
	}
}