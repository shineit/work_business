(function($, xm){
    var player = xm.player;
    var seleters = {
        followPlayer : ".follower",
        grobalPlayer: ".grobalPlayer"
    };
    $.fn.xmPlayer = function (options) {
        var _this = this;
        xm.player.onready(function(){
            _this.xmBasePlayer(options);
            _this.each(function(){
                var $el = $(this);
                if($el.is(seleters.followPlayer)){
                    $el.xmFollowerPlayer(options);
                }
                if($el.is(seleters.grobalPlayer)){
                    $el.xmGrobalPlayer(options);
                }
            });
        });
    };
    var setup = player.setup;
    player.setup = function(options){
        options = options||{};
        seleters = $.extend(seleters, options.seleters);
        setup(options);
    }
})($, xm);