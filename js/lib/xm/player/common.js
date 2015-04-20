(function($, xm){
	var ua = navigator.userAgent;

	var inIOS = /(ipad|iphone|ipod)/i.test(ua);
	var inAndroid = /android/i.test(ua);
	var inMac = /mac/i.test(ua);
	var inWebkit = /webkit/i.test(ua);
	var inMacSafari = inMac && /safari/i.test(ua)&&!/chrome/i.test(ua);
	var inFlashLess = inIOS|| inMacSafari;

	//动态插入flash
	function buildFlash (name, src, attrs, params, $el) {
		var val = "";
		var attrsStr = "";
		var paramsStr = "";
		var object = '<object id="' + name + '" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase=""';
		var embed = '<embed name="' + name + '" src="' + src + '"';
		$el = $el||$("body");
		for(var attr in attrs){
			val = attrs[attr];
			attrsStr += ' ' + attr +'="' + val + '"';
		}
		object += attrsStr + ">";
		for(var param in params){
			val = params[param];
			attrsStr += ' ' + param +'="' + val + '"';
			paramsStr += '<param name="' + param + '" value="' + val + '" />';
		}
		attrsStr += ' pluginspage="http://www.macromedia.com/go/getflashplayer"';
		attrsStr += ' type="application/x-shockwave-flash"';
		object += '<param name="movie" value="' + src + '" />';
		embed += attrsStr + '></embed>';
		object += paramsStr + embed + '</object>';

	    $el.append(object);
	}
	//时长转对象,duration毫秒数
    function durationToObj(duration) {
        var nSec = Math.floor(duration / 1000);
        var nMin = Math.floor(nSec / 60);
        var hour = Math.floor(nMin / 60);
        var min = nMin - (hour * 60);
        var sec = nSec - (nMin * 60);
        var msec = duration - (nSec * 1000);
        return {
            hour: hour,
            min: min,
            sec: sec,
            msec : msec
        };
    }
    //时长转字符串,duration毫秒数,"h:mm:ss"
    function durationToStr(duration) {
        var obj = durationToObj(duration);
        var hour = (obj.hour ? (obj.hour + ":") : "");
        var min = (obj.min < 10 ? '0' + obj.min : obj.min);
        var sec = (obj.sec < 10 ? '0' + obj.sec : obj.sec);
        return hour + min + ":" + sec;
    }
    //字符串转时间点,从凌晨到"hh:mm:ss"的毫秒数
    function strToTime(str){
        var arr = str.split(":");
        var hour = parseInt(arr[0]);
        var min = parseInt(arr[1]);
        var sec = parseInt(arr[2]||0);
        var time = (hour * 60 * 60 + min * 60 + sec) * 1000;
        return time;
    }
    //事件点转对象
    function timeToObj(time){
    	var obj = durationToObj(time);
    	obj.hour = obj.hour>24?(obj.hour - 24):obj.hour;
    	return obj;
    }
    //时间点转字符串,"hh:mm"
    function timeToStr(time){
    	var obj = timeToObj(time);
    	var hour = (obj.hour < 10 ? '0' + obj.hour : obj.hour);
    	var min = (obj.min < 10 ? '0' + obj.min : obj.min);
    	return hour + ":" + min;
    }
    //北京时间转当地时间
    function toLocalTime(str){
    	var beijingTime = strToTime(str);	//北京时间
    	var beijingTZ = -480; //北京时差
    	var date = new Date();
    	var localTZ = date.getTimezoneOffset(); //当地时差
    	var offset = (beijingTZ - localTZ) * 60 * 1000; //两地相差的毫秒数
    	var localTime = beijingTime + offset; //当地时间
    	return timeToStr(localTime);
    }
    var env = {
		inIOS: inIOS,
		inAndroid: inAndroid,
		inMac: inMac,
		inWebkit: inWebkit,
		inMacSafari: inMacSafari,
		inFlashLess: inFlashLess	//对flash支持差的环境
	};
	var util = {
		env: env,					
		durationToObj: durationToObj,	//时长转对象
		durationToStr: durationToStr,	//时长转字符串
		strToTime: strToTime,			//字符串转时间点
		timeToObj: timeToObj,			//事件点转对象
		timeToStr: timeToStr,			//时间点转字符串
		toLocalTime: toLocalTime,		//北京时间转当地时间
		buildFlash: buildFlash			//动态插入flash
	};
	xm.util = $.extend(xm.util||{}, util);
})($, xm);