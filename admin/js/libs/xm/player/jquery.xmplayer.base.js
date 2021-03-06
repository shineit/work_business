(function($, xm){
    var player = xm.player;
    var PlayState = player.PlayState;
    var $document = $(document);
    var current = {};
    var seleters = {
        btn : ".btn-player",                    //播放按钮
        progressbar : ".player_progressbar",    //进度条
        commentbar : ".player_commentbar",
        seekbar : ".player_seekbar",            //加载进度条
        playbar : ".player_playbar",            //播放进度条    
        position : ".player_position",          //播放时间点
        wavebox : ".player_wavebox",
        nonius : ".player_nonius",
        noniusTime : ".player_nonius_time",
        noniusCover : ".player_nonius_cover",
        commentbarBtn : ".player_commentbarBtn",  
        playCount: ".player_playCount"          //播放数
    };
    //是否处于播放状态
    function isOnPlaying($el){
        return $el.is(".is-playing")||$el.is(".is-loading");
    }
    //设置播放列表
    function setPlaylist($el){
        var soundId = $el.attr("sound_id");
        var $soundIds = $el.closest("[sound_ids]");
        var playlist = getPlaylist($el);
        var index = player.getIndex(soundId);
        //如果外层有$soundIds，重置播放列表
        if($soundIds.size()){
            player.setPlaylist(playlist);
            $document.trigger("xmplayer", ["setPlaylist",  $soundIds]);
        }else{
            //如果当前声音不在播放列表中，重置播放列表
            if(index === -1){
                player.setPlaylist(playlist);
            }
        }
    }
    //格式化时间
    function getTime(nMSec, toObj) {
        var nSec = Math.floor(nMSec / 1000), min = Math.floor(nSec / 60), hour = Math.floor(min / 60), sec = nSec - (min * 60);
        min = min - (hour * 60);
        return (!toObj ? (hour ? (hour + ":") : "") + ((min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec)) : {
            'min': min,
            'sec': sec,
            'hour': hour
        });
    }
    //当前dom对象
    function cacheCurrent($el){
        current = {
            $el: $el,
            $btn: $el.is(seleters.btn)?$el:$el.find(seleters.btn),
            $progressbar: $el.find(seleters.progressbar),
            $commentbar: $el.find(seleters.commentbar),
            $seekbar: $el.find(seleters.seekbar),
            $playbar: $el.find(seleters.playbar),
            $position: $el.find(seleters.position),
            $wavebox: $el.find(seleters.wavebox),
            $nonius : $el.find(seleters.nonius),
            $noniusTime : $el.find(seleters.noniusTime),
            $noniusCover : $el.find(seleters.noniusCover),
            $commentbarBtn : $el.find(seleters.commentbarBtn),
            $playCount: $el.find(seleters.playCount)
        };
    }
    //刷新播放按钮
    function renderBtn($el, sound, smSound){
        var $btn = current.$btn;
        if($btn.size()){
            if(smSound.state === PlayState.READY){
                $el.addClass("is-ready").removeClass("is-playing is-loading is-paused");
                $btn.attr("title", "播放");
            }else if(smSound.state === PlayState.LOADING){
                $el.addClass("is-loading").removeClass("is-ready is-playing is-paused");
                $btn.attr("title", "加载中");
            }else if(smSound.state === PlayState.PLAYING){
                $el.addClass("is-playing").removeClass("is-ready is-loading is-paused");
                $btn.attr("title", "暂停");
            }else if(smSound.state === PlayState.PAUSED){
                $el.addClass("is-paused").removeClass("is-playing is-loading is-ready");
                $btn.attr("title", "播放");
            }
        }
    }
    //刷新播放进度
    function rendPlaybar($el, sound, smSound) {
        var $playbar = current.$playbar;
        if ($playbar.size()) {
            var p = smSound.position / sound.duration;
            p = p>1?1:p;
            $playbar.css("width", 100 * p + "%");
        }
    }
    //刷新播放位置
    function rendPostion($el, sound, smSound) {
        var $position = current.$position;
        if ($position.size()){
            $position.text(getTime(smSound.position));
        }
    }
    //刷新下载进度条
    function rendSeekbar($el, sound, smSound) {
        var $seekbar = current.$seekbar;
        if ($seekbar.size()) {
            var p = smSound.bytesLoaded / smSound.bytesTotal;
            p = p>1?1:p;
            $seekbar.css("width", 100 * p + "%");
        }
    }
    //刷新播放数
    function rendPlayCount($el, sound, smSound) {
        var $playCount = current.$playCount;
        if($playCount.size()){
            $playCount = $playCount.eq(0);
            var playCount = parseInt($playCount.text(), 10) + 1;
            var text = $playCount.text().replace(/\d*/,playCount);
            $playCount.text(text).attr("title", playCount + "次播放");
            sound.playCount = playCount;
        }
    }
    //获取playlist
    function getPlaylist($el){
        var soundId = $el.attr("sound_id");
        var $soundIds = $el.closest("[sound_ids]");
        var soundIds = [];
        var playlist = [];
        var needSearch = $el.attr("sound_url");
        if($soundIds.size()){
            soundIds = $soundIds.attr("sound_ids").split(",");
        }else{
            playlist.push(getSound($el));
            return playlist;
        }
        for(var i=0,len=soundIds.length;i<len;i++){
            var soundId = soundIds[i];
            if(needSearch){
                var $sound = $soundIds.find("[sound_id="+soundId+"]");
                var sound = getSound($sound);
            }
            playlist.push(sound);
        }
        return playlist;
    }
    //获取sound对象
    function getSound($el){
        var sound = {};
        var soundId = $el.attr("sound_id");                    
        var url = $el.attr("sound_url");
        var duration = $el.attr("sound_duration");
        var noNeedCount = $el.attr("sound_no_need_count");    //是否需要播放计数
        sound.id = soundId;
        if(url){
            sound.url = url;
        }
        if(duration){
            sound.duration = duration * 1000;
        }
        if(noNeedCount&&noNeedCount!="false"){
            sound.noNeedCount = true;
        }
        return sound;
    }
    //监听xmplayer事件
    $document.on("xmplayer", function(event, type, sound, smSound){
        var $el = current.$el;
        if(type === "soundChange"){
            var soundId = sound.id;
            var $soundId = $("[sound_id=" + soundId + "]");
            cacheCurrent($soundId);
            return;
        }
        if(type === "whileloading"){
            rendSeekbar($el, sound, smSound);
            return;
        }
        if(type === "whileplaying"){
            rendPlaybar($el, sound, smSound);
            rendPostion($el, sound, smSound);
            return;
        }
        if(type === "statechange"){
            renderBtn($el, sound, smSound);
        }
        if(type === "play"){
            rendPlayCount($soundId, sound);
        }
        if(type === "finish"){
            rendPlaybar($el, sound, {position:0});
            rendPostion($el, sound, {position:0});
        }
    });  
    $.fn.xmBasePlayer = function (options) {
        this.each(function(){
            var $el = $(this);
            if ($el.data("is-xmBasePlayer-binded"))
                return;
            $el.data("is-xmBasePlayer-binded", true);
            bindEvents($el);
        });
    };
    //为xmPlayer绑定dom事件
    function bindEvents($el){
        //播放，暂停
        var s = $el.is(seleters.btn)?"":(seleters.btn + ":not(.disabled)");
        $el.on("click", s, function(){
            var soundId = $el.attr("sound_id");
            if(isOnPlaying($el)){
                player.pause();
            }else{
                $el.addClass("is-loading").removeClass("is-ready is-playing is-paused");
                $(this).attr("title", "加载中");
                setPlaylist($el);
                player.play(soundId);
            }
        });
        //进度条
        $el.on("click", seleters.progressbar, function(e){
            var soundId = $el.attr("sound_id");
            if (!isOnPlaying($el)){
                setPlaylist($el);
                player.play(soundId);
                return;
            }
            var $progressbar = $el.find(seleters.progressbar);
            var soundId = $el.attr("sound_id");
            var sound = player.getSoundById(soundId);
            var left = $progressbar.offset().left;
            var width = $progressbar.width();
            var percent = (e.clientX - left) / width;
            var duration = sound.duration;
            var position = duration * percent;
            player.seek(position);
        });
    }
    var setup = player.setup;
    player.setup = function(options){
        options = options||{};
        seleters = $.extend(seleters, options.seleters);
        setup(options);
    }
})($, xm);