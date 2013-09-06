vis = {
	animationSpeed : 1000,
	imglinks : 0,
	viewers : [],
	imgindex : null,
	controlId : null,
	visnode : null,
	loop : false,
	init : function (visid) {
		this.visnode = $('#'+visid);
		if (this.imglinks == 0) {
			this.visnode.find('#screen').css('display','none');
		} else {
			this.visnode.find('#screen').css('display','block');
		}
		if (this.imglinks <= 1) {
			this.visnode.find('#controls').css('display','none');
		} else {
			this.visnode.find('#controls').css('display','block');
		}
		this.loadimg(0);
		this.visnode.find("#playpos").slider({
			value:0,
			min: 0,
			max: this.imglinks,
			step: 1,
			slide: function(event, ui) {
				vis.loadimg(ui.value);
			}
		});
		this.visnode.find('#controls .slower').fadeTo('fast', this.animationSpeed/1450);
		this.visnode.find('#controls .faster').fadeTo('fast', 1-this.animationSpeed/1450);
	},
	reinit : function () {
		this.imgindex = null;
		this.animateStop();
		this.init(this.visnode.attr('id'));
	},
	addViewer : function (images) {
		if (!images || images.length == 0) { return false; }
		this.imglinks = images.length;
		viewer = $('<img />');
		this.visnode.find('#screen').append(viewer);
		this.viewers[this.viewers.length] = {
			images : images,
			viewer : viewer
		};
		this.reinit();
	},
	clearViewer : function () {
		for (i in this.viewers) {
			this.viewers[i].viewer.remove();
		}
		this.imglinks = 0;
		this.imgindex = null;
		this.viewers = [];
	},
	loadimg : function (index) {
		if (index === null) { return; }
		if (index < 0) { imgindex = 0; }
		if (index >= this.imglinks) { imgindex = this.imglinks-1; }
		if (index == this.imgindex) { return; }
		this.imgindex = index;
		if (this.imglinks > 0 && this.imgindex >= 0 && this.imgindex < this.imglinks) {
			for (viewerIndex in this.viewers) {
				this.viewers[viewerIndex].viewer.attr('src', this.viewers[viewerIndex].images[this.imgindex]);
			}
			this.visnode.find('#playpos').slider('value', this.imgindex);
		}
	},
	animate : function() {
		if (this.imgindex < this.imglinks-1) {
			this.step(1);
		} else {
			if (this.loop) {
				this.animateStart();
			} else {
				this.animateStop();
			}
		}
	},
	animateFaster : function () {
		if (this.animationSpeed > 100) {
			this.animateSpeed(this.animationSpeed-150);
		}
	},
	animateSlower : function () {
		if (this.animationSpeed < 1450) {
			this.animateSpeed(this.animationSpeed+150);
		}
	},
	animateSpeed : function (speed) {
		if (speed >= 100 && speed <= 1450) {
			this.setOption('animationSpeed', speed);
			if (this.controlId) { this.animateStart(); }
			opacity = this.animationSpeed/1450;
			this.visnode.find('#controls .slower').fadeTo('fast', (opacity > .2 ? opacity : .2));
			this.visnode.find('#controls .faster').fadeTo('fast', ((1-opacity) > .2 ? (1-opacity) : .2));
		}
	},
	animateStart : function () {
		if (this.controlId) {
			window.clearInterval(this.controlId);
			this.controlId = null;
		}
		if (this.imgindex >= this.imglinks-1) {
			this.loadimg(0);
		}
		this.controlId = window.setInterval('vis.animate()', this.animationSpeed);
		return;
	},
	animateStop : function () {
		window.clearInterval(this.controlId);
		this.controlId = null;
	},
	setOption : function (option, value) {
		eval('this.'+option+'='+value);
	},
	step : function (interval) {
		if (this.imgindex+interval >= 0 && this.imgindex+interval < this.imglinks) {
			this.stepTo(this.imgindex+interval);
		}
	},
	stepTo : function (index) {
		if (index < 0) {
			index = this.imglinks+index;
		}
		if (index >= 0 && index < this.imglinks) {
			this.loadimg(index);
		}
	}
};

$(document).ready( function () {
	$(window).keydown(
		function (e) {
			if (e.keyCode == '27') {
				e.preventDefault();
				vis.animateStop();
			}
			if (e.keyCode == '32') {
				e.preventDefault();
				if (vis.controlId) {
					vis.animateStop();
				} else {
					vis.animateStart();
				}
			}
			if (e.keyCode == '37') {
				e.preventDefault();
				vis.step(-1);
			}
			if (e.keyCode == '39') {
				e.preventDefault();
				vis.step(1);
			}
		}
	);
});
