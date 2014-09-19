/* Since we rely on jQuery for many things ... (perhaps this should be a jQuery plugin) */
if (typeof(jQuery) == 'undefined') {
	(function() {
		var jq = document.createElement('script'); jq.type = 'text/javascript'; jq.async = true;
		jq.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.js';
		var jqref = document.getElementsByTagName('script')[0]; jqref.parentNode.insertBefore(jq, jqref);
		
		// http://topsecretproject.finitestatemachine.com/2009/09/how-to-load-javascript-and-css-dynamically-with-jquery/
		css = $("<link>").appendTo("head");
		css.attr({
			rel:  "stylesheet",
			type: "text/css",
			href: ('https:' == document.location.protocol ? 'https://' : 'http://') + "ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/smoothness/jquery-ui.css"
		});
		$.getScript(('https:' == document.location.protocol ? 'https://' : 'http://') + 'ajax.googleapis.com/ajax/libs/jqueryui/1.8/jquery-ui.js');
	})();
}

var aaasClimateViz = aaasClimateViz || {
	settings : {
		__container : 'visualizationContainer',
		__selectionControl : 'stepwise',
		__dataParams : {},
		__output : ['table'],
		__outputStyle : 'sidebyside',
		__libraryURI : '',
		
		_container : function (val) { if (val) { this.__container = val[0]; }; return this.__container; },
		_selectionControl : function (val) { if (val) { this.__selectionControl = val[0]; }; return this.__selectionControl; },
		_dataParams : function (val) {
			if (val) {
				this.__dataParams.series = { label : val[0].shift() , settings : (val.shift())[0] };
				this.__dataParams.x = { label : val[0].shift() , settings : (val.shift())[0] };
				this.__dataParams.y = { label : val[0].shift() , settings : (val.shift())[0] };
			}
		},
		_output : function (val) { if (val) { this.__output = val; }; return this.__output; },
		_outputStyle : function (val) { if (val) { this.__outputStyle = val[0]; }; return this.__outputStyle; },
		_libraryURI : function (val) { if (val) { this.__libraryURI = val[0]; }; return this.__libraryURI; }
		
	},
	
	dataSources : {
		gsod : {
			organization : 'NOAA-GSOD',
			source : '',
			dataURI : ''
		},
		merra : {
			organization : 'NASA',
			source : '',
			dataURI : ''
		},
		sunangle : {
			organization : 'Sustainable By Design',
			source : 'http://susdesign.com/',
			dataURI : '/js/solar.js'
		}
	},
	
	'push' : function (settingsArray) {
		for (i in settingsArray) {
			if (typeof(settingsArray[i]) === 'array' || typeof(settingsArray[i]) === 'object') {
				this.settings[settingsArray[i].shift()](settingsArray[i]);
			} else {
				this.settings[settingsArray.shift()](settingsArray);
			}
		}
	},
	
	dataPointer : [],
	data : [],
	widgets : [],
	widgetLookup : {},
	//FIXME: need a way to check from the widgetLibrary load method when a widget is ready to use, maybe: loadWidget <cb> widget::initializeWidget <cb> widgetLibrary::widget::load
	widgetLibrary : {
		'dataSelect':{
			'__prototype' : {
				data : {}, 
				settings : { callbacks : [] },
				type : 'dataSelect'
			},
			'queue' : [],
			'loaded' : {'html':false,'js':false},
			'status' : 'uninitialized',
			'load' : function () {
				if ( this.status !== 'initialized' ) {
					return;
				}
				var widget = null;
				while (this.queue.length > 0) {
					widget = this.queue.pop();
					widget.settings.container.html( this.html );
					dataSelect_instantiate( widget );
				}
			}
		},
		'statspanel':{
			'__prototype' : {
				data : {},
				settings : { callbacks : [] },
				type : 'statspanel'
			},
			'queue' : [],
			'loaded' : {'html':false,'js':false},
			'status' : 'uninitialized',
			'load' : function () {
				if ( this.status !== 'initialized' ) {
					return;
				}
				var widget = null;
				while (this.queue.length > 0) {
					widget = this.queue.pop();
					widget.settings.container.html( this.html );
					statspanel_instantiate( widget );
				}
			}
		},
		'table':{
			'__prototype' : {
				data : {},
				settings : { callbacks : [] },
				type : 'table'
			},
			'queue' : [],
			'loaded' : {'html':false,'js':false},
			'status' : 'uninitialized',
			'load' : function () {
				if ( this.status !== 'initialized' ) {
					return;
				}
				var widget = null;
				while (this.queue.length > 0) {
					widget = this.queue.pop();
					widget.settings.container.html( this.html );
					table_instantiate( widget );
				}
			}
		},
		'linechart':{
			'__prototype' : {
				data : {},
				settings : { callbacks : [] },
				type : 'linechart'
			},
			'queue' : [],
			'loaded' : {'html':false,'js':false},
			'status' : 'uninitialized',
			'load' : function () {
				if ( this.status !== 'initialized' ) {
					return;
				}
				var widget = null;
				while (this.queue.length > 0) {
					widget = this.queue.pop();
					widget.settings.container.html( this.html );
					linechart_instantiate( widget );
				}
			}
		}
	},
	
	loadWidget : function ( widgetName , settings ) {
		settings.instantiate_promise=$.Deferred();
		if ( typeof( this.widgetLibrary[widgetName] ) == 'undefined' || typeof( settings.container ) == 'undefined' ) {
			settings.instantiate_promise.fail();
			settings.instantiate_promise = settings.instantiate_promise.promise();
			return false;
		}
		if ( typeof( settings.container.widget ) == 'undefined' ) {
			//FIXME: was trying to set a property on the element so we can access the widget through the element, but this only affects the settings object
			settings.container.widget = {};
			// FIXME: when using a recursive (deep) merge settings.container.widget is no longer passed by reference on return
			// We need a deep merge or multiple widgets of the same type will share their __prototype properties (namely,
			// the data property). Working around the problem by using an inner $.extend() with deep merge on the __prototype.
			// Likely the object is recreated when using the deep merge, resulting in the broken reference.
			$.extend( settings.container.widget , $.extend( true , {} , this.widgetLibrary[widgetName].__prototype ) , {'settings':settings} );
			if ( typeof( settings.container.widget.settings.callbacks ) !== 'undefined' ) {
				settings.container.widget.settings.callbacks = settings.container.widget.settings.callbacks.concat( this.widgetLibrary[widgetName].__prototype.settings.callbacks );
			} else {
				settings.container.widget.settings.callbacks = this.widgetLibrary[widgetName].__prototype.settings.callbacks;
			}
			this.widgets.push(settings.container.widget);
			settings.container.widget.index = this.widgets.length - 1;
			this.widgetLookup[settings.container.selector] = settings.container.widget.index;
			if (this.widgetLibrary[widgetName].status == 'uninitialized') {
				this.widgetLibrary[widgetName].status = 'loading';
				this.widgetLibrary[widgetName].queue.push( settings.container.widget );
				// http://topsecretproject.finitestatemachine.com/2009/09/how-to-load-javascript-and-css-dynamically-with-jquery/
				// widgetContainer.load(this.settings.__libraryURI+'/widgets/'+widgetName+'.html');
				$.get(
					this.settings.__libraryURI+'/widgets/'+widgetName+'.html' ,
					null ,
					function ( data , textStatus , jqXHR ) {
						aaasClimateViz.widgetLibrary[widgetName].loaded.html = true;
						aaasClimateViz.widgetLibrary[widgetName].html = data;
						css = $( '<link>' ).prependTo( 'head' );
						css.attr( {
							rel:  "stylesheet",
							type: "text/css",
							href: aaasClimateViz.settings.__libraryURI+'/widgets/'+widgetName+'.css'
						} );
						// FIXME: use success callback to indicate js load and initiliaze?
						$.getScript(
							aaasClimateViz.settings.__libraryURI + '/widgets/' + widgetName + '.js' ,
							function ( data , textStatus , jqXHR ) {
								aaasClimateViz.widgetLibrary[widgetName].loaded.js = true;
								aaasClimateViz.widgetLibrary[widgetName].load();
							}
						);
					}
				);
				
				// FIXME: should do some more checking to ensure the widget is loaded correctly; maybe set this via callback function on getScript() and reset the loaded flag
			} else {
				this.widgetLibrary[widgetName].queue.push( settings.container.widget );
				// FIXME: we need to use a timeout because we're not currently checking that the widget JS has successfully loaded (this gives us enough of a cushion to load the JS). Script will still die if the JS doesn't load for some reason.
				this.widgetLibrary[widgetName].load();
			}
		}
		settings.instantiate_promise.resolve();
		settings.instantiate_promise = settings.instantiate_promise.promise();
		return settings.container.widget;
	}
};


function arrayavg (values) {
	returnval = 0;
	returnvalcount = 0;
	for (var i in values) {
		if (typeof(values[i]) === 'undefined') { continue; }
		returnval+=values[i];
		returnvalcount++;
	}
	returnval = Math.round((returnval/returnvalcount)*10)/10;
	return (returnvalcount == 0 ? null : returnval);
}

// from https://github.com/danvk/dygraphs/blob/94ee0648098ec6d817772829a900e6f2fa7df61a/dygraph-utils.js
/**
* Parses a date, returning the number of milliseconds since epoch. This can be
* passed in as an xValueParser in the Dygraph constructor.
* TODO(danvk): enumerate formats that this understands.
*
* @param {string} dateStr A date in a variety of possible string formats.
* @return {number} Milliseconds since epoch.
* @private
*/
aaasClimateViz.dateParser = function(dateStr) {
  var dateStrSlashed;
  var d;
  
  if ( typeof( dateStr ) === 'undefined' ) {
	return false;
  }

  // Let the system try the format first, with one caveat:
  // YYYY-MM-DD[ HH:MM:SS] is interpreted as UTC by a variety of browsers.
  // dygraphs displays dates in local time, so this will result in surprising
  // inconsistencies. But if you specify "T" or "Z" (i.e. YYYY-MM-DDTHH:MM:SS),
  // then you probably know what you're doing, so we'll let you go ahead.
  // Issue: http://code.google.com/p/dygraphs/issues/detail?id=255
  if (dateStr.search("-") == -1 ||
      dateStr.search("T") != -1 || dateStr.search("Z") != -1) {
    d = aaasClimateViz.dateStrToMillis(dateStr);
    if (d && !isNaN(d)) return d;
  }

  if (dateStr.search("-") != -1) { // e.g. '2009-7-12' or '2009-07-12'
    dateStrSlashed = dateStr.replace("-", "/", "g");
    while (dateStrSlashed.search("-") != -1) {
      dateStrSlashed = dateStrSlashed.replace("-", "/");
    }
    d = aaasClimateViz.dateStrToMillis(dateStrSlashed);
  } else if (dateStr.length == 8) { // e.g. '20090712'
    // TODO(danvk): remove support for this format. It's confusing.
    dateStrSlashed = dateStr.substr(0,4) + "/" + dateStr.substr(4,2) + "/" +
        dateStr.substr(6,2);
    d = aaasClimateViz.dateStrToMillis(dateStrSlashed);
  } else {
    // Any format that Date.parse will accept, e.g. "2009/07/12" or
    // "2009/07/12 12:34:56"
    d = aaasClimateViz.dateStrToMillis(dateStr);
  }

  if (!d || isNaN(d)) {
    return false; // ("Couldn't parse " + dateStr + " as a date");
  }
  return d;
};

/**
* This is identical to JavaScript's built-in Date.parse() method, except that
* it doesn't get replaced with an incompatible method by aggressive JS
* libraries like MooTools or Joomla.
* @param {string} str The date string, e.g. "2011/05/06"
* @return {number} millis since epoch
* @private
*/
aaasClimateViz.dateStrToMillis = function(str) {
  return new Date(str).getTime();
};


/* instantiate the visualization object */
$(function () {
	var libControllerURI = $('script[src*="controller"]')[0].src;
	aaasClimateViz.push(['_libraryURI',(libControllerURI.substr(0,libControllerURI.lastIndexOf('/')-3))]);
	
	var css = $("<link>").prependTo("head");
	css.attr({
		rel:  "stylesheet",
		type: "text/css",
		href: aaasClimateViz.settings.__libraryURI+'/css/main.css'
	});
	
	// utility libraries
	if ( typeof md5 === 'undefined' ) { $.getScript(aaasClimateViz.settings.__libraryURI+'/js/md5.js'); }
	if ( typeof jQuery.url === 'undefined' ) { $.getScript(aaasClimateViz.settings.__libraryURI+'/js/jquery.purl.js'); }
	if ( typeof jQuery.autogrow === 'undefined' ) { $.getScript(aaasClimateViz.settings.__libraryURI+'/js/jquery.autogrow.js'); }
});
