/**
 * 任务详情页 
 * 
 * 
 */
!(function($) {
	$(function() {

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
			$(this).addClass("on").siblings().removeClass("on");

			$("#"+tabId).removeClass("hidden").siblings("[id*='tab_']").addClass("hidden");

			var $textMore = $("#"+tabId).nextAll(".more");
			console.log($("#"+tabId).is(".open"));
			if($("#"+tabId).is(".open")){
				$textMore.find(".more_down").addClass("hidden").end().find(".more_up").removeClass("hidden");
			}else{
				$textMore.find(".more_down").removeClass("hidden").end().find(".more_up").addClass("hidden");
			}

			$("#downId").attr('href',$("#downId").attr("data-href")+downId);
		});
		//tab切换控制及对应内容显示  下载拼接 E

		//初始化二维码分享 S
		$(".btn-share").each(function() {
			var value = $(this).attr("data-code");
			if(!value) return ; 
			$(this).find(".code").qrcode({
				width:100,
				height:100,
				foreground:'#000000',
				text: value
			});
		});
		//初始化二维码分享 E
		

		$("#mainBtn").on('click',function() {
			var href = $(this).attr('data-href');
			if(!$(this).hasClass('disabled')){
				checkLogin(function() {window.location.href = href;});
			}
		});

		$("#mainBtnAgree").on('click',function() {  //接收邀约
			var taskId = $(this).attr("data-taskId");
			$.ajax({
				url : '/task/'+taskId+'/offer/confirm',
				dataType:'json',
				success : function(dataInfo) {
					protocolPopup(dataInfo.data);
				}
			});
		});

		$("#refuseBtn").on('click',function() {
			var taskId = $(this).attr("data-taskId");
			refusePopup(taskId);
		});

		$("#deleteSample").on('click',function() {
			var url =$(this).attr('data-url');
			deleteSample(url);
		});

		xm.player.setup();
    	$("[sound_id]").xmPlayer();
   	});

	var dialog = window.xm.plugin;

	function checkLogin(callback) {
		if(xm.loginUtil.isLogin()){
			callback();
		}else{
			window.xm.login_box.open(function() {
				callback();
			});
		}
	};
	
	//协议弹窗
	function protocolPopup(dataInfo) {
		var content = '<div class="hd">'+
				'<a class="btn btn-close fr"><i class="icon-4 icon-cha1"></i></a>'+
				'<h2 class="tit">签约</h2>'+
				'</div>'+
				'<div class="bd">'+
					'<h3 class="title mgt-25 tc c04">恭喜您！获得了本任务的创作邀请！</h3>'+
					'<div class="mgtb-20">'+
						'<p>我们诚挚的邀请您参与《${workName}》的演播配音工作。相关合作内容如下：</p>'+
						'<ul>'+
							'<li>'+'· 作品字数：${workTotalCount}字'+'</li>'+
							'<li>'+'· 预计时长：${expectedTotalTimeLength}小时'+'</li>'+
							'<li>'+'· 授权方式：${distributionType}'+'</li>'+
							'<li>'+'· 收益方式：${paymentOptionId}'+'</li>'+
							'<li>'+'· 更新频率：${updateFrequency}'+'</li>'+
							'<li>'+'· 章节时常：${expectedSectionTimeLength} '+'</li>'+
							'<li>'+'<span class="fl">· 作品期望完成时间：</span>'+
								'<p class="ovf c04">'+
									'第一章节 ${theFirstSectionFinishedTime} <br> '+
									'整本完成 ${allSectionsFinishedTime} '+
								'</p>'+
							'</li>'+
						'</ul>${protocolText}'+
						'<p class="fz-12 c02">'+
					        '<label class="xm-checkbox " id="protocolCheckbox">'+
					            '<input type="checkbox" id="agree" name="agree" >我已阅读并同意《XXX XXX》条款'+
					        '</label>'+
						'</p>'+
						'<p class="fz-12 mgtb-10">'+
			          		'邀请有效期还剩：<span class="c04">${surplusTime}</span>'+
						'</p>'+
						'<p class="tc">'+
							'<a class="btn btn-primary disabled btn-mid mgtb-10">同意协议并接受邀约</a><br>'+
							'<a class="a-unl a">取消</a>'+
						'</p>'+
					'</div>'+
				'</div>';
		// $.get(staticPath +'/js/common/protocol.txt',function(data) {
				
		// 	});
		data = '<div class="pre">'+protocol+'</div>';
		var task = dataInfo.taskViewDto , distributionType , paymentOptionId;
		distributionType = task.distributionType == 1 ? "独家" : "非独家";
		paymentOptionId = task.paymentOptionId == 1 ? "分成 "+task.royaltyShareRatio*100 +"%"  
			: (task.paymentOptionId == 2 ? "提成 ￥"+task.prePayAmount 
				: " 分成+提成 "+(task.royaltyShareRatio*100 +"% + ￥" +task.prePayAmount) );
		content = content.replace(/\$\{workName\}/g, task.workName);
		content = content.replace(/\$\{workTotalCount\}/g, task.workTotalCount);
		content = content.replace(/\$\{expectedTotalTimeLength\}/g, task.expectedTotalTimeLength);
		content = content.replace(/\$\{distributionType\}/g, distributionType);
		content = content.replace(/\$\{paymentOptionId\}/g, paymentOptionId);
		content = content.replace(/\$\{updateFrequency\}/g, task.updateFrequency);
		content = content.replace(/\$\{expectedSectionTimeLength\}/g, task.expectedSectionTimeLength);
		content = content.replace(/\$\{theFirstSectionFinishedTime\}/g, formatDate(new Date(task.theFirstSectionFinishedTime),'yyyy-MM-dd'));
		content = content.replace(/\$\{allSectionsFinishedTime\}/g, formatDate(new Date(task.allSectionsFinishedTime),'yyyy-MM-dd'));
		content = content.replace(/\$\{surplusTime\}/g, surplusTime(dataInfo.confirmEndTime));
		content = content.replace(/\$\{protocolText\}/g, data);
		openPopup(content);

		function openPopup(content) {
			var op = {
	            content: content,
	            overlayer : {
	                addClass : 'masker'
	            },
	            template: {
	                dialog_mask : '<div class="masker"></div>',
	                dialog_container: '<div class="popup pop-default pop-sign" dialog-role="container"></div>',
	                dialog_body: '<div class="" dialog-role="body"></div>'
	            }
	        };
	        
	        var popup = new dialog.Dialog(op);
	        popup.open();
	        var el = popup.getEl();

	        el.find("#protocolCheckbox").change(function() {//复选框 
	        	var agree = $('#agree').is(":checked");
	        	if(agree){
	        		$(this).addClass('xm-is-checked');
	        		el.find('.btn-primary').removeClass("disabled");
	        	}else{
	        		$(this).removeClass('xm-is-checked');
	        		el.find('.btn-primary').addClass("disabled");
	        	}
	        });

	        el.find('.btn-close,.a-unl').click(function() {
	            popup.close();
	        });

	        el.find('.btn-primary').click(function() {
	        	var taskId = $("#mainBtnAgree").attr("data-taskId");
	        	$.ajax({
	        		url: '/task/'+taskId+'/offer/accept',
	        		success: function(data) {
	        			window.location.reload();
	        		}
	        	});
	        });
		}; 
	};

	/**
	 * [formatDate 日期格式化]
	 * @param  {} date   [description]
	 * @param  {[type]} format [description]
	 * @return {[type]}        [description]
	 */
	function formatDate(date,format)
	{
		var o = {
		"M+" : date.getMonth()+1, //month
		"d+" : date.getDate(), //day
		"h+" : date.getHours(), //hour
		"m+" : date.getMinutes(), //minute
		"s+" : date.getSeconds(), //second
		"q+" : Math.floor((date.getMonth()+3)/3), //quarter
		"S" : date.getMilliseconds() //millisecond
		}
		if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
		(date.getFullYear()+"").substr(4- RegExp.$1.length));
		for(var k in o)if(new RegExp("("+ k +")").test(format))
		format = format.replace(RegExp.$1,
		RegExp.$1.length==1? o[k] :
		("00"+ o[k]).substr((""+ o[k]).length));
		return format;
	}

	/**
	 * 计算剩余时间
	 * @param  {[int]} time [时间截]
	 * @return {[string]}      [description]例：47小时54分钟
	 */
	function surplusTime(time) {
		var now = new Date().getTime();
		var surplus = time - now;
		// console.log(surplus);
		if(surplus >= 0 ){
			var hour = parseInt(surplus / (60 * 60 * 1000));
			// console.log(hour);
			var min = parseInt((surplus - hour * ( 60 *60 * 1000)) /(60 * 1000));
			return (hour < 10 ? "0"+hour : hour ) +"小时" +(min < 10 ? "0"+min : min )+"分钟";
		}
	};

	/**
	 * 拒绝邀约弹窗
	 * @return {[type]} [description]
	 */
	function refusePopup(taskId) {
		var content = '<div class="hd"><h2 class="tit">确认操作</h2></div>'+
				'<div class="bd"><div class="pic fl"><img src="${staticPath}/css/img/default/cat3.png"></div>'+
					'<div class="ovf"><p class="mgtb-10">啊哦~<br>您真的要谢绝本次邀约吗？</p>'+
						'<textarea placeholder="请填写您拒绝本次录音的缘由，谢谢！" id="refuseText"></textarea>'+
					'</div>'+
					'<div class="mgtb-20 tc">'+
						'<a class="btn btn-default btn-mid" id="refusePopup_refuse">确认拒绝</a>'+
						'<a class="btn btn-primary btn-mid mgl-10 cancelBtn">取消</a>'+
					'</div>'+
				'</div>';
		content = content.replace(/\$\{staticPath\}/, xm.config.STATIC_PATH);
		var op = {
	            content: content,
	            overlayer : { addClass : 'masker' },
	            template: {
	                dialog_mask : '<div class="masker"></div>',
	                dialog_container: '<div class="popup pop-default pop-refuse" dialog-role="container"></div>',
	                dialog_body: '<div class="" dialog-role="body"></div>'
	            }
	        };
	    var popup = new dialog.Dialog(op);
        popup.open();
        var el = popup.getEl();


        el.find("#refusePopup_refuse").click(function() {
        	var value = $('#refuseText').val();
        	if($.trim(value) == ''){
        		$('<span class="tip refuseTip">拒绝缘由不能为空</span>').insertAfter('#refuseText');
        		return false;
        	}else{
        		$('.refuseTip').remove();
        	}
        	
        	$.ajax({
        		url : '/task/'+taskId+'/offer/reject',
        		type : 'post',
        		data : {rejectReason : value},
        		success:function(data) {
        			window.location.reload();
        		}
        	});
        });

        el.find('.cancelBtn').click(function() {
            popup.close();
        });

	}; 


	/**
	 * 取消试音
	 * @param  {[type]} url [description]
	 * @return {[type]}     [description]
	 */
	function deleteSample(url){

		dialog.confirm('亲，确认要删除该段声音吗？',
				function() {
					$.ajax({
						url : url ,
						type : 'DELETE',
						success : function(data) {
							window.location.reload();
						}
					});
				}
				,{yesText : '确认'}
			);
	};

	 
	
	
})(jQuery);