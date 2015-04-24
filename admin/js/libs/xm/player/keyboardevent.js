(function($, xm){
	var player = xm.player;
	/*
	 * 键盘事件
	 */
	$("body").keydown(function(event) {
		var tagName = event.target.tagName;
		if (tagName == "INPUT" || tagName == "TEXTAREA") {
			return;
		}
		// 空格
		if (event.keyCode === 32) {
			player.switchPlayAndPause();
			return false;
		}
		// 右
		if (event.keyCode === 39) {
			player.seekPlus();
			return false;
		}
		// 左
		if (event.keyCode === 37) {
			player.seekMinus();
			return false;
		}
		// 下
		if (event.keyCode === 40) {
			player.next();
			return false;
		}
		// 上
		if (event.keyCode === 38) {
			player.prev();
			return false;
		}
	});
})($, xm);