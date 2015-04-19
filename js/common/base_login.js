!(function($) {
    try{
        if( document.domain && document.domain.value){
            document.domain.value = 'ximalaya.com';
        }else{
            document.domain = 'ximalaya.com';
        }
	}catch (e){
        console&&console.log('domain diff');
    }
	var loginUtil = {
		login: function (type, baidu, callback) {

            if (window._hmt && baidu) {
                _hmt.push(['_trackEvent', baidu, 'click']);
            }

            var callback_name = "gLoginCallback";
            var height = 560, width = 760, $win = $(window), winHeight = $win.height(), winWidth = $win.width(), left = (winWidth - width) / 2, top = (winHeight - height) / 2;
            left = left > 0 ? left : 0;
            top = top > 0 ? top : 0;
            var pram = "height=" + height + ",width=" + width + ",left=" + left + ",top=" + top;
            var path = '';  // tudo http://test.ximalaya.com
            window.open(path+'/passport/auth/' + type + '/authorize?customerFunction=' + callback_name, '', pram);

            window[callback_name] = function (data) {
                if (!callback) {
                    window.location.reload();
                } else {
                    callback(data);
                }
                window[callback_name] = null;
            };
        },
        /*
        * 判断是否登录
        */
        isLogin: function () {
            if (!(config && config.CURRENT_USER && config.CURRENT_USER.uid)) {
                return false;
            }
            return true;
        },
        isLogout: function(){
            if(!this.isLogin()) return false;
            if(  config.CURRENT_USER.uid == this.getCurrentUserId()){
                return false;
            }
            return true;
        },
        getCurrentUserId: function(){
            var _token = null;
            if(location.host.indexOf("test")!=-1){
                _token = $.cookie('4&_token'); 
            }else{
                _token = $.cookie('1&_token'); 
            }
            if(_token){
                return _token.split("&")[0];
            }
        }
	};

	window.xm.loginUtil = loginUtil;
})(jQuery);