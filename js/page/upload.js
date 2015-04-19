(function($) {
	$(function() {

		$(".xm-selector").Selector();
		$("input").beautify();

		$("#xmUploadBtn").xmupload(); 

		$("#xmUpload2Btn").xmupload();

		$("#categoryIdTemp").change(function() {
			var value = $(this).val();
			
			if(value !== -1){
				$.ajax({
					url : '/ablumcategory/'+value,
					dataType : 'json',
					success : function(data) {
						$(".tabList").html(data.data);
					}
				});
			}
		});

		$('.tabList').on('click','a',function() {
			if(!checkTagNum()){ return ;};
			
			var tag = $(this).clone();
			var tagText = $(this).find('span').text();
			var isExist = false;
			$('.tagSelected a').each(function() {
				var text = $(this).find('span').text();
				if(tagText === text){
					isExist = true;
				}
			});
			if(!isExist){
				$(tag).appendTo(".tagSelected").append('<u class="del"></u>');
				reflushTagsValue();
			}
		});


		$("#inputTag").on('keydown',function(e) {
			if(e.keyCode === 13 || e.keyCode === 32){
				var value = $(this).val();
				var temp = value , isExist = false;
				if($.trim(value) === '') {return false;} //为空时，直接返回
				temp = temp.replace(/[\u4e00-\u9fa5]/gi, 'aa');
				if(temp.length > 16){//自定义的字数限制  8个汉字
					window.xm.plugin.alert("内容超出范围");
					return false;
				}
				if(!checkTagNum(this)){ 

					$(this).val('');
				 	return false;
				};  //限制最多标签数

				$('.tagSelected a').each(function() {  //是否在已选的标签中存在
					var text = $(this).find('span').text();
					if(value == text){
						isExist = true;
					}
				});
				if(isExist){  
					$(this).val('');
					return false;	
				} 

				var tag = '<a class="item"><span>'+value+'</span><u class="del"></u></a>';
				$(tag).appendTo(".tagSelected");
				reflushTagsValue();
				$(this).val('');
			}
			
		});

		
		/**
		 * [checkTagNum 限制最多标签数]
		 * @param  {[type]} num [限制的最多标签数  默认 5]
		 * @return {[boolean]}     [true为通过  false 为不通过]
		 */
		function checkTagNum(_this,num) {
			//限制最多五标签
			var len = $(".tagSelected a").length;
			num = num || 5;
			if(len >= num){
				window.xm.plugin.alert("最多只能选择"+num+"个标签");
				return false;
			}
			return true;
		};

		$(".tagSelected").on('click','.del',function() {
			$(this).parents('a').remove();
			reflushTagsValue();
		});


		/**
		 * 更新已选择的标签
		 * @param  {[type]} tags [description]
		 * @return {[type]}      [description]
		 */
		function reflushTagsValue() {
			var tags = [];
			$(".tagSelected a span").each(function() {
				var value = $(this).text();
				tags.push(value);
			});
			$("#tags").val(tags.join(","));
		};

		var uploadImg =new  xm.UploadImg({
			$el : $("#imgUploadContainer"),
			success : function(data, file, str_data) {
				$("#coverPath").val(data.data[0].dfsId);
				$('.preview img').attr("src", xm.config.FDFS_PATH + "/" +data.data[0].dfsId);
				$('.preview').removeClass('is-loading');
			},
			beforeUpload : function() {
				$('.preview').addClass('is-loading');
			},
			error : function() {
				$('.preview').removeClass('is-loading');
			}
		});



		$("#userSourceTemp").change(function() {
			var value = $(this).val();
			value = value == -1 ? "" : value;
			$("#userSource").val(value);
			if(value === ""){
				$('.userSourceTip').html('请填写来源');
			}else{
				$('.userSourceTip').html('');
			}
		});

		$("#categoryIdTemp").change(function() {
			var value = $(this).val();
			value = value == -1 ? "" : value;
			$("#categoryId").val(value);
			console.log($("#categoryId").val());
			if(value === ""){
				$('.categoryIdTip').html('请填写分类');
			}else{
				$('.categoryIdTip').html('');
			}
		});


		var validator = $("#uploadForm").validate({
    		rules: {
			   	
			   	title: {
			   	 	required: true
			   	},
			   	userSource : {
			   		required: function(e) {
			   			var value = $(e).val();
				   		value != '' ? $('.userSourceTip').html("") : '';
				   		return true; 
			   		}
			   	},
			   	categoryId : {
			   		required: function(e) {
			   			var value = $(e).val();
				   		value != '' ? $('.categoryIdTip').html("") : '';
				   		return true; 
			   		}
			   	},
			   	coverPath : {
			   		required: function(e) {
				   		var value = $(e).val();
				   		value != '' ? $('.coverPathTip').html("") : '';
				   		return true;
			   		} 
			   	}
			   	
			   	
			  },
			messages: {
			   	title: {
			   		required:function() {				   			 
			   			return '<span class="tip mgl-10 titleTip">请填写专辑名称</span>';
			   		}
			   	},
			   	userSource : {
			   		required: function() {	
			   			$('.userSourceTip').html('请选择来源');
			   		}
			   	},
			   	categoryId : {
			   		required: function() {		
			   			$('.categoryIdTip').html('请选择分类');		   			 
			   		}
			   	},
			   	coverPath : {
			   		required: function() {	
			   			$('.coverPathTip').html('请上传封面');					   			 
			   		}
			   	}
			   
		  	},
		  	
		  	submitHandler : function(form) {
		  		var $this  = $("#submitForm");
		  		if(!isready) {
		  			return false;
		  		};
				$this.text("提交中...").addClass('disabled');

				var timer = setInterval(function() {
					console.log($.xmupload.isComplateAll());
					if($.xmupload.isComplateAll()){
						clearInterval(timer);
						form.submit();
					}
					
				},1000);
		  		// if(isready) form.submit();
		  		
		  	}
		});
	
		var isready ;
		$("#submitForm").on('click',function() {
			isready = true;
			var pass = parseInt($('#intro')[0].getAttribute("pass"));
		  	if(pass) {isready = false;}
			$("#uploadForm").submit();
		});

		countWorld($("#intro"),".introTip",500);
		function countWorld($el,textEl,length) {
			$el.wordcount({
					maxLength:length,
					textEl:textEl, 
				});
		};


		
		

	});


	
})(jQuery);