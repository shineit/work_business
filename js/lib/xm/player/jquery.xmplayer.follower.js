(function($, xm){
    var player = xm.player;
    var current = {};
    var seleters = {
        duration : ".player_duration",
        title : ".player_title",
        artist : ".player_artist",
        album : ".player_album",
        intro : ".player_intro",
        playCount: ".player_playCount",
        likeCount: ".player_likeCount",
        commentCount: ".player_commentCount",
        forwordCount: ".player_forwordCount"
    };
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
            $duration: $el.find(seleters.duration),
            $title : $el.find(seleters.title),
            $artist : $el.find(seleters.artist),
            $album : $el.find(seleters.album),
            $intro : $el.find(seleters.intro),
            $playCount: $el.find(seleters.playCount),
            $likeCount: $el.find(seleters.likeCount),
            $commentCount: $el.find(seleters.commentCount),
            $forwordCount: $el.find(seleters.forwordCount)
        };
    }
    //刷新播放按钮
    function render($el, sound, smSound){
        if(!current.$el) return;
        renderDuration(sound.duration);
        current.$title.text(sound.title);
        current.$artist.text(sound.artist);
        current.$album.text(sound.album);
        current.$intro.text(sound.intro);
        current.$playCount.text(sound.playCount);
        current.$likeCount.text(sound.likeCount);
        current.$commentCount.text(sound.commentCount);
        current.$forwordCount.text(sound.forwordCount);
        current.$el.attr({
            sound_id : sound.id,
            sound_url : sound.url,
            sound_duration: sound.duration / 1000
        });
    }
    function renderDuration(duration){
        if(!current.$el) return;
        current.$duration.text(getTime(duration));
    }

    //监听xmplayer事件
    player.onXmPlayer(function(event, type, sound, smSound, preSound){
        var $el = current.$el;
        if(type === "beforeSoundChange"){
            render($el, sound, smSound);
            return;
        }
        if(type === "setPlaylist"){
            var $soundIds = arguments[2];
            $el = $soundIds.find(".is-xmfollowerplayer"); 
            if($el.size()){
                cacheCurrent($el);
            }
            return;
        }
    });

    $.fn.xmFollowerPlayer = function (options) {
        this.each(function(){
            var $el = $(this);
            if ($el.data("is-xmFollowerPlayer-binded"))
                return;
            $el.data("is-xmFollowerPlayer-binded", true);
            $el.addClass("is-xmfollowerplayer");
            bindEvents($el);
        });
    };
    //为xmPlayer绑定dom事件
    function bindEvents($el){
        
    }
    var setup = player.setup;
    player.setup = function(options){
        options = options||{};
        seleters = $.extend(seleters, options.seleters);
        setup(options);
    }
    player.currentFollowPlayer = current;
})($, xm);