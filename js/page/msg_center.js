(function ($) {
	//展开及收起控制 S
		$(".more").on('click','.more_down',function() {
			$(this).addClass("hidden").parent(".more").find(".more_up").removeClass("hidden").end().prevAll(".intro:not(.hidden)").addClass("open");
		});

		$(".more").on('click','.more_up',function() {
			$(this).addClass("hidden").parent(".more").find(".more_down").removeClass("hidden").end().prevAll(".intro:not(.hidden)").removeClass("open");
		});
		//展开及收起控制 E
	
})(jQuery);