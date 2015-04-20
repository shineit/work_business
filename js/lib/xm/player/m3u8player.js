(function($, soundManager){
	var util = xm.util;
	var m3u8SupportEnv = util.env.inIOS || util.env.inAndroid || util.env.inMacSafari; //默认支持m3u8
	if(m3u8SupportEnv){
		return;
	}else{
		var name = "mymoviename";
		var src = "http://192.168.20.47/flashls2015.4.7/bin/debug/m3u8player.swf?inline=1";
		var attrs = {
			width: 1,
			height: 1
		};
		var params = {
			quality:"autohigh",
			bgcolor:"#fff",
			align:"middle",
			allowFullScreen:"true",
			allowScriptAccess:"always",
			swliveconnect:"true",
			wmode:"window"
		}
		util.buildFlash(name, src, attrs, params);
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
			console.log("onHLSReady()");
			api = new M3U8API(getFlashMovieObject(instanceId));
			api.setMaxBufferLength(14);
			isReady = true;
    		onHLSReady();
		},
		onComplete: function(instanceId) {
			console.log("onComplete()");
			current.sound.lastPosition = 0;
			//先statechange,再finish
			setTimeout(function(){
				$document.trigger("xmplayer", ["finish", current.sound, current]);
			}, 0)
  		},
  		onError: function(instanceId, code, url, message) {
		    console.log("onError()");
		    console.log(code);
		    console.log(url);
		    console.log(message);
		},
  		onManifest: function(instanceId, duration, loadmetrics) {
			//console.log("onManifest()");
			var position = (current.sound.lastPosition/1000)||0
			api.play(position);
			current.setVolume(current.volume);
			if(!current.isLive){
				current.sound.duration = duration * 1000;
			}
			$document.trigger("xmplayer", ["manifest", current.sound, current]);
		},
		onAudioLevelLoaded: function(instanceId, loadmetrics) {
			//console.log("onAudioLevelLoaded()");
		},
		onLevelLoaded: function(instanceId, loadmetrics) {
			//console.log("onLevelLoaded()");
		},
		onFragmentLoaded: function(instanceId, loadmetrics) {
			//console.log("onFragmentLoaded()");
		},
		onFragmentPlaying: function(instanceId, playmetrics) {
			//console.log("onFragmentPlaying()");
		},
		onPosition: function(instanceId, timemetrics) {
			var duration = timemetrics.duration.toFixed(2);
			var playlist_sliding =  timemetrics.live_sliding_main.toFixed(2);
			var _position = timemetrics.position.toFixed(2);
			var position = (timemetrics.live_sliding_main + timemetrics.position).toFixed(2);
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
			console.log("onPlaybackState()"+newState);
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
			//console.log("onSeekState()");
		},
		onSwitch: function(instanceId, newLevel) {
			//console.log("onSwitch()");
		},
		onAudioTracksListChange: function(instanceId, trackList) {
			//console.log("onAudioTracksListChange()");
		},
		onAudioTrackChange: function(instanceId, trackId) {
			//console.log("onAudioTrackChange()");
		}
	};
	function parsePosition(str){
		var num = 0;
		if(str){
			str = ""+str;
			var arr = str.split(".");
			num = parseInt(arr[0], 10) * 1000 + parseInt(arr[1], 10);
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
		this.isLive = false;
		this.bitrate = 24;

		//动态属性
		this.buffered = false;
		this.isBuffering = false;
		this.duration = 0;
		this.paused = false;
		this.playState = 0;
		this.position = 0;

		this.backBuffer = 0;
		this.buffer = 0;

		this.parse();
	}
	M3U8Sound.prototype.parse = function(){
		var isLive = this.url.indexOf("cache") === -1;
		this.isLive = isLive;
		if(this.isLive){
			this.parseLive();
		}else{
			this.parsePlayback();
		}
	};
	//http://live.xmcdn.com/192.168.3.134/live/75/24.m3u8
	M3U8Sound.prototype.parseLive = function(){
		var arr = this.url.split("/");
		this.radioId = arr[5];
		this.bitrate = arr[6].split(".")[0];
		//this.getProgramDetail();
	};
	//http://live.xmcdn.com/192.168.3.134/cache.m3u8?id=75&bitrate=24&start=15M04D15h09m00s00&end=15M04D15h09m01s00
	M3U8Sound.prototype.parsePlayback = function(){
		var queryString = this.url.split("?")[1];
		var arr = queryString.split("&");
		var params = {};
		for(var i,len = arr.length;i<len;i++){
			var pair = arr[i];
			var param = pair.split("=");
			params[param[0]] = param[1];
		}
		this.radioId = params.id;
		this.bitrate = params.bitrate;
		this.startStr = params.start;
		this.endStr = params.end;
	};
	M3U8Sound.prototype.getProgramDetail = function(){
		var self = this;
		//"http://live.ximalaya.com/live-web/v1/getProgramDetail";
		var data = {"result":{"programId":969,"programScheduleId":5506,"programName":"New Music Express","startTime":"13:00","endTime":"14:58","playType":0,"listenBackBaseUrl":"http://live.xmcdn.com/192.168.3.134/cache.m3u8","announcerList":[],"playBackgroundPic":"http://fdfs.xmcdn.com/group6/M0A/A9/07/wKgDhFUKlSzBZGjVAABtOR0VWUM036_mobile_large.jpg"},"ret":"0000"};
		setTimeout(function(){
			var program = data.result;
			self.program = program;
			var start = util.strToTime(program.startTime);
			var end = util.strToTime(program.endTime);
			end = end>start?end:(end + 24 * 60 * 60 * 1000);
			var duration = end - start;
			self.sound.duration = duration;
			program.localStartTime = util.toLocalTime(program.startTime); 
			program.localEndTime = util.toLocalTime(program.endTime);
			program.start = start;
			program.end = end;
			program.localStart = util.strToTime(program.localStartTime);
			program.localEnd = util.strToTime(program.localEndTime);
			$document.trigger("xmplayer", ["programChange", self.sound, self]);
		},0);
	};
	M3U8Sound.prototype.play = function(options){
		options = options||{};
		if(options.position !== undefined){
			this.sound.lastPosition = options.position;
		}
		if(options.volume !== undefined){
			this.volume = options.volume;
		}
		api.load(this.url);
		if(this.isLive){
			this.getProgramDetail();
		}
		$document.trigger("xmplayer", ["play", this.sound, this]);
	};
	M3U8Sound.prototype.pause = function(){
		api.pause();
	};
	M3U8Sound.prototype.resume = function(){
		api.resume();
	};
	M3U8Sound.prototype.stop = function(){
		//先statechange,再stop
		api.stop();
		$document.trigger("xmplayer", ["stop", this.sound, this]);
	};
	M3U8Sound.prototype.setPosition = function(position){
		api.seek(position/1000);
	};
	M3U8Sound.prototype.unload = function(){
	};
	M3U8Sound.prototype.setVolume = function(volume){
		api.volume(volume);
	};

	$document.on("xmplayer", function(event, type, sound, smSound){
		if(type === "soundChange"){
        	current = smSound;
    	}
    });  
})($, soundManager)