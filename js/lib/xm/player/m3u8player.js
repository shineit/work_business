(function($, soundManager){
	var support = /Android|Mac OS/i; //已经支持m3u8的端
	var isSupport = support.test(navigator.userAgent);
	if(isSupport){
		return;
	}

	var api;									//m3u8Player的api
	var current = null;							//缓存当前M3U8Sound
	var sounds = {};							//缓存M3U8Sound
	var $document = $(document);

	//覆写soundManager方法
	var setup  = soundManager.setup;
	var getSoundById = soundManager.getSoundById;
	var createSound = soundManager.createSound;
	var onHLSReady = function(){};
	var isReady = false;
	soundManager.setup = function(options){
		if(isReady){
			setup(options);
		}else{
			onHLSReady = function(){
				setup(options);
			};
		}
	};
	soundManager.getSoundById = function(soundId){
		return sounds[soundId]||getSoundById(soundId);
	}
	soundManager.createSound = function(sound){
		if(isM3U8(sound.url)){
			sound.isM3U8 = true;
			var s = new M3U8Sound(sound);
			sounds[sound.id] = s;
			return s;
		}else{
			return createSound(sound);
		}
	};
	function isM3U8(url){
		return /\.m3u8/i.test(url);
	}

	//api
	var M3U8API = function(flashObject) {
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

	window.flashlsEvents = {
		onHLSReady: function(instanceId) {
			console.log("1111 onHLSReady()");
			api = new M3U8API(getFlashMovieObject(instanceId));
			api.setMaxBufferLength(14);
			isReady = true;
    		onHLSReady();
		},
		onComplete: function(instanceId) {
			console.log("1111 onComplete()");
			current.sound.lastPosition = 0;
			//先statechange,再finish
			setTimeout(function(){
				$document.trigger("xmplayer", ["finish", current.sound, current]);
			}, 0)
  		},
  		onError: function(instanceId, code, url, message) {
		    //console.log("1111 onError()");
		},
  		onManifest: function(instanceId, duration, loadmetrics) {
			//console.log("1111 onManifest()");
			var position = (current.sound.lastPosition/1000)||0
			api.play(position);
			current.setVolume(current.volume);
			current.sound.duration = duration * 1000;
			$document.trigger("xmplayer", ["manifest", current.sound, current]);
		},
		onAudioLevelLoaded: function(instanceId, loadmetrics) {
			//console.log("1111 onAudioLevelLoaded()");
		},
		onLevelLoaded: function(instanceId, loadmetrics) {
			//console.log("1111 onLevelLoaded()");
		},
		onFragmentLoaded: function(instanceId, loadmetrics) {
			//console.log("1111 onFragmentLoaded()");
		},
		onFragmentPlaying: function(instanceId, playmetrics) {
			//console.log("1111 onFragmentPlaying()");
		},
		onPosition: function(instanceId, timemetrics) {
			var duration = timemetrics.duration.toFixed(2);
			var playlist_sliding =  timemetrics.live_sliding_main.toFixed(2);
			var _position = timemetrics.position.toFixed(2);
			var position = playlist_sliding + _position;
			var backBuffer = timemetrics.backbuffer.toFixed(2);
			var buffer = timemetrics.buffer.toFixed(2);
			current.position = parsePosition(position);
			current.duration = Math.round(duration);
			current.backBuffer = backBuffer;
			current.buffer = buffer;

			if(current.stateStr === "PLAYING_BUFFERING" || current.stateStr === "PLAYING"){
				$document.trigger("xmplayer", ["whileplaying", current.sound, current]);
			}
			if(current.stateStr === "PLAYING_BUFFERING" || current.stateStr === "PAUSED_BUFFERING"){
				$document.trigger("xmplayer", ["whileloading", current.sound, current]);
			}
		},
		onPlaybackState: function(instanceId, newState) {
			console.log("1111 onPlaybackState()"+newState);
			var state = 0;
			if(newState === "IDLE"){
				state = 0;
			}
			if(newState === "PAUSED_BUFFERING"){
				state = 1;
			}
			if(newState === "PLAYING_BUFFERING" || newState === "PLAYING"){
				state = 2;
			}
			if(newState === "PAUSED"){
				state = 3;
			}
			//防止出现多个state=2状态
			if(state !== current.state){
				current.state = state;
				current.stateStr = newState;
				$document.trigger("xmplayer", ["statechange", current.sound, current]);
			}
		},
		onSeekState: function(instanceId, newState) {
			//console.log("1111 onSeekState()");
		},
		onSwitch: function(instanceId, newLevel) {
			//console.log("1111 onSwitch()");
		},
		onAudioTracksListChange: function(instanceId, trackList) {
			//console.log("1111 onAudioTracksListChange()");
		},
		onAudioTrackChange: function(instanceId, trackId) {
			//console.log("1111 onAudioTrackChange()");
		}
	};
	function parsePosition(str){
		var num = 0;
		if(str){
			var arr = str.split(".");
			num = parseInt(arr[1], 10) * 1000 + parseInt(arr[2], 10);
		}
		return num;
	}
	//获取flash对象
	function getFlashMovieObject(movieName)
	{
		if (window.document[movieName])
		{
			return window.document[movieName];
		}
		if (navigator.appName.indexOf("Microsoft Internet")==-1)
		{
			if (document.embeds && document.embeds[movieName])
			return document.embeds[movieName];
		}
		else // if (navigator.appName.indexOf("Microsoft Internet")!=-1)
		{
			return document.getElementById(movieName);
		}
	}
	//M3U8Sound和SMSound对应，只提供player.js中需要的的接口
	function M3U8Sound(options){
		this.id = options.id;
		this.url = options.url;
		this.volume = options.volume;
		this.state = 0;
		this.stateStr = "IDLE";
		this.type = "hls";

		//动态属性
		this.buffered = false;
		this.isBuffering = false;
		this.duration = 0;
		this.paused = false;
		this.playState = 0;
		this.position = 0;

		this.backBuffer = 0;
		this.buffer = 0;
	}
	M3U8Sound.prototype.play = function(options){
		current = this;
		options = options||{};
		if(options.position !== undefined){
			this.sound.lastPosition = options.position;
		}
		if(options.volume !== undefined){
			this.volume = options.volume;
		}
		api.load(this.url);
		$document.trigger("xmplayer", ["play", current.sound, current]);
	};
	M3U8Sound.prototype.pause = function(){
		api.pause();
	};
	M3U8Sound.prototype.resume = function(){
		current = this;
		api.resume();
	};
	M3U8Sound.prototype.stop = function(){
		if(current){
			//先statechange,再stop
			api.stop();
			$document.trigger("xmplayer", ["stop", current.sound, current]);
		}
	};
	M3U8Sound.prototype.setPosition = function(position){
		api.seek(position/1000);
	};
	M3U8Sound.prototype.unload = function(){
	};
	M3U8Sound.prototype.setVolume = function(volume){
		api.volume(volume);
	};

})($, soundManager)