// FIXME: add an option to display separate series as either stacked or side-by-side
function createTable(data, wInstance) {
	wInstance.data = data;
	if (wInstance.settings.filter) {
		data = wInstance.settings.filter(data);
	}
	if (wInstance.settings.selectForOutput) {
		wInstance.selection = [];
	}
	tbl = wInstance.settings.container.find('.output-table table tbody');
	tbl.empty();
	tblCols = wInstance.settings.container.find('.output-table table colgroup');
	tblCols.empty();
	seriesKeys = Object.keys(data);
	tbl.append('<tr class="header"></tr>');
	for (datapoint in data[seriesKeys[0]].dataMeta) {
		tblCols.append('<col id="'+datapoint+'">');
		tbl.find('tr.header').append('<th>'+data[seriesKeys[0]].dataMeta[datapoint].label+'</th>');
	}
	if (wInstance.settings.selectForOutput) {
		tbl.find( '.header th' ).click( function ( evt, clickId ) {
			if ( clickId ) {
				var datapoint = clickId; 
				var clickIdx = $( this ).closest( 'table' ).find('col').map(function() { return this.id}).get().indexOf(clickId) + 1;
				
				if (clickIdx == -1) return;

				var clickCol= $( this ).closest( 'table' ).find( 'colgroup col:nth-child(' + clickIdx + ')' );
				var clickTh=tbl.find( 'tr.header th:nth-child(' + clickIdx + ')');
			}
			else {
				var clickTh= $(this);
				var clickIdx = clickTh.index() + 1;
				var clickCol = clickTh.closest( 'table' ).find( 'colgroup col:nth-child(' + clickIdx + ')' );
				var datapoint = clickCol.attr( 'id' );
			}
			if ( wInstance.selection.indexOf( datapoint ) !== -1 ) {
				wInstance.selection.splice( wInstance.selection.indexOf( datapoint ) , 1 );
				clickTh.removeClass( 'selected-for-graph' );
				clickCol.removeClass( 'selected-for-graph' );
			}
			else {
				wInstance.selection.push( datapoint );
				clickTh.addClass( 'selected-for-graph' );
				clickCol.addClass( 'selected-for-graph' );
			}
			if ( wInstance.settings.selectForOutput && wInstance.selection.length > wInstance.settings.selectForOutput ) {
				overflowColumn = wInstance.selection.shift();
				tblCols.find( 'col#'+overflowColumn ).removeClass( 'selected-for-graph' );
				tbl.find( 'tr.header th:nth-child(' + ( tblCols.find( 'col#'+overflowColumn ).index() + 1 ) + ')' ).removeClass( 'selected-for-graph' );
			}
			if (wInstance.selection.length == wInstance.settings.selectForOutput) {
				var dataPass = {};
				for (idxSeries in data) {
					dataPass[idxSeries] = { seriesMeta : data[idxSeries].seriesMeta , dataMeta : {} , data : [] };
					for (i = 0; i < wInstance.selection.length; i++) {
						dataPass[idxSeries].dataMeta[wInstance.selection[i]] = data[idxSeries].dataMeta[wInstance.selection[i]];
					}
					for (idxData in data[idxSeries].data) {
						dataPush = {};
						for (i = 0; i < wInstance.selection.length; i++) {
							dataPush[wInstance.selection[i]] = data[idxSeries].data[idxData][wInstance.selection[i]];
						}
						dataPass[idxSeries].data.push(dataPush);
					}
				}
				for (i in wInstance.settings.displayWidgets) {
					wInstance.settings.displayWidgets[i].loadData(dataPass);
				}
			}
			wInstance._callback( { 'type':'selectData' } );
		} );
	} else {
		for (i in wInstance.settings.displayWidgets) {
			wInstance.settings.displayWidgets[i].loadData(data);
		}
	}
	for (idxSeries in data) {
		// sort the data
		if (data[idxSeries].seriesMeta.dataSort) {
			data[idxSeries].data.sort(data[idxSeries].seriesMeta.dataSort);
		}
		seriesHtml = '<tr class="series-header"><td class="tooltip" title="TEST" colspan="'+((Object.keys(data[idxSeries].dataMeta)).length)+'">'+data[idxSeries].seriesMeta.label+' ('+data[idxSeries].seriesMeta.lat+', '+data[idxSeries].seriesMeta.lng+')</td></tr>';
		for (idxData in data[idxSeries].data) {
			seriesHtml += '<tr class="series-data">';
			for (datapoint in data[idxSeries].dataMeta) {
				if ( ( data[idxSeries].dataMeta[datapoint].type == 'float' && isNaN( data[idxSeries].data[idxData][datapoint] ) ) || data[idxSeries].data[idxData][datapoint] == null ) {
					seriesHtml += '<td>&nbsp;</td>';
				} else if ('format' in data[idxSeries].dataMeta[datapoint] && typeof(data[idxSeries].dataMeta[datapoint].format) == 'function' || typeof(data[idxSeries].dataMeta[datapoint].format) == 'object') {
					seriesHtml += '<td>'+data[idxSeries].dataMeta[datapoint].format(data[idxSeries].data[idxData][datapoint])+'</td>';
				} else {
					seriesHtml += '<td>'+data[idxSeries].data[idxData][datapoint]+'</td>';
				}
			}
			seriesHtml += '</tr>';
		}
		tbl.append(seriesHtml);
	}
	$( '.tooltip' ).tooltip( { } );		
	wInstance._callback({'type':'dataReady'});
	return;
}

function table_notify ( noticeType , wInstance ) {
	wInstance._callback({'type':noticeType});
	switch ( noticeType ) {
		case 'loading' :
			wInstance.settings.container.find( '.error' ).remove();
			wInstance.settings.container.find( '.widget.output-table:not(:has(.loading))' ).css( 'min-height' , '200px' ).append( '<div class="loading"></div>' );
			break;
		case 'ready' :
			wInstance.settings.container.find( '.widget.output-table' ).css( 'min-height' , 'inherit' ).find( '.loading , .error' ).remove();
			break;
		case 'data-error' :
			wInstance.settings.container.find( '.loading' ).remove();
			wInstance.settings.container.find( '.widget.output-table:not(:has(.error))' ).append( '<div class="error"></div>' );
			break;
	}
}

function table_instantiate ( wInstance ) {
	wInstance.loadData = function ( data ) {
		createTable( data , this );
	}
	wInstance.notify = function ( noticeType ) {
		table_notify( noticeType , this );
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
	
	wInstance._callback({'type':'initialize'});
}

(function () {
	aaasClimateViz.widgetLibrary.table.status = 'initialized';
	aaasClimateViz.widgetLibrary.table.load();
})();
