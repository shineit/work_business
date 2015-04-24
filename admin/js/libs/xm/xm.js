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
	};
	window.xm = xm;
})($, soundManager);