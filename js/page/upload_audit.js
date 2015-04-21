(function ($) {
	$(function () {
		//展开及收起控制 S
		$(".more").on('click','.more_down',function() {
			$(this).addClass("hidden").parent(".more").find(".more_up").removeClass("hidden").end().prevAll(".intro:not(.hidden)").addClass("open");
		});

		$(".more").on('click','.more_up',function() {
			$(this).addClass("hidden").parent(".more").find(".more_down").removeClass("hidden").end().prevAll(".intro:not(.hidden)").removeClass("open");
		});
		//展开及收起控制 E
		
		//tab切换控制及对应内容显示  下载拼接 S
		$(".tab-inner ").on('click','.item',function() { //tab切换  
			var tabId = $(this).attr("showId");
			var downId = $(this).attr("downId");
			var hadMore = $(this).attr("data-more");
			$(this).addClass("on").siblings().removeClass("on");

			$("#"+tabId).removeClass("hidden").siblings("[id*='tab_']").addClass("hidden");

			var $textMore = $("#"+tabId).nextAll(".more");

			if(hadMore === 'true'){ //是否隐藏更多
				$textMore.removeClass('hidden');
			}else if(hadMore === 'false'){
				$textMore.addClass('hidden');
			}
			if($("#"+tabId).is(".open")){
				$textMore.find(".more_down").addClass("hidden").end().find(".more_up").removeClass("hidden");
			}else{
				$textMore.find(".more_down").removeClass("hidden").end().find(".more_up").addClass("hidden");
			}

			$("#downId").attr('href',$("#downId").attr("data-href")+downId);
		});
		//tab切换控制及对应内容显示  下载拼接 E

		$("#xmUploadBtn").xmupload();

		$("#xmUpload2Btn").xmupload();


		$("#submitBtn").on('click',function() {
			var $this  = $(this);
			$this.text("提交中...").addClass('disabled');

			var timer = setInterval(function() {
				if($.xmupload.isComplateAll()){
					clearInterval(timer);
					 $("#form")[0].submit();
				}
				
			},1000);
		});
	});
})(jQuery);