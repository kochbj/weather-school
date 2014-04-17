function statspanel_createPanel(data, wInstance) {
	var labelDisplacement = {
		5  : [ 225 , 155 ] ,
		10 : [ 220 , 155 ] ,
		15 : [ 165 , 155 ] ,
		20 : [ 135 , 150 ] ,
		25 : [ 135 , 150 ] ,
		30 : [ 135 , 145 ] ,
		35 : [ 130 , 140 ] ,
		40 : [ 128 , 138 ] ,
		45 : [ 125 , 135 ] ,
		50 : [ 123 , 133 ] ,
		55 : [ 118 , 128 ] ,
		60 : [ 115 , 125 ] ,
		65 : [ 112 , 122 ] ,
		70 : [ 110 , 120 ] ,
		75 : [ 110 , 118 ] ,
		80 : [ 110 , 115 ] ,
		85 : [ 108 , 112 ] ,
		90 : [ 105 , 110 ] ,
	};
	var posSunImg;
	wInstance.data = data;
	wInstance.settings.container.find('td:not(:first-child)').remove();
	for (mid in data) { for ( idxData in data[mid].data ) {
		wInstance.settings.container.find( '.date' ).append( $( '<td>' + data[mid].dataMeta.date.format( data[mid].data[idxData].date ) + '</td>' ) );
		wInstance.settings.container.find( '.place' ).append( $( '<td>' + data[mid].seriesMeta.label + '<span style="border: 1px solid #999999; display: inline-block; height: 12px; margin: 0 0.5em; width: 12px; background-color: ' + data[mid].seriesMeta.color + '"></span></td>' ) );
		wInstance.settings.container.find( '.lat' ).append( $( '<td>' + data[mid].dataMeta.lat.format( data[mid].data[idxData].lat ) + '</td>' ) );
		// wInstance.settings.container.find('.lng').append( $( '<td>' + data[mid].dataMeta.lng.format(data[mid].data[idxData].lng ) + '</td>' ) );
		wInstance.settings.container.find( '.sunHours' ).append( $( '<td>' + data[mid].dataMeta.sunHours.format( data[mid].data[idxData].sunHours ) + '</td>' ) );
		wInstance.settings.container.find( '.sunEnergy' ).append( $( '<td>' + data[mid].dataMeta.sunEnergy.format( data[mid].data[idxData].sunEnergy ) + '</td>' ) );
		wInstance.settings.container.find( '.sunEnergyT' ).append( $( '<td>' + data[mid].dataMeta.sunEnergyT.format( data[mid].data[idxData].sunEnergyT ) + '</td>' ) );
		wInstance.settings.container.find( '.tempavg' ).append( $( '<td>' + data[mid].dataMeta.tempavg.format( data[mid].data[idxData].tempavg ) + ' <span class="minmax">H ' + data[mid].dataMeta.tempavg.format( data[mid].data[idxData].tempmax ) + '<br>L ' + data[mid].dataMeta.tempavg.format( data[mid].data[idxData].tempmin ) + '</span></td>' ) );
		wInstance.settings.container.find( '.sunAngle' ).append( $( '<td>' + data[mid].dataMeta.sunImage.format( data[mid].data[idxData].sunImage ) + '<span class="angle-val">' + data[mid].dataMeta.sunAngle.format( data[mid].data[idxData].sunAngle ) + '</span></td>' ) );
		//position sun angle value
		posSunImg = $('.sunAngle td:last-child img').position();
		$('.sunAngle td:last-child .angle-val').addClass( 'positioned' ).css( {
			position : 'absolute' ,
			left     : posSunImg.left + labelDisplacement[ ( Math.round( data[mid].data[idxData].sunAngle / 5 ) * 5 ) ][0] ,
			top      : posSunImg.top + labelDisplacement[ ( Math.round( data[mid].data[idxData].sunAngle / 5 ) * 5 ) ][1]
		} );
	} }
	wInstance._callback({'type':'render'});
}

function statspanel_notify ( noticeType , wInstance ) {
	switch ( noticeType ) {
		case 'loading' :
			wInstance.settings.container.find( '.error' ).remove();
			wInstance.settings.container.find( '.widget.statspanel:not(:has(.loading))' ).append( '<div class="loading"></div>' );
			break;
		case 'ready' :
			wInstance.settings.container.find( '.loading , .error' ).remove();
			break;
		case 'data-error' :
			wInstance.settings.container.find( '.loading' ).remove();
			wInstance.settings.container.find( '.widget.statspanel:not(:has(.error))' ).append( '<div class="error"></div>' );
			break;
	}
}

function statspanel_instantiate ( wInstance ) {
	wInstance.loadData = function ( data ) {
		statspanel_createPanel( data , this );
	}
	wInstance.notify = function ( noticeType ) {
		statspanel_notify( noticeType , this );
	}
	
	wInstance.callbacks = $.extend( {} , wInstance.callbacks , wInstance.settings.callbacks , true );
	wInstance.addCallback = function (callback) {
		this.callbacks.push(callback);
	}
	wInstance._callbacks = [];
	wInstance._callback = function (evt) {
		for (cbIdx in this.callbacks) {
			this.callbacks[cbIdx].call(this, evt);
		}
		for (cbIdx in this._callbacks) {
			this._callbacks[cbIdx].call(this, evt);
		}
	}
	// FIXME: can we create a "global" slideInit object that is called back?
	wInstance.settings.container.find( '.tooltip' ).tooltip( { } );
	wInstance._callback({'type':'initialize'});
}

(function () {
	aaasClimateViz.widgetLibrary.statspanel.status = 'initialized';
	aaasClimateViz.widgetLibrary.statspanel.load();
})()