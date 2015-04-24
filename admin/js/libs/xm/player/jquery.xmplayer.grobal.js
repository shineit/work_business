(function($, xm){
    var player = xm.player;
    var $document = $(document);
    var seleters = {
        prevBtn : ".player_prevBtn",
        nextBtn : ".player_nextBtn",
        modeBtn : ".player_modeBtn",
        title : ".player_title"
    };
    var PlayMode = {
        ORDER: 0,   //顺序
        LOOP: 1,    //循环
        RANDOM: 2   //随机
    };
    /*
    * 获取字符串的长度，单位字节
    */
    function gblen(str) {
        return $.trim(str).replace(/[^\x00-\xff]/ig, 'xx').length;
    }
    /*
    * 截取指定长度的字符串 str {String} 原始字符串 len {Number} 长度 s {String} 超过指定长度后加后缀。默认为""。可以加"..."
    */
    function cutString(str, len, s) {
        var newstr = '';
        var len2 = 0;
        for (var i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94) {
                len2 += 2;
            } else {
                len2++;
            }
        }
        if (len2 <= len) {
            return str;
        }
        len2 = 0;
        s = s || '';
        len = (len > this.gblen(s)) ? len - this.gblen(s) : len;
        for (var i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94) {
                len2 += 2;
            } else {
                len2++;
            }
            if (len2 > len) {
                newstr += s;
                break;
            }
            newstr += str.charAt(i);
        }
        return newstr;
    }
    function GrobalPlayer($el){
        this.$el = $el;
        this.$prevBtn = $el.find(seleters.prevBtn);
        this.$nextBtn = $el.find(seleters.nextBtn);
        this.$modeBtn = $el.find(seleters.modeBtn);
        this.$title = $el.find(seleters.title);
    }
    GrobalPlayer.prototype.bindEvents =  function(){
        var _this = this;
        $document.on("xmplayer", function(event, type){
            if(type === "playModeChange"){
                _this.renderPlayModeBtn();
                return;
            }
            if(type === "soundChange" || type === "playlistHead" || type === "playlistEnd"){
                var prevable = true;
                var nextable = true;
                if(type === "playlistEnd"){
                    nextable = false;
                }
                if(type === "playlistHead"){
                    prevable = false;
                }
                if(type === "soundChange"){
                    var sound = arguments[2];
                    var soundId = sound.id;
                    var index = player.getIndex(soundId);
                    var playlist = player.getPlaylist();
                    if(index <= 0){
                        prevable = false;
                    }
                    if(index === playlist.length - 1){
                        nextable = false;
                    }
                    _this.render();
                }
                _this.renderBtns(prevable, nextable);
                return;
            }
        });
    };
    GrobalPlayer.prototype.bindDomEvents = function(){
        var $el = this.$el;
        $el.on("click", seleters.modeBtn, function(e){
            var $modeBtn = $(this);
            var playMode = PlayMode.ORDER;
            if($modeBtn.is(".orderplayBtn")){
                playMode = PlayMode.LOOP;
            }else if($modeBtn.is(".loopplayBtn")){
                playMode = PlayMode.RANDOM;
            }else if($modeBtn.is(".randomplayBtn")){
                playMode = PlayMode.ORDER;
            }
            player.setPlayMode(playMode);
        });
        $el.on("click", seleters.prevBtn + ":not(.disabled)", function(e){
            player.prev();
        });
        $el.on("click", seleters.nextBtn + ":not(.disabled)", function(e){
            player.next();
        });
    };
    GrobalPlayer.prototype.render = function(){
        var sound = player.getSound();
        var $el = this.$el;
        var $title = this.$title;
        var title = $("<span>").html(sound.title).text();
        var cutedTitle = cutString(title, 30);
        $el.attr("sound_id", sound.id);
        $title.html(cutedTitle).attr("href", "/sound/" + sound.id + "/").attr("title", title);
    };
    GrobalPlayer.prototype.renderBtns = function(prevable, nextable){
        var $prevBtn = this.$prevBtn;
        var $nextBtn = this.$nextBtn;
        if (prevable) {
            $prevBtn.removeClass("disabled").attr("title", "上一首");
        } else {
            $prevBtn.addClass("disabled").attr("title", "");
        }
        if (nextable) {
            $nextBtn.removeClass("disabled").attr("title", "下一首");
        } else {
            $nextBtn.addClass("disabled").attr("title", "");
        }
    };
    GrobalPlayer.prototype.renderPlayModeBtn = function(){
        var $modeBtn = this.$modeBtn;
        var playMode = player.getPlayMode();
        var className = "";
        $modeBtn.removeClass("loopplayBtn").removeClass("randomplayBtn").removeClass("orderplayBtn");
        if(playMode === PlayMode.ORDER){
            className = "orderplayBtn";
        }else if(playMode === PlayMode.LOOP){
            className = "loopplayBtn";
        }else if(playMode === PlayMode.RANDOM){
            className = "randomplayBtn";
        }
        $modeBtn.addClass(className);
    };
    $.fn.xmGrobalPlayer = function (options) {
        this.each(function(){
            var $el = $(this);
            var $modeBtn = $el.find(seleters.modeBtn);
            if ($el.data("is-xmGrobalPlayer-binded"))
                return;
            $el.data("is-xmGrobalPlayer-binded", true);
            var grobalPlayer = new GrobalPlayer($el);
            grobalPlayer.bindEvents();
            grobalPlayer.bindDomEvents();
            grobalPlayer.renderPlayModeBtn();
        });
    };
    var setup = player.setup;
    player.setup = function(options){
        options = options||{};
        seleters = $.extend(seleters, options.seleters);
        setup(options);
    }
})($, xm);