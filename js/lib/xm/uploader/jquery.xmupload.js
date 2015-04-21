/*
 * xmupload jQuery Plugin v1.0.0
 *
 * Copyright (c) 2015 simon huang
 * Licensed under the MIT license.
 *
 */
xm.jsonp= {
		uploader :{
			queryTranscode :undefined,
			transcodeUrl : ''
		}
	};


(function($,xmupload){
	

	var defaultSettings = {
		flash_url: config.STATIC_PATH + '/js/lib/xm/uploader/swf/swfupload.swf',		//swf flash路径
        upload_url: config.UPLOAD_ROOT + '/audio/upload',		//上传路径
        // post_params : {callerSource : 'copyright'}, 			//上传试音文件时需要
        transcoding_url: '/dtres/jsonp/uploader/queryTranscode/{id}/{timestamp}', 	//转码路径
        // transcoding_url : 'http://test.ximalaya.com/dtres/zhuanma/{id}/jindu/{timestamp}',
        file_size_limit: "200 MB",			//文件最大上传限制 单位（M）
        file_types: "*.MP4;*.3GP;*.AVI;*.WMV;*.MPG;*.VOB;*.FLV;*.MOV;*.RMVB;*.RM;*.MPEG;*.MP3;*.WMA;*.AIFF;*.AIF;*.WAV;*.FLAC;*.OGG;*.MP2;*.AAC;*.AMR;*.M4A;",				//允许上传的文件类型
        file_types_description: "Audio Files",//上传文件类型描述
        file_upload_limit: 50,		//设置xmupload实例允许上传的最多文件数量
        file_queue_limit: 50,		//设置文件上传队列中等待文件的最大数量限制
        custom_settings: {
            progressTarget: "progressBarContainer"
        },
        debug: false,
        requeue_on_error_time: 20, // second
        requeue_on_error: true,
        button_width: "185",
        button_height: "85",
        button_placeholder_id: "", //"xmuploadWarp",
        button_cursor: xmupload.CURSOR.HAND, //鼠标到flash上鼠标cursor
        button_window_mode: xmupload.WINDOW_MODE.TRANSPARENT, //透明
        callerSource:'',//上传声音类型
        id:''
	}
	
	var xmHandlers = {};

	var defaultHandlers = [
		'xmupload_preload_handler',
		'xmupload_load_failed_handler',
		'xmupload_loaded_handler',
		'file_dialog_start_handler',
		'file_queued_handler',
		'file_queue_error_handler',
		'file_dialog_complete_handler',
		'upload_resize_start_handler',
		'upload_start_handler',
		'upload_progress_handler',
		'upload_error_handler',
		'upload_success_handler',
		'upload_complete_handler',
		'mouse_click_handler',
		'mouse_out_handler',
		'mouse_over_handler',
		'queue_complete_handler',
		'transcoding_success'
	];
	var additionalHandlers = [];
	
	$.fn.xmupload = function(){
		var args = $.makeArray(arguments);
		return this.each(function(){
			var xmu;
			var $this = this;
			if ((args.length == 1 && typeof(args[0]) == 'object') || (args.length == 0) ) {
				
				xmu = $(this).data('__xmu');
				if (!xmu) {
					var _this = $('<div id="'+$(this).attr("id")+'_0">').appendTo(this);
					var settings  = $.extend({},defaultSettings,args.length && args[0] || {});//传入的参数
					settings = checkOption(this,settings); //标签上的参数
					
					var $magicUploadControl = _this;
					var handlers = [];
					
					$.merge(handlers, defaultHandlers);
					$.merge(handlers, additionalHandlers);

					//根据上传类型 给上传接口添加参数
					if(settings.callerSource !== ''){
						settings.upload_url = settings.upload_url+"?callerSource="+settings.callerSource;
					}


					settings = $.extend({},settings,xmHandlers);
					var id = ''+this.id;
					settings.id = function(){return $this.id}();
					$(this).data('__xmu', new xmupload(settings));
				}
			} else if (args.length > 0 && typeof(args[0]) == 'string') {
				var methodName = args.shift();
				xmu = $(this).data('__xmu');
				if (xmu && xmu[methodName]) {
					xmu[methodName].apply(xmu, args);
				}
			}
		});
	};


	function checkOption(_this) {
		var button_placeholder_id = $(_this).attr("id")+"_0";

		var optionsStr = $(_this).attr("data-option"),options;
		if(!optionsStr) return $.extend({},defaultSettings,{button_placeholder_id:button_placeholder_id});
		optionsStr = optionsStr.replace(/'/g, '"');
		options = optionsStr ? $.parseJSON(optionsStr) : {};
		options.button_placeholder_id = button_placeholder_id;
		return $.extend({},defaultSettings,options);
	};

	$.xmupload = {
		additionalHandlers: function() {
			if (arguments.length === 0) {
				return additionalHandlers.slice();
			} else {
				$(arguments).each(function(i, v){
					$.merge(additionalHandlers, $.makeArray(v));
				});
			}
		},
		defaultHandlers: function() {
			return defaultHandlers.slice();
		},
		getInstance: function(el) {
			return $(el).data('__xmu');
		},
		setOptions : function(options) {
			defaultSettings = $.extend({},defaultSettings,options);
		},
		setHandlers : function(_handlers) {
			xmHandlers = $.extend({},xmHandlers,_handlers);
		},
		checkName : function(name) {
			if(name.length > 10){
				
			}
		}
	};
	
})(jQuery,SWFUpload);