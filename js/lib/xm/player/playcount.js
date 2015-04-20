//如果声音详情里包含no_need_count那么就不需要统计改声音的播放数
(function($, xm){
    var player = xm.player;
    var $document = $(document);
    var playCountUrl = '/tracks/{soundId}/play';
    var isFinal = false;
    var infos = {};
    window.infos = infos;
    function initInfo(soundId){
        infos[soundId] = [];
    }
    function putInfo(soundId, time, state, position){
        var info = getInfo(soundId);
        info.push({
            t: time,
            s: state,
            p: position
        });
    }
    function getInfo(soundId){
        if(!infos[soundId]){
            initInfo(soundId);
        }
        return infos[soundId];
    }
    //发送统计
    function postInfo(smSound){
        var sound = smSound.sound; 
        var soundId = sound.id;
        if(sound.noNeedCount){
            return;
        }
        var duration = getPlayDuration(soundId)||0;
        var position = getOutPosition(soundId)||0;
        var async = !isFinal;
        initInfo(soundId);
        //如果声音详情里包含no_need_count那么就不需要统计改声音的播放数
        if(sound.noNeedCount){
            return;
        }
        var data = {
                played_secs: Math.round(position / 1000),
                duration: Math.round(duration / 1000)
            };
        var url = xm.config.JSONP_PATH + playCountUrl.replace("{soundId}", soundId);
        var img = new Image();
        img.src = url + "?played_secs=" + data.played_secs + "&duration=" + data.duration;
        img = null; 
    }
    //获取播放时长
    function getPlayDuration(soundId){
        var duration = 0;
        var info = getInfo(soundId);
        for(var i=0,len=info.length;i<len;i++){
            var point = info[i];
            var time = point.t;
            var state = point.s;
            if(state === 2){
                var next = info[i+1];
                if(next){
                    duration += next.t - time;
                }
            }
        }
        return duration;
    }
    //获取跳出位置
    function getOutPosition(soundId){
        var position = 0;
        var info = getInfo(soundId);
        var length = info.length;
        if(length){
            position = info[length-1].p;
        }
        return position;
    }

    //刷新、关闭浏览器时处理
    if(window.onpagehide !== undefined){
        //ios
        window.onpagehide = function () {
            unload();
        }
    }else{
        if(window.onbeforeunload !== undefined){
            //chrome,firefox
            window.onbeforeunload = function () {
                unload();
            }       
        }else{
            window.onunload = function () {
                unload();
            }   
        }
    }
    function unload() {
        var smSound = player.getSmSound();
        //如果声音处于播放状态
        if (smSound && smSound.state) {
            isFinal = true;//刷新浏览器时，需要同步处理，否者发不了请求
            player.pauseAndUnload();
        }
    }

    //监听播放器事件
    $document.on("xmplayer", function(event, type, sound, smSound){
        if(type === "whileloading" || type === "whileplaying"){
            return;
        }
        var soundId = sound.id;
        var time = (new Date()).getTime();
        var key = type;
        if(type==="statechange"){
            putInfo(soundId, time, smSound.state, smSound.position);
        }
        if(type === "stop" || type==="finish"){
            postInfo(smSound);
        }
    });

    var setup = player.setup;
    player.setup = function(options){
        options = options||{};
        playCountUrl = options.playCountUrl||playCountUrl;
        setup(options);
    }
})($, xm);