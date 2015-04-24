(function($, xm){
var player = xm.player;
var $document = $(document);
var seleters = {
    unmuteBtn : ".volumePanel_unmuteBtn",
    muteBtn : ".volumePanel_muteBtn",
    volume: "volumePanel_volume"
};
$.fn.xmPlayerVolume = function (options) {
    this.each(function(){
        var $el = $(this);
        if ($el.data("is-xmPlayerVolume-binded"))
            return;
        $el.data("is-xmPlayerVolume-binded", true);
        new Volume($el);
    });
};
function Volume($el){
	var _this = this;
	this.$el = $el;
	this._$volume = $el.find(".volumePanel_volume");
	this._$panel = $el;
	this._$bar = $el.find(".volumePanel_seekBtn");
	this._$muteBtn = $el.find(".volumePanel_muteBtn");
	this._$volumeBar = $el.find(".volumePanel_volumebar");
	this._barWidth = this._$volumeBar.width();
	this.render();
	this.bindEvents();
	$document.on("xmplayer", function(event, type, volume, inMute){
		if(type === "volumeChange"){
			_this.render();
		}
	});
}

Volume.prototype.render = function(){
	var volume = player.getVolume();
	var inMute = player.isInMute();
	var width = 26 * volume / 100;
	if (inMute) {
		this._$volume.width(0);
		this.$el.addClass("off");
		this._$bar.css({
			"left" : this._barWidth / 2 + "px"
		});
		this._$muteBtn.addClass("volumePanel_unmuteBtn").removeClass("volumePanel_muteBtn").attr("title", "静音");
	} else {
		this._$volume.width(width);
		this.$el.removeClass("off");
		this._$bar.css({
			"left" : width + 3 + "px",
			"top" : "50%"
		});
		this._$muteBtn.addClass("volumePanel_muteBtn").removeClass("volumePanel_unmuteBtn").attr("title", "静音");
	}
	this._$volume.show();
	this._$bar.show();
	$(".volumePanelBox").show();
}
Volume.prototype.bindEvents = function(){
	var _this = this;
	var $el = this.$el;
    $el.on("click", seleters.muteBtn, function(){
    	player.mute();
    });
    $el.on("click", seleters.unmuteBtn, function(){
    	player.unmute();
    });
    $el.on("click", function(e){
		var gap = 13;
		var left = $el.offset().left;
		var width = _this._barWidth;
		var x = e.clientX - left - gap;
		var percent = x / width;
		if(x<0||x>32) return false;
		if (x <= 3) {
			percent = 0;
		}
		if (x >= 29) {
			percent = 1;
		}
		player.setVolume(parseInt(percent * 100));
		_this.render();
    });
}
})($, xm);