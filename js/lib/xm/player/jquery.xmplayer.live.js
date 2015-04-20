(function($, xm){
    var player = xm.player;
    var current = player.currentPlayer;
    var seleters = {
        programName: ".player_programName",
        programStartTime: ".player_position",
        programEndTime: ".player_duration"
    };
    function rendProgram($el, sound, smSound, program){
        current.$programName.text(program.programName);
        current.$programStartTime.text(program.localStartTime);
        current.$programEndTime.text(program.localEndTime);
    }
    //刷新播放进度
    function rendPlaybar($el, sound, smSound, program) {
        var $playbar = current.$playbar;
        if ($playbar.size()) {
            var now = new Date();
            var localNow = (now.getHours() * 60 * 60 + now.getMinutes() * 60) * 1000;
            var p = (localNow - program.localStart) / sound.duration;
            p = p>1?1:p;
            $playbar.css("width", 100 * p + "%");
        }
    }
    //刷新下载进度条
    function rendSeekbar($el, sound, smSound) {
        var $seekbar = current.$seekbar;
        $seekbar.hide();
        if ($seekbar.size()) {
            $seekbar.css("width", 0);
        }
    }
    //当前dom对象
    function cacheCurrent($el){
        $.extend(current, {
            $programName : $el.find(seleters.programName),
            $programStartTime : $el.find(seleters.programStartTime),
            $programEndTime : $el.find(seleters.programEndTime)
        });
    }
    player.onXmPlayer(function(event, type, sound, smSound){
        if(!(smSound && smSound.isLive)){
            return;
        }
        var $el = current.$el;
        if(type === "soundChange"){
            var soundId = sound.id;
            var $el = $("[sound_id=" + soundId + "]");
            cacheCurrent($el);
            return;
        }
        //不需要拖动条
        if(type === "whileloading"){
            rendSeekbar($el);
            return false;
        }
        //根据当前时间点刷新进度条
        if(type === "whileplaying"){
            rendPlaybar($el, sound, smSound, smSound.program);
            return false;
        }
        //刷新节目
        if(type === "programChange"){
            rendProgram($el, sound, smSound, smSound.program);
        }
        //不需要刷新duration
        if(type === "manifest"){
            return false;
        }
    });
    var setup = player.setup;
    player.setup = function(options){
        options = options||{};
        seleters = $.extend(seleters, options.seleters);
        setup(options);
    } 
})($, xm);