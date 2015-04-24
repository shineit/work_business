var flashlsAPI = function(flashObject) {

	this.constructor = function(flashObject) {
		this.flashObject = flashObject;
	}
	this.constructor(flashObject);

	this.load = function(url) {
    this.flashObject.playerLoad(url);
	}

	this.play = function(offset) {
    this.flashObject.playerPlay(offset);
	}

	this.pause = function() {
    this.flashObject.playerPause();
	}

	this.resume = function() {
    this.flashObject.playerResume();
	}

	this.seek = function(offset) {
    this.flashObject.playerSeek(offset);
	}

	this.stop = function() {
    this.flashObject.playerStop();
	}

	this.volume = function(volume) {
    this.flashObject.playerVolume(volume);
	}

	this.setLevel = function(level) {
    this.flashObject.playerSetLevel(level);
	}

	this.smoothSetLevel = function(level) {
    this.flashObject.playerSmoothSetLevel(level);
	}

	this.setMaxBufferLength = function(len) {
    this.flashObject.playerSetmaxBufferLength(len);
	}

	this.getDuration = function() {
		return this.flashObject.getDuration();
	}

	this.getbufferLength = function() {
		return this.flashObject.getbufferLength();
	}

	this.getLowBufferLength = function() {
		return this.flashObject.getLowBufferLength();
	}

	this.getMinBufferLength = function() {
		return this.flashObject.getMinBufferLength();
	}

	this.getMaxBufferLength = function() {
		return this.flashObject.getMaxBufferLength();
	}

	this.getAudioTrackList = function() {
		return this.flashObject.getAudioTrackList();
	}

	this.setAudioTrack = function(trackId) {
    	this.flashObject.playerSetAudioTrack(trackId);
	}

	this.playerSetLogDebug = function(state) {
    	this.flashObject.playerSetLogDebug(state);
	}

	this.getLogDebug = function() {
		return this.flashObject.getLogDebug();
	}

	this.playerSetLogDebug2 = function(state) {
    	this.flashObject.playerSetLogDebug2(state);
	}

	this.getLogDebug2 = function() {
		return this.flashObject.getLogDebug2();
	}

	this.playerSetUseHardwareVideoDecoder = function(state) {
    	this.flashObject.playerSetUseHardwareVideoDecoder(state);
	}

	this.getUseHardwareVideoDecoder = function() {
		return this.flashObject.getUseHardwareVideoDecoder();
	}

	this.playerSetflushLiveURLCache = function(state) {
    	this.flashObject.playerSetflushLiveURLCache(state);
	}

	this.getflushLiveURLCache = function() {
		return this.flashObject.getflushLiveURLCache();
	}

	this.playerSetJSURLStream = function(state) {
    	this.flashObject.playerSetJSURLStream(state);
	}

	this.getJSURLStream = function() {
		return this.flashObject.getJSURLStream();
	}

	this.playerCapLeveltoStage = function(state) {
    	this.flashObject.playerCapLeveltoStage(state);
	}

	this.getCapLeveltoStage = function() {
		return this.flashObject.getCapLeveltoStage();
	}
}

