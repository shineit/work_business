(function($, soundManager, xm){
	var debug = false;
	function log(text){
		if(debug){
			if(console && console.log){
				console.log(text);
			}
		}
	}
	var supportsLocalStorage = (function() {
		return ('localStorage' in window) && window['localStorage'] !== null;
	})();
	//数组乱序
	function shuffle(arr) {
		var a = arr.slice(0);
        for(var j, x, i = a.length; i; j = parseInt(Math.random() * i), x = a[--i], a[i] = a[j], a[j] = x);
        return a;
    }

	//播放模式
	var PlayMode = {
		ORDER: 0,	//顺序
		LOOP: 1,	//循环
		RANDOM: 2	//随机
	};
	var PlayState = {
		READY: 0,	//就绪
		LOADING: 1,	//加载中
		PLAYING: 2,	//播放中
		PAUSED: 3	//暂停
	};
	var smSound = null;					//当前正在播放声音的smSound对象
	var playlist = [];					//当前播放列表
	var order_playlist = [];			//顺序，循环情况下的播放列表
	var playMode = PlayMode.ORDER;		//播放模式
	var sounds = {};					//缓存sounds
	var current = {};					//当前正在播放声音的sound对象
	var querySoundUrl = "/tracks/{soundId}.json";	//声音详情请求地址
	var volume = 100;					//音量
	var inMute = false;					//静音

	//设置播放模式
	function setPlayMode(_playMode){
		if(playMode === _playMode){
			return;
		}
		playMode = _playMode;
		if(playMode === PlayMode.RANDOM){
			order_playlist = playlist;
			var list = shuffle(playlist);
			if(current){
				var soundId = current.id;
				var index = $.inArray(soundId, list);
				var temp = list[0];
				list[0] = soundId;
				list[index] = temp;
				$document.trigger("xmplayer", ["playlistHead",  current]);
			}
			playlist = list;
		}else if(playMode === PlayMode.ORDER){
			playlist = order_playlist;
		}else if(playMode === PlayMode.LOOP){
			playlist = order_playlist;
		}
		$document.trigger("xmplayer", ["playModeChange", playMode]);
	}
	//获取播放模式
	function getPlayMode(){
		return playMode;
	}
	//查询声音在播放列表中的index
	function getIndex(soundId){
		return $.inArray(soundId, playlist);
	}
	//设置播放列表
	function setPlaylist(list){
		playlist = formatToPlaylist(list);
		order_playlist = playlist;
	}
	//增加播放列表
	function appendPlaylist(list){
		list = formatToPlaylist(list);
		setPlaylist(playlist.concat(list));
	}
	//获取播放列表
	function getPlaylist(){
		return playlist;
	}
	//格式化播放列表，并缓存sound对象
	function formatToPlaylist(list){
		var _playlist = [];
		for(var i=0,len= list.length;i<len;i++){
			var item = list[i];
			var isSoundId = !$.isPlainObject(item);
			var soundId = isSoundId?item:item.id;
			var _sound = isSoundId?{id:soundId}:item;
			var sound = sounds[soundId]||{};
			$.extend(sound, _sound);
			sounds[soundId] = sound;
			_playlist.push(soundId);
		}
		return _playlist;
	}
	//选择soundId,如果失败自动选择下一首,选择之前会暂停当前声音的播放，并停止下载。
	function _select(soundId, callback){
		var sound = sounds[soundId];
		if(smSound && smSound.sound.id !== soundId){
			pauseAndUnload();
		}
		if(sound.url){
			callback(null, sound);
		}else{
			if(sound.isDestroyed){
				callback(true);
				return;
			}
			url = querySoundUrl.replace("{soundId}", soundId);
			$.ajax({
				url: url,
				statusCode: {
					404: function() {
						callback(true);
					}
			    },
				success: function(data){
					if(data.ret || data.res === false){
						sound.isDestroyed = true;
						callback(true);
					}else{
						sound.isDestroyed = false;
						sound.url = data.url;
						sound.duration = data.duration * 1000;
						callback(null, sound);
					}
				},
				error: function(XMLHttpRequest, textStatus, errorThrown){
					$document.trigger("xmplayer", ["netWorkError",  XMLHttpRequest, textStatus, errorThrown]);
				}
			});
		}
	}
	function select(soundId, callback){
		callback = callback || function(){};
		_select(soundId, function(err, sound){
			if(err){
				$document.trigger("xmplayer", ["soundUnexist",  sound]);
				callback(err);
			}else{
				current = sound;
				var preSmSound = smSound;
				var preSound = smSound?smSound.sound:null;
				var _smSound = getSmSound();
				if(smSound !== _smSound){
					smSound = _smSound;
					$document.trigger("xmplayer", ["beforeSoundChange", current, smSound, preSound, preSmSound]);
					$document.trigger("xmplayer", ["soundChange", current, smSound, preSound, preSmSound]);
				}
				callback(null, current, smSound);
			}
		});
	}
	//选择soundId的下一首
	function selectNext(soundId, callback){
		var index = getIndex(soundId);
		if (index < playlist.length - 1) {
			var next = playlist[index + 1];
			select(next, function(err){
				if(err){
					selectNext(soundId, callback);
				}else{
					callback(null);
				}
			});
		}else{
			$document.trigger("xmplayer", ["playlistEnd",  current]);
			callback("声音不存在");
		}
	}
	//选择soundId的上一首
	function selectPrev(soundId, callback){
		var index = getIndex(soundId);
		if (index > 0) {
			var prev = playlist[index - 1];
			select(prev, callback);
		}else{
			$document.trigger("xmplayer", ["playlistHead",  current]);
			callback("声音不存在");
		}
	}
	function _play(){
		//如果声音在暂停状态，恢复播放到播放状态
		if(smSound.state === PlayState.PAUSED){
			smSound.resume();
		}else{
			//如果声音已经开始播放，返回
			if(smSound && smSound.state){
				return;
			}
			var position = smSound.sound.lastPosition||0;
			var v = inMute ? 0 : volume;
			smSound.play({
				position: position,
				volume: v
			});
		}
	}
	//播放
	function play(soundId){
		soundId = soundId||playlist[0];
		select(soundId, function(err, sound){
			_play();
		});
	}
	//下一首
	function next(){
		var soundId = current.id;
		if(!soundId){
			return;
		}
		selectNext(soundId, function(err){
			if(err){
				return;
			}
			_play();
		});
	}
	//上一首
	function prev(){
		var soundId = current.id;
		if(!soundId){
			return;
		}
		selectPrev(soundId, function(err, sound){
			if(err){
				return;
			}
			_play();
		});
	}
	//暂停
	function pause(){
		if(!smSound){
			return;
		}
		smSound.pause();
	}
	//如果正在播放则暂停，如果暂停则播放
	function switchPlayAndPause(){
		if(!smSound){
			return;
		}
		if(smSound.state === PlayState.READY || smSound.state === PlayState.PAUSED){
			smSound.play();
		}else{
			smSound.pause();
		}
	}
	//快进
	function seek(position){
		smSound.setPosition(position);
	}
	//向前快进
	function seekPlus(options) {
		if (!smSound)
			return;
		options = $.extend({
			dif : 1000
		}, options);
		var position = smSound.position + options.dif;
		seek(position);
	}
	//向后回退
	function seekMinus(options) {
		options = $.extend({
			dif : -1000
		}, options);
		seekPlus(options);
	}
	//如果当前声音未停止播放，停止播放当前声音，并停止下载
	function pauseAndUnload(){
		if(smSound && smSound.state){
			keepPosition();
			smSound.stop();
			smSound.unload();
		}
	}
	//记录播放位置，恢复播放时需要使用
	function keepPosition(backDuration){
		var lastPosition = smSound.position - (backDuration||0);
		lastPosition = lastPosition>0?lastPosition:0;
		smSound.sound.lastPosition = lastPosition;
	}
	//获取当前的smSound对象
	function getSmSound(){
		var sound = current;
		var smSound = soundManager.getSoundById(sound.id);
		if(!smSound){
			smSound = soundManager.createSound(sound);
			smSound.sound = sound;
		}
		return smSound;
	}
	//获取当前的Sound对象
	function getSound(){
		return current;
	}
	//获取音量
	function getVolume(){
		if (supportsLocalStorage) {
			volume = parseInt(localStorage["xmplayer_volume"], 10) || volume;
		}
		return volume;
	}
	//设置音量
	function setVolume(v){
		if(v == volume){
			return;
		}
		volume = v;
		_setVolume(v);
	}
	function _setVolume(v){
		$document.trigger("xmplayer", ["volumeChange", volume, inMute]);
		if(supportsLocalStorage){
			localStorage["xmplayer_volume"] = v;
		}
		if (smSound)
			smSound.setVolume(v);
	}
	//静音
	function mute(){
		inMute = true;
		_setVolume(0)
	}
	//恢复音量
	function unmute(){
		inMute = false;
		_setVolume(getVolume());
	}
	//是否在静音状态
	function isInMute(){
		return inMute;
	}
	

	var $document = $(document);
	//声音默认参数
	var defaultOptions = {
		autoLoad: false,        // enable automatic loading (otherwise .load() will call with .play())
		autoPlay: false,        // enable playing of file ASAP (much faster if "stream" is true)
		from: null,             // position to start playback within a sound (msec), see demo
		loops: 1,               // number of times to play the sound. Related: looping (API demo)
		multiShot: false,        // let sounds "restart" or "chorus" when played multiple times..
		multiShotEvents: false, // allow events (onfinish()) to fire for each shot, if supported.
		onid3: null,            // callback function for "ID3 data is added/available"
		onload: function(success){
			if(!success){
				this._onloaderror = true;
				keepPosition(5000);
				this.pause();
				$document.trigger("xmplayer", ["loadError", this.sound, this]);
				this.destruct();
			}
		},           // callback function for "load finished"
		onstop: function(){
			changeState(this);
			$document.trigger("xmplayer", ["stop", this.sound, this]);
		},           // callback for "user stop"
		onfinish: function(){
			this.sound.lastPosition = 0;
			changeState(this);
			$document.trigger("xmplayer", ["finish", this.sound, this]);
		},         // callback function for "sound finished playing"
		onpause: function(){
			changeState(this);
			$document.trigger("xmplayer", ["pause", this.sound, this]);
		},          // callback for "pause"
		onplay: function(){
			changeState(this);
			$document.trigger("xmplayer", ["play", this.sound, this]);
		},           // callback for "play" start
		onresume: function(){
			changeState(this);
			$document.trigger("xmplayer", ["resume", this.sound, this]);
		},         				// callback for "resume" (pause toggle)
		position: null,         // offset (milliseconds) to seek to within downloaded sound.
		pan: 0,                 // "pan" settings, left-to-right, -100 to 100
		stream: true,           // allows playing before entire file has loaded (recommended)
		to: null,               // position to end playback within a sound (msec), see demo
		type: null,             // MIME-like hint for canPlay() tests, eg. 'audio/mp3'
		usePolicyFile: false,   // enable crossdomain.xml request for remote domains (for ID3/waveform access)
		volume: 100,            // self-explanatory. 0-100, the latter being the max.
		whileloading: function(){
			$document.trigger("xmplayer", ["whileloading", this.sound, this]);
		},     // callback function for updating progress (X of Y bytes received)
		whileplaying: function(){
			$document.trigger("xmplayer", ["whileplaying", this.sound, this]);
		}
	};
	$document.on("xmplayer", function(event, type, sound, smSound){
        if(type === "finish"){
            if(playMode === PlayMode.LOOP){
				smSound.play();
			}else{
				next();
			}
        }
    });  
	//更新声音播放状态
	function changeState(smSound){
		var state = PlayState.READY;
		//停止状态、初始状态
	    if(smSound.playState === 0){
            state = PlayState.READY;
        }else{
            //暂停状态
            if(smSound.paused){
                state = PlayState.PAUSED;
            }else{
                //缓存状态
                if(smSound.isBuffering){
                    state = PlayState.LOADING;
                }else{
                    //播放状态
                    state = PlayState.PLAYING;
                }
            }
        }
        if(state !== smSound.state){
        	smSound.state = state;
        	$document.trigger("xmplayer", ["statechange", smSound.sound, smSound]);
        }
	}
	//声音参数在flash下扩展部分
	var flash9Options = {
		onbufferchange: function(){
			if(this._onloaderror) return;
			changeState(this);
			$document.trigger("xmplayer", ["onbufferchange", this.sound, this]);
		}
	};
	//一些浏览器不能利用flash缓存
	function isPit(){
		var ug = navigator.userAgent;
		var pits = /2345|theworld/;
		if(ug.indexOf("MSIE")<0){
			return false;
		}
		return pits.test(ug);
	}
	//设置
	function setup(options){
		querySoundUrl = options.querySoundUrl||querySoundUrl;
		options = $.extend({
            url: xm.config.STATIC_PATH + "/xm/soundManager2/20130512/swf/",
            flashVersion: 9,
            preferFlash: true,
            debugMode: false,
            flashPollingInterval:500,
            html5PollingInterval:500,
            flashLoadTimeout:20000,
            useHighPerformance:true,
            noSWFCache: isPit(),
            defaultOptions: defaultOptions,
            flash9Options: flash9Options
        }, options);
        soundManager.setup(options);
	}
	//获取smSound对象
	function getSmSoundById(id){
		return soundManager.getSoundById(id);
	}
	//获取sound对象
	function getSoundById(id){
		return sounds[id];
	}
	//xmplayer初始化完成
	function onready(callback){
		soundManager.onready(callback);
	}
	xm.player = {
		PlayMode: PlayMode,						//常量，播放模式
		PlayState: PlayState,					//常量，播放状态
		play: play,								//播放	
		pause: pause,							//暂停
		prev: prev,								//上一首
		next: next,								//下一首
		select: select,							//选择
		seek: seek,								//快进
		seekPlus: seekPlus,						//向前快进
		seekMinus: seekMinus,					//向后回退
		pauseAndUnload: pauseAndUnload, 		//暂停，并停止加载声音
		switchPlayAndPause: switchPlayAndPause,	//如果当前声音未停止播放，停止播放当前声音，并停止下载
		getIndex: getIndex,						//查询声音在播放列表中的index
		appendPlaylist: appendPlaylist, 		//增加播放列表
		getPlaylist: getPlaylist,				//获取播放列表
		setPlaylist: setPlaylist,				//设置播放列表
		getPlayMode: getPlayMode,				//获取播放模式
		setPlayMode: setPlayMode,				//设置播放模式
		getSound: getSound,						//获取当前的Sound对象
		getSmSound: getSmSound,					//获取当前的smSound对象
		getSmSoundById: getSmSoundById,			//获取smSound对象
		getSoundById: getSoundById, 			//获取sound对象
		getVolume: getVolume,					//获取音量
		setVolume: setVolume,					//设置音量
		mute: mute,								//静音
		unmute: unmute,							//恢复音量
		isInMute: isInMute,						//是否在静音状态
		setup: setup, 							//设置
		onready: onready						//xmplayer初始化完成
	};
})($, soundManager, xm);





