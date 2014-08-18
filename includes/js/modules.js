// @url http://stackoverflow.com/a/15013673/264628
jQuery.fn.exists = function () {
	return this.length !== 0 && this;
}

var ctrlSlider;
var prevNextInterval;
var replayData;
var slideInit;
var loadAirMovementVids;
function	nextClickevt ( evt ) {
			$(this).data("currSlide",-1);
			var instrSlider = ( ctrlSlider.$currentSlide.find( '.instructions .slider' ).length > 0 ? ctrlSlider.$currentSlide.find( '.instructions .slider' )[0].sliderObj : false );
			if ( instrSlider && instrSlider.currentSlideIndex < instrSlider.slideIndexCount && !evt.ctrlKey ) {
				$(this).data("currSlide",instrSlider.currentSlideIndex);
				instrSlider.toSlide( 'next' );
			} else if ( ctrlSlider.currentSlideIndex < ctrlSlider.slideIndexCount ) {
				$(this).data("currSlide",-1);
				ctrlSlider.toSlide( 'next' );
			}			
			setTimeout( locationUpdate , 500 );
			$(this).off('click',nextClickevt);
		}
$( '#slider-navigation .next' ).on('click',nextClickevt);
function	prevClickevt ( evt ) {		
			var instrSlider = ( ctrlSlider.$currentSlide.find( '.instructions .slider' ).length > 0 ? ctrlSlider.$currentSlide.find( '.instructions .slider' )[0].sliderObj : false );
			if ( instrSlider && instrSlider.currentSlideIndex > 0 && !evt.ctrlKey ) {
				instrSlider.toSlide( 'prev' );
			}
			else if ( ctrlSlider.currentSlideIndex > 0 ) {
				ctrlSlider.toSlide( 'prev' );
			}
			setTimeout( locationUpdate , 500 );
			$(this).off('click',prevClickevt);
		}
$( '#slider-navigation .prev' ).on('click',prevClickevt);
function ctrlSlider_cb ( psobj ) {
	// NOTE: `psobj` is the callback object, `this` contains the slider settings
	var id = psobj.$currentSlide.attr( 'id' );
	location.hash = '#'+id;
	
	/* Initialize the slide if necessary. */
	//console.log(jQuery('#slider-navigation .next').data('events'));
	//console.log(jQuery(psobj.$currentSlide.find('.plusslider-pagination li').data('events')));
	$('#slider-navigation .next').off('click.animate');
	if ( slideInit.hasOwnProperty( id ) && !slideInit[id].is_initialized ) {
		slideInit[id].initialize();
		psobj.$currentSlide.find('.plusslider-pagination li').on('click.animate', function(evt){
			$('#slider-navigation .next').data("currSlide",psobj.$currentSlide.find( '.instructions .slider' )[0].sliderObj.currentSlideIndex);
			$('#slider-navigation .next').trigger('click.animate');
			});
		slideInit[id].is_initialized = true;
	}
	else if (slideInit.hasOwnProperty( id ) && typeof(aaasClimateViz.widgets[aaasClimateViz.widgetLookup[location.hash+'-ds']])!='undefined' && typeof(aaasClimateViz.widgets[aaasClimateViz.widgetLookup[location.hash+'-ds']].settings.animate)!='undefined'){
		$('#slider-navigation .next').data("currSlide",psobj.$currentSlide.find( '.instructions .slider' )[0].sliderObj.currentSlideIndex);
		$( '#slider-navigation .next' ).on('click.animate', aaasClimateViz.widgets[aaasClimateViz.widgetLookup[location.hash+'-ds']].settings.animate);
	}
	if (id == "daily-temperature-air") setTimeout(loadAirMovementVids, 500);
	/*reset Instruction sliders for key slides*/
	if (psobj.$currentSlide.attr( 'data-slide-type' ) == "key" ) { 
		$("[data-slide-parent-id='"+id+"']").each( function ( idx, el ) {
				var instrSlider = $(el).find( '.instructions .slider' );
				if (instrSlider.length > 0 && typeof(instrSlider[0].sliderObj) !== 'undefined' && slideInit[el.id].is_initialized ) instrSlider[0].sliderObj.toSlide( '0' );
			});
	}

	/* Determine which nav manu item to highlight. */
	$( '#slider-menu .current' ).removeClass( 'current' );
	var navItem = $( '#slider-menu a[href=#'+id+']' );
	var navParent = $( '#slider-menu a[href=#'+psobj.$currentSlide.attr( 'data-slide-parent-id' )+']');
	if (navParent.length!==0) $( "#accordion" ).accordion( "option", "active", parseInt(navParent.attr('id').slice(-1)));
	var navID = id;
	if ( navItem.length == 0 ) {
		if (navID.indexOf('complete') != -1) {
			navItem = $( navParent );
			navItem.addClass('completed');}
		else {
		var slideIndex = psobj.currentSlideIndex;
		while ( navItem.length == 0 && slideIndex >= 0 ) {
			slideIndex--;
			navID = $( psobj.$slides[slideIndex] ).attr( 'id' );
			navItem = $( '#slider-menu a[href=#'+navID+']' );
		}}
	}
	navItem.addClass( 'current' );
	//navParent.addClass('ui-accordion-header-active');
	/* pop out menu for contents slides*/
	if ( psobj.$currentSlide.attr('data-slide-type') == 'contents' ) {
			setTimeout(function () {
			$( '#slider-menu').animate( { left : $( '#slider-positioner' ).width( ) - $( '#slider-menu' ).data( 'width' ) + 4 } , 450, function() {$('#slider-menu').addClass( 'active' );} );
			//$( '#slider-menu a').removeClass('current');
			$('#slider-menu a').removeClass('ui-accordion-header-active');
			switch(id) {
				case 'contents-2':
					$('#slider-menu a[href="#daily-temperature-intro"]').addClass('ui-accordion-header-active');
					$('#slider-menu a[href="#annual-temperature-intro"]').addClass('ui-accordion-header-active');
					break;
				case 'contents-3':
					$('#slider-menu a[href="#temperature-lat-intro"]').addClass('ui-accordion-header-active');
					$('#slider-menu a[href="#temperature-elevation-intro"]').addClass('ui-accordion-header-active');
					$('#slider-menu a[href="#temperature-water-intro"]').addClass('ui-accordion-header-active');
					break;
				case 'contents-4':
					$('#slider-menu a[href="#height-sun-intro"]').addClass('ui-accordion-header-active');
					$('#slider-menu a[href="#height-sun-air-temperature-intro"]').addClass('ui-accordion-header-active');
					break;
				case 'contents-5':
					$('#slider-menu a[href="#daylight-intro"]').addClass('ui-accordion-header-active');
					$('#slider-menu a[href="#daylight-air-temperature-intro"]').addClass('ui-accordion-header-active');
					break;
				case 'contents-6':
					$('#slider-menu a[href="#data-tools-intro"]').addClass('ui-accordion-header-active');
					break;
							}
					}, 100);
	}
	/*close menu if open */
	else if ( $('#slider-menu').hasClass( 'active' ) ) {
		$('#slider-menu').removeClass( 'active' );
		$('#slider-menu').animate( { left : '100%' } , 450 );
		$( '#click-cover').off('click', _clickOutmenu);
		$( '#click-cover').hide();
		$( '#slider-menu a').removeClass('ui-accordion-header-active');
	}	
	/*buttons for book end slides */
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

	/* keep user from hitting next before page load */
	$( '#slider-navigation .next' ).off('click',nextClickevt);
	$( '#slider-navigation .next' ).onFirst('click',nextClickevt);
	$( '#slider-navigation .prev' ).off('click',prevClickevt);
	$( '#slider-navigation .prev' ).on('click',prevClickevt);
	//if( typeof(jQuery( '#slider-navigation .next' ).data( "events" ))==="undefined") $( '#slider-navigation .next' ).on('click',nextClickevt);
	//if( typeof(jQuery( '#slider-navigation .prev' ).data( "events" ))==="undefined") $( '#slider-navigation .prev' ).on('click',prevClickevt);
}
function locationUpdate ( ) {
	var section , screen , instruction;
	if ( ctrlSlider.$currentSlide.data( 'slide-type' ) == 'key' ) {
		section = $( '[data-slide-type=key]' ).index( ctrlSlider.$currentSlide ) + 1;
		screen = 0;
	} else {
		section = $( '[data-slide-type=key]' ).index( $( '#' + ctrlSlider.$currentSlide.data( 'slide-parent-id' ) ) ) + 1;
		screen = $( '#' + ctrlSlider.$currentSlide.data( 'slide-parent-id' ) + ' , [data-slide-parent-id=' + ctrlSlider.$currentSlide.data( 'slide-parent-id' ) + ']' ).index( ctrlSlider.$currentSlide );
	}
	var instrSlider = ( ctrlSlider.$currentSlide.find( '.instructions .slider' ).length > 0 ? ctrlSlider.$currentSlide.find( '.instructions .slider' )[0].sliderObj : false );
	if ( instrSlider ) {
		instruction = instrSlider.currentSlideIndex + 1;
	}
	if (section == 1) section="INTRO";
	else if (section == $( '[data-slide-type=key]' ).length) section="TOOLS";
	else section = String.fromCharCode( section + 64 - 1 );
	$( '.you-are-here .screen-id' ).html(
		'Screen: ' + section +
		'.' + screen +
		( instruction ? '.' + instruction : '' )
	);
	$( '.you-are-here .screen-num' ).html( ctrlSlider.currentSlideIndex + 1 );
	//if( typeof(jQuery( '#slider-navigation .next' ).data( "events" ))==="undefined") $( '#slider-navigation .next' ).on('click',nextClickevt);
	$( '#slider-navigation .next' ).off('click',nextClickevt);
	$( '#slider-navigation .next' ).onFirst('click',nextClickevt);
	$( '#slider-navigation .prev' ).off('click',prevClickevt);
	$( '#slider-navigation .prev' ).on('click',prevClickevt);
}

$( function( ) {
	// http://stackoverflow.com/a/2104939/264628
	$(function(){
		var keyStop = {
			8  : ':not(input:text, textarea, input:file, input:password)' , // stop backspace = back
			9  : '*' ,
			13 : 'input:text, input:password, input:radio, input:checkbox' , // stop enter = submit 
			
			end: null
		};
		$( document ).bind( "keydown" , function ( evt ) {
			var selector = keyStop[evt.which];
			
			if ( selector !== undefined && $( evt.target ).is( selector ) ) {
				evt.preventDefault(); //stop event
				evt.stopPropagation();
			}
			return true;
		});
	});
	
	/* Show the student login */
	$( '#login' ).dialog( {
		modal : true ,
		width : '65%'
	} );
	$( '.ui-dialog-titlebar' ).hide( );
	$( '#login #skip-action' ).click( function ( evt ) {
		evt.preventDefault();
		$( '#login' ).dialog( 'close' );
	} );
	$( '#student-login' ).submit( function ( evt ) {
		evt.preventDefault();
	} );
	
	/* Look for a replay session ID and replay the user data if found. */
	if ( typeof( sessionID = $.url( ).param( 'replay' ) ) !== 'undefined' ) {
		// FIXME: make all activities and input elements read only
		/* Set an initialization event to replay the data on widgets. */
		aaasClimateViz.widgetLibrary.dataSelect.__prototype.settings.callbacks.push( replay );
		$.ajax( {
			
			type     : 'GET' ,
			url      : '../ajax-data-replay' ,
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
				height             : 700,
				infiniteSlide      : false,
				keyboardNavigation : false,
				sliderEasing       : 'linear',
				sliderType         : 'slider',
				speed              : 0,
				width              : 906,
				onSlide            : function ( psobj ) { if ( psobj.$currentSlide.find( '.scrollable.mCustomScrollbar' ).length > 0 ) { psobj.$currentSlide.find( '.scrollable' ).each( function ( idx , el ) { $( this ).mCustomScrollbar( 'scrollTo' , 'top' ); } ); } }
			}
		);
		
		$( '.instructions .slider' ).each( function ( idx , el ) {
			this.sliderObj = new $.plusSlider(
				$( this ),
				{
					autoPlay           : false,
					afterSlide         : locationUpdate ,
					createPagination   : true,
					createArrows       : false,
					disableLoop        : true,
					height             : 185,
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
		
		$("#accordion").accordion({event: "click hoverintent", collapsible: false, autoHeight: false, heightStyle:"content", icons: null, clearStyle: true});
		  $.event.special.hoverintent = {
    setup: function() {
      $( this ).bind( "mouseover", jQuery.event.special.hoverintent.handler );
    },
    teardown: function() {
      $( this ).unbind( "mouseover", jQuery.event.special.hoverintent.handler );
    },
    handler: function( event ) {
      var currentX, currentY, timeout,
        args = arguments,
        target = $( event.target ),
        previousX = event.pageX,
        previousY = event.pageY;
 
      function track( event ) {
        currentX = event.pageX;
        currentY = event.pageY;
      };
 
      function clear() {
        target
          .unbind( "mousemove", track )
          .unbind( "mouseout", clear );
        clearTimeout( timeout );
      }
 
      function handler() {
        var prop,
          orig = event;
 
        if ( ( Math.abs( previousX - currentX ) +
            Math.abs( previousY - currentY ) ) < 7 ) {
          clear();
 
          event = $.Event( "hoverintent" );
          for ( prop in orig ) {
            if ( !( prop in event ) ) {
              event[ prop ] = orig[ prop ];
            }
          }
          // Prevent accessing the original event since the new event
          // is fired asynchronously and the old event is no longer
          // usable (#6028)
          delete event.originalEvent;
 
          target.trigger( event );
        } else {
          previousX = currentX;
          previousY = currentY;
          timeout = setTimeout( handler, 100 );
        }
      }
 
      timeout = setTimeout( handler, 200 );
      if ($("#slider-menu").hasClass('active')){
			target.bind({
        mousemove: track,
        mouseout: clear
      });}
    }
  };

	//roman numeral code used in menu from http://www.iandevlin.com/blog/2010/03/javascript/converting-decimal-numbers-to-roman-numerals-in-javascript
var roman = new Array(); 
roman = ["m","cm","d","cd","c","xc","l","xl","x","ix","v","iv","i"]; 
var decimal = new Array(); 
decimal = [1000,900,500,400,100,90,50,40,10,9,5,4,1]; 
function decimalToRomanSimple(value) { 
  if (value <= 0 || value >= 4000) return value; 
    var romanNumeral = ""; 
    for (var i=0; i<roman.length; i++) { 
      while (value >= decimal[i]) {  
        value -= decimal[i]; 
        romanNumeral += roman[i]; 
      } 
    } 
    return romanNumeral; 
}

		$('[data-slide-type=key]').each( function (idx, el) {
			if ($( el ).attr( 'id' ) == "introduction" || $( el ).attr( 'id' ) == "data-tools-intro") {
				$('#accordion').append( '<a href="#' + $( el ).attr( 'id' ) + '"> &nbsp &nbsp ' + $( el ).data( 'slide-group-title' ) + '</a>' );
				 //$('#accordion a:last-child').css( { 'border-top':'2px solid black'});
				}
			else $('#accordion').append( '<a href="#' + $( el ).attr( 'id' ) + '">' + String.fromCharCode( idx + 64 ) + '. ' + $( el ).data( 'slide-group-title' ) + '</a>' );
			$('#accordion').append('<div><ul></ul></div>');
			var menuidxx=1;
		$("[data-slide-parent-id='"+$( el ).attr( 'id')+"']").each( function (idxx, ell) {
			if ($( ell ).attr( 'data-slide-title' ) == "Module Complete") return true;
			else if ($( ell ).attr( 'data-slide-type' ) == "tool") $('#accordion > div:last-child > ul').append( '<li><a href="#' + $( ell ).attr( 'id' ) + '">' + $( ell ).attr( 'data-slide-title' ) + '</a></li>' );
			else $('#accordion > div:last-child > ul').append( '<li><a href="#' + $( ell ).attr( 'id' ) + '">' + decimalToRomanSimple(menuidxx) + '. ' + $( ell ).attr( 'data-slide-title' ) + '</a></li>' );
			menuidxx+=1;
			});
		$('#accordion').accordion('refresh');
		});
		/*
		$( '[data-slide-type="key"]' ).each( function ( idx , el ) {
			$( '#slider-menu ul' ).append( '<li><a href="#' + $( el ).attr( 'id' ) + '">' + String.fromCharCode( idx + 1 + 64 ) + '. ' + $( el ).data( 'slide-group-title' ) + '</a></li>' );
		
		} );
		*/
		var reSlideID = /[A-Z]\.[0-9]{1,2}/i;
		
		if ( location.hash.length > 0 && reSlideID.test( location.hash.toUpperCase( ) ) ) {
			var araSlideID = location.hash.split( '.' );
			var groupKey = $( '.child' ).index( $( '[data-slide-type=key]' )[ araSlideID[0].toUpperCase().charCodeAt( 1 ) - 65 ] );
			ctrlSlider.toSlide( groupKey + parseInt( araSlideID[1] , 10 ) - 1 );
			if ( araSlideID.length == 3 ) {
				var instrSlider = ( ctrlSlider.$currentSlide.find( '.instructions .slider' ).length > 0 ? ctrlSlider.$currentSlide.find( '.instructions .slider' )[0].sliderObj : false );
				if ( instrSlider ) {
					setTimeout( function ( ) { instrSlider.toSlide( parseInt( araSlideID[2] , 10 ) - 1 ); } , 1000 );
				}
			}
		} else if ( location.hash.length > 0 && $( location.hash ).index() >= 0 ) {
			ctrlSlider.toSlide( $( location.hash ).index() );
		} else {
			ctrlSlider.toSlide( 0 );
		}
		
		_clickOutmenu = function (evt ){
			$('#slider-menu').removeClass( 'active' );
			$('#slider-menu').animate( { left : '100%' } , 450 );
			$( '#click-cover').off('click', _clickOutmenu);
			$( '#click-cover' ).hide();
		}
		
		$( '#slider-menu a' ).click( function ( evt ) {
			$('#slider-menu a').removeClass('ui-accordion-header-active');
			var instrSlider = $($(this).attr( 'href' )).find( '.instructions .slider' );
			if ( instrSlider.length > 0 && typeof(instrSlider[0].sliderObj) !== 'undefined') instrSlider[0].sliderObj.toSlide( 0 );
			ctrlSlider.toSlide( $( $( this ).attr( 'href' ) ).index() );
			setTimeout( locationUpdate , 500 );
		} );
	

		$( '#slider-menu' ).data( 'width' , $( '#slider-menu' ).width( ) );
		$( '#slider-menu' ).css( { 'right':'auto' , 'left':'100%' , 'width':$( '#slider-menu' ).data( 'width' )+'px' } );
		$( '#slider-menu .access-control' ).click( function ( evt ) {
			if ( ctrlSlider.$slides[ctrlSlider.currentSlideIndex].getAttribute('data-slide-type') == 'contents' ) { return; }
			var el = $( this ).parent();
			if ( el.hasClass( 'active' ) ) {
				el.removeClass( 'active' );
				el.animate( { left : '100%' } , 450 );
				$( '#click-cover').off('click', _clickOutmenu);
				$( '#click-cover').hide();
			} else {
				//el.addClass( 'active' );
				el.animate( { left : $( '#slider-positioner' ).width( ) - $( '#slider-menu' ).data( 'width' ) + 4 } , 450, function() {el.addClass( 'active' );} );
				$( '#click-cover' ).show();

				$( '#click-cover').on('click', _clickOutmenu);
			}
		} );
		
		

		
		$( '.you-are-here .screen-total' ).html( ctrlSlider.slideCount );
		locationUpdate();
	}
	
	$( '.tooltip' ).tooltip( { } );
	
	manageScroll( '.activity .plusslider .child' );
	$( '.child > .scrollable' ).each( function ( idx , el ) {
		$( this ).height( $( this ).parent( ).height( ) - $( this ).position( ).top - 60 );
	} );
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
	$( el ).each( function ( idx , el ) {
		if ( !$( this ).hasClass( 'mCustomScrollbar' ) ) {
			$( this ).mCustomScrollbar( defOpts );
		} else {
			$( this ).mCustomScrollbar( 'update' );
		}
	} );
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
			url      : '../ajax-data-save' ,
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
