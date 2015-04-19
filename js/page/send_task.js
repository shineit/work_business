;(function($) {

	var part = '<div class="row part">'+
					'<div class="cell-1">试音片段文本<span class="c04">*</span></div>'+
					'<div class="cell-2">'+
						'<textarea placeholder="1500字以内" class="${partAreaText}" id="${partAreaText}" name="fileContext"></textarea> <a class=" a-unl del-line a" href="javascript:;">删除</a>'+
						'<span class="tip mgl-10 ${partAreaText}_tip"></span>'+
						'<p class="tip tip-1 ${partCountWorld}">您还可以输入<span>1500</span>字</p>'+
					'</div>'+
				'</div>';

	$(function() {

		 $(".xm-selector").Selector();
		 $("input").beautify();
	     $("#categoryIdTemp").change(function() {
	     	var val = $(this).val();
	     	$("#categoryId").val(val == -1 ? "" : val);
	     	if(val == -1){
	     		$('.categoryIdTip').html('请选择分类');
	  		}else{
	  			$('.categoryIdTip').html('');
	  		} ;
	     });

		//日期控件事件监听 S
		$(".wrapper1").on('focus','.dateInput',function() {
			if($(this).attr("id") == 'openCallStartTime'){
				WdatePicker({isShowClear:false,readOnly:true,maxDate:"#F{$dp.$D('openCallEndTime')}"});
			}else{
				WdatePicker({isShowClear:false,readOnly:true,minDate:"#F{$dp.$D('openCallStartTime')}"});
			}
		});

		$(".wrapper1").on('click','.startDate',function() {
			var startDate = $dp.$('openCallStartTime');
			startDate.focus();
		});

		$(".wrapper1").on('click','.endDate',function() {
			var endDate = $dp.$('openCallEndTime');
			endDate.focus();
		});
		//日期控件事件监听 E
		


		//文本增加删除事件监听  S
		$(".wrapper1").on('click','.btn-addtxt',function() {
			var partText = "fileContext_"+($('.part').length);
			var partCount = "partCount_"+($('.part').length);
			var partTemp = part.replace(/\$\{partAreaText\}/g, partText);
			partTemp = partTemp.replace(/\$\{partCountWorld\}/g, partCount);
			var $part = $(partTemp).insertAfter($('.part:last'));
			countWorld($("."+partText),"."+partCount,1500);
			toggleDel();
			if($('.part').length >=  5){
				$('.btn-addtxt').addClass('hidden');
			}else{
				$('.btn-addtxt').removeClass('hidden');
			}
			$("."+partText).focus();
		});

		$('.wrapper1').on('click','.del-line',function() {
			$(this).parents('.part').remove();
			if($('.part').length >=  5){
				$('.btn-addtxt').addClass('hidden');
			}else{
				$('.btn-addtxt').removeClass('hidden');
			}
			toggleDel();
		});

		function toggleDel() {
			if($('.part').length > 1 ){
				$(".wrapper1 .del-line").removeClass("hidden");
			}else{
				$(".wrapper1 .del-line").addClass("hidden");
			}
		};
		//文本增加删除事件监听  E
		
		//片段文本 字数计数
		countWorld($(".fileContext_0"),".partCount_0",1500);

		//作品简介 字数计数
		countWorld($('.introduction'),'.introduction-text',500);

		function countWorld($el,textEl,length) {
			$el.wordcount({
					maxLength:length,
					textEl:textEl, 
				});
		};

		
		//表单验证
		var validator = $("#taskForm").validate({
        		rules: {
				   	workName: {
				   		required : true,
				   		maxlength : 30

				   	},
				   	authorName: {
				   	 	required: true,
				   	 	maxlength : 30
				   	},
				   	authorAlisa: {
				   	 	required: true,
				   	 	maxlength : 30
				   	},
				   	categoryId: {
				   	 	required: function(e) {
				   	 		var value = $(e).val();
				   	 		value != '' ? $(".categoryIdTip").html('') : '';
				   	 		return true;
				   	 	}
				   	},
				   	totalWordCount  : {
					   	required: function(e) {
					   		var value = $(e).val();
					   		value != '' ? $('.totalWordCountTip').html("") : '';
					   		return true;
					   	},
					   	number : true,
					   	maxlength : 8
				   	},
				   	studioStyleId : {
				   		required : function(e) {
				   			var value = $(e).val();
					   		value != '' ? $('.studioStyleIdTip').html("") : '';
					   		return true; 
				   		}
				   	},
				   	"workBrief" : {
				   	 	required: true

				   	},
				   	"contactName" : {
				   	 	required: true,
				   	 	maxlength : 15
				   	},
				   	"contactPhoneNo" :  {
				   	 	required: true,
				   	 	number : true,
				   	 	maxlength : 15
				   	},

				   	"openCallStartTime" : {
				   		required: function(e) {
				   			var value= $(e).val();
				   			if(value == ''){
				   				$('.openCallTime').html("请选择开始时间");
				   			}else{
				   				$('.openCallTime').html("");
				   			}
				   			return true;
				   		}
				   	},
				   	"openCallEndTime" : {
				   		required: function(e) {
				   			var value= $(e).val();
				   			if(value == ''){
				   				$('.openCallTime').html("请选择结束时间");
				   			}else{
				   				$('.openCallTime').html("");
				   			}
				   			return true;
				   		}
				   	}
				   	,
				   	"fileContext" : {
				   		required: function(e) {
				   			var value= $(e).val();
				   			if(value == ''){
				   				$("."+$(e).attr('id')+"_tip").html('请填写试音片段文本');
				   			}else{
				   				$("."+$(e).attr('id')+"_tip").html('');
				   			}
				   			return true;
				   		}
				   	}
				  },
				messages: {
				   	workName: {
				   		required:function() {				   			 
				   			return '<span class="tip mgl-10">请填写作品名称</span>';
				   		} ,
				   		maxlength : function() {
				   			return '<span class="tip mgl-10">最多可输入30字</span>';
				   		}
				   	},
				   	authorName: {
				    	required:function() {
				   			return '<span class="tip mgl-10">请填写作者名</span>';
				   		},
				   		maxlength : function() {
				   			return '<span class="tip mgl-10">最多可输入30字</span>';
				   		}
				   	},
				   	authorAlisa: {
				   		required:function() {
				   			return '<span class="tip mgl-10">请填写作者笔名</span>';
				   		} ,
				   		maxlength : function() {
				   			return '<span class="tip mgl-10">最多可输入30字</span>';
				   		}
				   	},
				   	studioStyleId : {
				   		required:function() {
				   			$('.studioStyleIdTip').html('请选择演绎方式');
				   		} 
				   	},
				   	categoryId: {
				   		required:function() {
				   			$(".categoryIdTip").html('请选择分类');
				   		} 
				   	},
				   	totalWordCount: {
				   		required:function() {
				   			$('.totalWordCountTip').html("请填写字数");
				   		} ,
				   		number : function() {
				   			$('.totalWordCountTip').html("该输入框只能填写数字");
				   		},
				   		maxlength : function() {
				   			$('.totalWordCountTip').html("最多可输入8位数字");
				   		}
				   	},
				   	workBrief: {
				   		required:function() {
				   			return '<span class="tip mgl-10">请填写作品简介</span>';
				   		} 
				   	},
				   	contactName: {
				   		required:function() {
				   			return '<span class="tip mgl-10">请填写联系人</span>';
				   		},
				   		maxlength : function() {
				   			return '<span class="tip mgl-10">最多可输入15字</span>';
				   		}
				   	},
				   	contactPhoneNo: {
				   		required:function() {
				   			return '<span class="tip mgl-10">请填写联系电话</span>';
				   		},
				   		number : function() {
				   			return '<span class="tip mgl-10">该输入框只能填写数字</span>';
				   		},
				   		maxlength : function() {
				   			return '<span class="tip mgl-10">最多可输入15位数字</span>';
				   		}
				   	},
				   	openCallStartTime : {
				   		required:function() {
				   			$('.openCallTime').html("请选择开始时间");
				   		} 
				   	},
				   	openCallEndTime: {
				   		required:function() {
				   			$('.openCallTime').html("请选择结束时间");
				   		} 
				   	}
				   	,
				   	fileContext : {
				   		required:function(e) {
				   			$("."+$(this).attr('id')+"_tip").html('试音片段文本');
				   		} 
				   	}
			  	},
			  	
			  	submitHandler : function(form) {
			  		
			  		if(isready) form.submit();
			  		
			  	}
			});
		
			var isready ;
			$("#submitForm").on('click',function() {
				isready = true;

				var val = $("#categoryId").val();
		  		if(val == -1){
		  			$('.categoryId_tip').html('请选择分类');
		  			isready = false;
		  		} ;

		  		var pass = parseInt($('#workBrief')[0].getAttribute("pass"));
		  		if(pass) {isready = false;}
		  		$("[name*='fileContext']").each(function() {
		  			var value = $(this).val();
		  			if($.trim(value) == ''){
		  				$("."+$(this).attr('id')+"_tip").html('请填写试音片段文本');
		  				isready = false;
		  				return ;
		  			}

		  			var pass = parseInt($('#workBrief')[0].getAttribute("pass"));
		  			if(pass) {isready = false;}
		  		});

				$("#taskForm").submit();
			});
	});	

	
	

})(jQuery);