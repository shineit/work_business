
(function($) {
	var mTotalNum;
	var checkLoginUrl = "/passport/check_me";//检查登录状态
	var refPram = {singleFile:true},mFileList = [];
	var _swfupload2,_swfu2HasFile;
	var progress_url = '/dtres/progress';
	var dtresPath = 'http://test.ximalaya.com';
	var uploadBtnContainer = "";
	var container = {
		uploadBtn : ".xmupload_btn",
		processList : ".xmupload_file_list"
	};
	

	$.xmupload.view = {
		dialogComplete : function() {
			// $(".goOnXMUploadBtn").addClass('hidden'); //默认隐藏继续上传按钮
			$(".goOnXMUploadBtn").css("left","-9999px");
			$("#xmuploadbtncontainer").css({"height":0,"overflow":'hidden'});
			$('#progressContainer').removeClass('hidden');	
		}
	};

	/**
	 * 通过查看元素 是否有试音属性来判断 完成的转码数  再与总文件比较  判断是否全部转码完成
	 * @return {Boolean} [description]
	 */
	$.xmupload.isComplateAll = function() {
		var len = $('.progressBarContainer li').length;
		var complateLen= $(".progressBarContainer li[sound_url][status='2']").length;

		if(len = complateLen){
			return true;
		}		
		return false; 
	};//记录所有文件是否都已经上传及转码成功

 
	function myDebug() {
		console && console.info(arguments);
	};

	//通过文件ID查询文件
	function findFileByFileid(fileArray, fileid) {
        for (var i = 0, l = fileArray.length; i < l; i++) {
            var tempfile = fileArray[i];
            if (tempfile.id == fileid) {
                return tempfile;
                break;
            }
        }
        return false;
    }

    //取消上传
    function cancelFileUpload(fileid) {
	    for (var i = 0, l = mFileList.length; i < l; i++) {
	        var tempfile = mFileList[i];
	        if (tempfile.id == fileid) {
	        	//关闭转码查询
	            if (tempfile.transcodeTimer) {
	                if(window.console) console.log("clearInterval upload_index 355");
	                clearInterval(tempfile.transcodeTimer);
	                tempfile.transcodeTimer = null;
	            }
	            /*从mFileList中删掉选中项*/
	            mFileList.splice(i, 1);
	            /*在继续上传中增加可以上传个数*/
	            if(!_swfupload2) break;
	            var cur_limit = _swfupload2.getSetting("file_upload_limit");
	            var stats = _swfupload2.getStats();
	            _swfupload2.setFileQueueLimit(0);
	            _swfupload2.setFileUploadLimit(mMaxNum - mFileList.length + stats.successful_uploads + stats.files_queued);
	            break;
	        }
	    }
	    if (mFileList.length == 0) {
	        $(".p_info").show().html("该专辑还没有任何声音");
	    } else {
	        $(".p_info").hide();
	    }

	}

	/**
	 * 转码失败时的处理函数
	 * @param  {[type]}   progress [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	function transcodeError(progress, callback){
	    var time = 10;
	    var _this = this;
	    var timer = setInterval(function () {
	        time--;
	        progress.setTranscodingStatus("查询进度失败，将在 " + time + "秒后重试");
	        if (time <= 0) {
	            clearInterval(timer);
	            callback();
	        }
	    }, 1000);
	}


	//检验是否登陆
	function checkLogin(loginFn, unloginFn) {
        /*  loginFn();
         return;*/
        loginFn = loginFn || $.noop;
        unloginFn = unloginFn || $.noop;
        var unloginFn2 = function () {
            login_box.open(function (data) {
                login_box.close();
            });
            unloginFn();
        };
        var token = readCookie(config.TOKEN_LABEL);
        if (!token) {
            unloginFn2();
            return;
        }
        $.ajax({
            type: "get",
            url: checkLoginUrl,
            data: {token: decodeURIComponent(token), rememberMe: 'y'},
            dataType: "json",
            success: function (result) {
                if (result && result.ret == 50) {
                    unloginFn2();
                } else {
                    loginFn();
                }
            },
            error: function () {
                unloginFn2();
            }
        });
    }

    //文件列表排序
    function sortFileList(list) {
    	if(!list || list.length ==0){return []};
    	var length = list.length;
	    var map = _.map(list, function(file){
	        var name = file.name;
	        name = file.name.replace(/\d+/g, function(a){
	            var zero = '';
	            for(var i = a.length; i<10; i++){
	                zero += '0';
	            }
	            return  zero + a;
	        });
	        return {
	            name: name,
	            file: file
	        };
	    });
	    map = _.sortBy(map, function(obj){return obj.name;});
	    return _.map(map, function(obj){ return obj.file});
    };

    /**
	* 通过已上传的文件数获得当前允许上传的文件数
    */
    function getCurAllowFileList(numFilesSelected) {
    	mTotalNum = mTotalNum - numFilesSelected;
	    mTotalNum = mTotalNum <= 0 ? 1 : mTotalNum;
	    return mTotalNum;
    };

    //触发用户绑定的事件
	function setTrigger(name,argu) {
		var eventName = name.replace(/_handler$/, '').replace(/_([a-z])/g, function(){ return arguments[1].toUpperCase(); });
		var event = $.Event(eventName);
		var $this = $("#"+this.settings.id);
		$this.trigger(event, $.merge(this,$.makeArray(argu)));
		return !event.isDefaultPrevented();
	};

	$.xmupload.setHandlers({
		'isComplateAll' : false,
		'swfupload_preload_handler' : function() {},
		'swfupload_load_failed_handler' : function() {},
		'swfupload_loaded_handler' : function() {},
		'file_dialog_start_handler' : function() {
			// this.
			return false;

		},
		'transcoding_success' : function() {
			setTrigger.call(this,'transcoding_success',arguments);
		},
		'file_queued_handler' : function(file) {
			if (!this.file_queued_list) {
                this.file_queued_list = [];
            }
            this.file_queued_list.push(file);

            mFileList.push(file);
            setTrigger.call(this,'file_queued_handler',arguments);
		},
		'file_queue_error_handler' : function(file, errorCode, message) {
			if (SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT == errorCode) {
                mFileList.push(file);

                if (!this.cancelTranscoding) {
                    /*添加取消转码方法*/
                    this.cancelTranscoding = function (fileid) {
                        _this.cancelFileUpload(fileid);
                    };
                }
            }
            this.filesSelected = refPram;

            if (errorCode === SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {
		        var msg = "您选择了太多文件。\n" + (message === 0 ? "你已经达到了上传限制。" : "你只能上传 " +  message + "个文件");
	            xm.plugin.alert(msg);
		        return;
		    }
		    var progress = fileProgressUtil.createProgress(file, this.customSettings.progressTarget, this.filesSelected||{singleFile:true
		    	, upload_limit : this.settings.file_upload_limit});
		    progress.setError();
		    progress.toggleCancel(true);

		    switch (errorCode) {
		        case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
		            progress.setStatus("文件太大.");
		            this.debug("Error Code: File too big, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
		            break;
		        case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
		            progress.setStatus("不能上传空文件.");
		            this.debug("Error Code: Zero byte file, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
		            break;
		        case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
		            progress.setStatus("未定义的文件类型.");
		            this.debug("Error Code: Invalid File Type, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
		            break;
		        default:
		            if (file !== null) {
		                progress.setStatus("Unhandled Error:"+message);
		            }
		            this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
		            break;
		    }


			setTrigger.call(this,'file_queue_error_handler',arguments);
		},
		'file_dialog_complete_handler' : function(numFilesSelected, numFilesQueued) {
			myDebug(numFilesSelected, numFilesQueued);
			mTotalNum = this.settings.file_upload_limit;
			if (numFilesSelected >= 1 && numFilesSelected <= mTotalNum) {
                var self = this;
                
                
                self.singleFile = refPram.singleFile = (1 == numFilesSelected && mFileList.length <= 1) ? true : false;
                setTrigger.call(self,'file_dialog_complete_handler',arguments);
                mTotalNum = getCurAllowFileList(numFilesSelected); //通过已上传的文件数获得当前允许上传的文件数
                
                self.file_queued_list = sortFileList(self.file_queued_list); //文件列表排序
			    for(var i = 0;i<self.file_queued_list.length;i++){
			    	var file = self.file_queued_list[i];
		            var progress = fileProgressUtil.createProgress({file:file,target : self.customSettings.progressTarget , singleFile :self.singleFile 
		            		, upload_limit : this.settings.file_upload_limit});
				    progress.setStatus("等待上传");
				    progress.toggleCancel(true, self);
			    }
			    self.file_queued_list = [];
			    self.startUpload();
				$.xmupload.view.dialogComplete.apply(this);
                /*checkLogin(function () {
                    // _this.initInfo({ album: !refPram.singleFile, timingPublish:true });                    

                    $.xmupload.view.dialogComplete();
                    self.singleFile = refPram.singleFile = 1 == numFilesSelected ? true : false;
                    setTrigger.call(self,'file_dialog_complete_handler',arguments);
                    mTotalNum = getCurAllowFileList(numFilesSelected); //通过已上传的文件数获得当前允许上传的文件数
                    
                    self.file_queued_list = sortFileList(self.file_queued_list); //文件列表排序
				    for(var i = 0;i<self.file_queued_list.length;i++){
			            var progress = fileProgressUtil.createProgress(file, self.customSettings.progressTarget, self.singleFile, false);
					    progress.setStatus("等待上传");
					    progress.toggleCancel(true, self);
				    }
				    self.file_queued_list = [];
				    if(!self.settings.upload_url) return;
				    self.startUpload();
                    
                }, function () {
                	var $this = $(self.settings.custom_settings.el);
                	$this.xmupload("destroy")
                		.html('')
                		.data("__xmu",null)
                		.xmupload();
                });*/
            }
			
			
		},
		'upload_resize_start_handler' : function() {},
		'upload_start_handler' : function(file) {
			myDebug('upload_start_handler');
			var file_temp = findFileByFileid(mFileList, file.id);
            if (!file_temp) return;
            var progress = fileProgressUtil.createProgress({file:file,target : this.customSettings.progressTarget ,
             singleFile :this.singleFile , upload_limit : this.settings.file_upload_limit});
		    progress.setStatus("开始上传");
		    progress.uploadStart();
		    progress.toggleCancel(true, this);
		    // setTrigger.call(this,'upload_start_handler',arguments);
		    return true;
		},
		'upload_progress_handler' : function(file, bytesLoaded, bytesTotal) {
			myDebug('upload_progress_handler');
			var file_temp = findFileByFileid(mFileList, file.id);
			console.log(11111);
            if (!file_temp) return;
            var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
console.log(22222);
		    var progress = fileProgressUtil.createProgress({file:file,target : this.customSettings.progressTarget , singleFile :this.singleFile 
		    	, upload_limit : this.settings.file_upload_limit});
		    console.log(11113);
		    progress.setProgress(percent);
		    console.log(11114);
		    var loaded = Math.floor(bytesLoaded * 10 / (1024 * 1024)) / 10 + "M",
		        total = Math.floor(bytesTotal * 10 / (1024 * 1024)) / 10 + "M";
		        console.log(11115);
		    progress.setStatus("上传进度:" + loaded + "/" + total);
		    console.log(11116);
		    // setTrigger.call(this,'upload_progress_handler',arguments);
		},
		'upload_error_handler' : function(file, errorCode, message) {
			myDebug('upload_error_handler');
			if (errorCode == SWFUpload.UPLOAD_ERROR.FILE_CANCELLED 
					|| errorCode == SWFUpload.UPLOAD_ERROR.HTTP_ERROR
					|| errorCode == SWFUpload.UPLOAD_ERROR.IO_ERROR) {
                //取消上传
                cancelFileUpload(file.id);
            }
            

            var progress = fileProgressUtil.createProgress({file:file,target : this.customSettings.progressTarget , singleFile :this.singleFile
             		, upload_limit : this.settings.file_upload_limit});
		    progress.setError();
		    progress.toggleCancel(true, this);

		    if (this.settings.requeue_on_error && errorCode != SWFUpload.UPLOAD_ERROR.FILE_CANCELLED ) {

		        var time = this.settings.requeue_on_error_time;
		        var old_timer =   progress.getOnErrorTimer();
		        if (old_timer) {
		            if(window.console) console.log("clearInterval handler 251");
		            clearInterval(old_timer);
		        }
		        var _this = this;
		        var timer = setInterval(function () {
		            time--;
		            progress.setStatus("上传失败，将在 " + time + "秒后重试");
		            if (time <= 0) {
		                if(window.console) console.log("clearInterval handler 259");
		                clearInterval(progress.getOnErrorTimer());
		            }
		        }, 1000);
		        progress.setOnErrorTimer(timer);

		    }

		    switch (errorCode) {
		        case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
		            progress.setStatus("上传出错: " + message);
		            this.debug("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
		            break;
		        case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
		            progress.setStatus("上传失败.");
		            this.debug("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
		            break;
		        case SWFUpload.UPLOAD_ERROR.IO_ERROR:
		            progress.setStatus("Server (IO) Error");
		            this.debug("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
		            break;
		        case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
		            progress.setStatus("Security Error");
		            this.debug("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
		            break;
		        case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
		            progress.setStatus("Upload limit exceeded.");
		            this.debug("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
		            break;
		        case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
		            progress.setStatus("Failed Validation.  Upload skipped.");
		            this.debug("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
		            break;
		        case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
		            // If there aren't any files left (they were all cancelled) disable the cancel button
		            if (this.getStats().files_queued === 0) {
		                //document.getElementById(this.customSettings.cancelButtonId).disabled = true;
		            }
		            progress.setStatus("Cancelled");
		            progress.setCancelled();
		            break;
		        case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
		            progress.setStatus("Stopped");
		            break;
		        default:
		            progress.setStatus("Unhandled Error: " + errorCode);
		            this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
		            break;
		    }
		    setTrigger.call(this,'upload_error_handler',arguments);

		},

		'upload_success_handler' : function(file, serverData) {
			myDebug('upload_success_handler');
			var _this = this;
			var file_temp = findFileByFileid(mFileList, file.id);
            if (!file_temp) return;
            var sData = $.parseJSON(serverData);


            if(window.console){
		        console.log(serverData);
		    }
		    
		    var progress = fileProgressUtil.createProgress({file:file,target : this.customSettings.progressTarget , singleFile :this.singleFile
		    	 , upload_limit : this.settings.file_upload_limit});
		    serverData = $.parseJSON(serverData);

		    if(serverData.ret == 50){
		        //未登录
		        progress.setError();
		        progress.setStatus("上传失败,请重新登录");
		        return;
		    }
		    if(serverData.ret != 0){
		        progress.setError();
		        progress.setStatus(serverData.msg);
		        return;
		    }
		    //progress.setComplete();
		    if(!serverData.status){
		        if(this.upload_error_handler){
		            this.upload_error_handler(file, null, serverData.msg);
		        }else{
		            uploadError.call(this, file, null, serverData.msg);
		        }
		        return;
		    }
		    progress.setProgress(100);
		    progress.setStatus("上传完成");
		    progress.setAttr("status",fileProgressUtil.STATUS.UPLOAD_SUCCESS);
		    if (!this.settings.transcoding_url) return;

		    progress.setTranscodingStatus("等待转码");

		    if(!serverData || !serverData.data || !serverData.data[0]){
		        return;
		    }
		    var server_msg = serverData.data[0];
		    file.uploadSuccess = true;
		    file.transcoding = false;
		    file.transcoded = false;
		    file.transcodingError = false;
		    if(server_msg.uploadTrack){
		        file.uuid = server_msg.uploadTrack.id;
		    }
		    //todo 旧的 将要删掉
		    if(!file.uuid){
		        file.uuid = server_msg.id;
		    }
		    progress.setUuid(file.uuid);
		    var _this = this;
		    var isAjaxing = false;
		    var transcoding_url = dtresPath+this.settings.transcoding_url;
		    var count = 0;
		    var timer = setInterval(function () {
		        url = transcoding_url.replace("{id}", file.uuid).replace("{timestamp}", (new Date()).getTime());
		        if(isAjaxing){
		            return;
		        }
		        var progress = fileProgressUtil.createProgress({file:file,target : _this.customSettings.progressTarget 
		        		, singleFile :_this.singleFile,unReset : true , upload_limit : _this.settings.file_upload_limit});
		        progress.toggleCancel(true, _this);
		        isAjaxing = true;
		        var isTrue = false;
		       	xm.jsonp.uploader.queryTranscode = function(data) {
		       		isTrue = true;
		       		isAjaxing = false;
		                if(!file.transcodeTimer){
		                    if(window.console) console.log("!transcodeTimer");
		                    return;
		                }
		                if(data.duration){
		                    file.duration = data.duration;
		                }
		                switch (data.state) {
		                    case "success":
		                      //  progress.toggleCancel(false);
		                        if(window.console) console.log("clearInterval handler 185");
		                        clearInterval(timer);
		                        progress.setTranscodingStatus("转码完成");
		                        progress.setTranscodingProgress(100);
		                        progress.setTranscodingSuccess(serverData);
		                        if(!_this.transcodings) _this.transcodings = 0;
		                        file.transcoding = false;
		                        file.transcoded = true;
		                        file.transcodingError = false;

		                        // _this.settings.transcoding_success(file);
		                        break;
		                    case "error":
		                        if(window.console) console.log("clearInterval handler 198");
		                        clearInterval(timer);
		                        progress.setTranscodingStatus("转码失败:" + data.value);
		                        progress.setTranscodingError();
		                        file.transcoding = false;
		                        file.transcoded = false;
		                        file.transcodingError = true;
		                        break;
		                    case "processing":
		                        file.transcoding = true;
		                        if(window.console) console.log(" processing 208");
		                        if(parseInt(data.value) >= 100){
		                            if(window.console) console.log(" processing >=100 210");
		                            return;
		                        }
		                        progress.setTranscodingProgress(data.value);
		                        progress.setTranscodingStatus("转码进度:" + data.value + "%");
		                        break;
		                    case "queueing":
		                        if(window.console) console.log(" queueing 217");
		                        file.transcoding = true;
		                        progress.setTranscodingStatus("等待转码");
		                        break;
		                    default:
		                        if(window.console) console.log("default break 222");
		                        break;
		                }
		                console.log('queryTranscode');
		       	};
		        var ajax = $.ajax({
		            url:url,
		            cache: true,
		            // url : 'http://hxs.test.ximalaya.com:8080/jsonp',
		            dataType : "jsonp",
		            jsonpCallback: "xm_jsonp_uploader_queryTranscode",
		            // success:function (data, textStatus, jqXHR) {
		            //      console.log(data);
		            // }
		            // ,
		            error:function (jqXHR, textStatus, errorThrown) {
		            	if(isTrue)  return false;
		                //textStatus === "parsererror" 长城宽带加广告问题
		                if(jqXHR.status === 408 || jqXHR.status === 504 || jqXHR.status === 503 || jqXHR.status === 502 || jqXHR.status === 0 || textStatus === "parsererror"){
		                   
		                    //请求超时
		                    transcodeError(progress, function(){
		                        isAjaxing = false;
		                    });
		                    return;
		                }
		                isAjaxing = false;
		                clearInterval(timer);
		                // var errorLog = new helper.ErrorLog(jqXHR.responseText);  //"+ errorLog.id+"
		                progress.setTranscodingStatus("转码失败:" + textStatus + "<em class='js-errorLog' style='color:blue;margin:4px;cursor: pointer;' errorLog=''>点击查看错误详情</em>");
		                progress.setTranscodingError();
		                file.transcoding = false;
		                file.transcoded = false;
		                file.transcodingError = true;
		                var data = {
		                    errorMsg: textStatus + ";" + errorThrown,
		                    description: jqXHR.responseText,
		                    audioId: file.uuid
		                };

		                $.ajax({
		                    type: "POST",
		                    url: dtresPath+"/dtres/transcoding/feedback",
		                    data: data
		                });
		                myDebug("error Transcoding", file);
		            }

		        });

				

		        
		    }, 1500);
		    file.transcodeTimer = timer;
		    setTrigger.call(this,'upload_success_handler',arguments);
		},

		'upload_complete_handler' : function(file) {
			myDebug('upload_complete_handler');
			if (!this.cancelTranscoding) {
                /*添加取消转码方法*/
                this.cancelTranscoding = function (fileid) {
                    cancelFileUpload(fileid);
                };
            }
            setTrigger.call(this,'upload_complete_handler',arguments);
		},
		'mouse_click_handler' : function() {
			myDebug('mouse_click_handler');
		},
		'mouse_out_handler' : function() {},
		'mouse_over_handler' : function() {},
		'queue_complete_handler' : function(numFilesUploaded) {
            /* 再次上传  需要先等待第一次文件上传完成才开始上传；*/
            swfuUploadComplete = true;
            if (_swfupload2 && _swfu2HasFile) {
                _swfupload2.startUpload();
            }

            setTrigger.call(this,'queue_complete_handler',arguments);
		}
	});

	/**
	*	fileId 文件Id  ,进度条总容器
	*/
	
})(jQuery);