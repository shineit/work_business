(function($, soundManager){
	var xm = {
		jsonp : {}
	};
	xm.config = {
		STATIC_ROOT:"http://static2.test.ximalaya.com",
		STATIC_PATH:"http://192.168.3.220/pcx",
    	PATH : "http://test.ximalaya.com",
		FDFS_PATH:"http://fdfs.test.ximalaya.com",
		LOGIN_PATH:"http://test.ximalaya.com/passport/login",
		DIRECT_DTRES_ROOT: "http://upload.test.ximalaya.com/dtres",
		UPLOAD_ROOT: "http://upload.test.ximalaya.com/dtres",
		JSONP_PATH: "http://test.ximalaya.com",
		TOKEN_LABEL:'4&_token',
		REMEMBERME_LABEL:'4&_remember_me',
		PLAY_JSONP_PATH: "http://play.test.ximalaya.com",
		LIVE_PATH: "http://live.ximalaya.com",
		M3U8PLAYER_PATH: "http://s1.xmcdn.com/wap/js/xm/m3u8player/20150421.swf?inline=1"
	};
	
	window.xm = xm;
})($, soundManager);