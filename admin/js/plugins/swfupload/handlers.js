/*
		[Leo.C, Studio] (C)2004 - 2008
		
   		$Hanization: LeoChung $
   		$E-Mail: who@imll.net $
   		$HomePage: http://imll.net $
   		$Date: 2008/11/8 18:02 $
*/
/* Demo Note:  This demo uses a FileProgress class that handles the UI for displaying the file name and percent complete.
The FileProgress class is not part of SWFUpload.
*/


/* **********************
   Event Handlers
   These are my custom event handlers to make my
   web application behave the way I went when SWFUpload
   completes different tasks.  These aren't part of the SWFUpload
   package.  They are part of my application.  Without these none
   of the actions SWFUpload makes will show up in my application.
   ********************** */

//define(["plugins/swfupload/fileprogress", "plugins/swfupload/swfupload.queue", "plugins/swfupload/swfupload"], function (FileProgress, queue, SWFUpload) {

+(function (FileProgress, SWFUpload) {

    function fileQueued(file) {
        try {
            var progress = new FileProgress(file, this.customSettings.progressTarget);
            progress.setStatus("正在等待...");
            progress.toggleCancel(true, this);

        } catch (ex) {
            this.debug(ex);
        }
    }

    function fileQueueError(file, errorCode, message) {
        try {
            if (errorCode === SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {
                alert("您正在上传的文件队列过多.\n" + (message === 0 ? "您已达到上传限制" : "您最多能选择 " + (message > 1 ? "上传 " + message + " 文件." : "一个文件.")));
                return;
            }

            var progress = new FileProgress(file, this.customSettings.progressTarget);
            progress.setError();
            progress.toggleCancel(false);

            switch (errorCode) {
                case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
                    progress.setStatus("文件尺寸过大.");
                    this.debug("错误代码: 文件尺寸过大, 文件名: " + file.name + ", 文件尺寸: " + file.size + ", 信息: " + message);
                    break;
                case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
                    progress.setStatus("无法上传零字节文件.");
                    this.debug("错误代码: 零字节文件, 文件名: " + file.name + ", 文件尺寸: " + file.size + ", 信息: " + message);
                    break;
                case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
                    progress.setStatus("不支持的文件类型.");
                    this.debug("错误代码: 不支持的文件类型, 文件名: " + file.name + ", 文件尺寸: " + file.size + ", 信息: " + message);
                    break;
                default:
                    if (file !== null) {
                        progress.setStatus("未处理的错误");
                    }
                    this.debug("错误代码: " + errorCode + ", 文件名: " + file.name + ", 文件尺寸: " + file.size + ", 信息: " + message);
                    break;
            }
        } catch (ex) {
            this.debug(ex);
        }
    }

    function fileDialogComplete(numFilesSelected, numFilesQueued) {
        try {
            if (numFilesSelected > 0) {
                document.getElementById(this.customSettings.cancelButtonId).disabled = false;
            }

            /* I want auto start the upload and I can do that here */
            this.startUpload();
        } catch (ex) {
            this.debug(ex);
        }
    }

    function uploadStart(file) {
        try {
            /* I don't want to do any file validation or anything,  I'll just update the UI and
            return true to indicate that the upload should start.
            It's important to update the UI here because in Linux no uploadProgress events are called. The best
            we can do is say we are uploading.
             */
            var progress = new FileProgress(file, this.customSettings.progressTarget);
            progress.setStatus("正在上传...");
            progress.toggleCancel(true, this);
        }
        catch (ex) { }

        return true;
    }

    function uploadProgress(file, bytesLoaded, bytesTotal) {
        try {
            var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);

            var progress = new FileProgress(file, this.customSettings.progressTarget);
            progress.setProgress(percent);
            progress.setStatus("正在上传...");
        } catch (ex) {
            this.debug(ex);
        }
    }

    function uploadSuccess(file, serverData) {
        try {
            var progress = new FileProgress(file, this.customSettings.progressTarget);

            serverData = JSON.parse(serverData);

            progress.setComplete();
            progress.setStatus("上传成功");
            progress.toggleCancel(false);

            //console.log(serverData);

        } catch (ex) {
            this.debug(ex);
        }
    }

    function uploadError(file, errorCode, message) {
        try {
            var progress = new FileProgress(file, this.customSettings.progressTarget);
            progress.setError();
            progress.toggleCancel(false);

            switch (errorCode) {
                case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
                    progress.setStatus("上传错误: " + message);
                    this.debug("错误代码: HTTP错误, 文件名: " + file.name + ", 信息: " + message);
                    break;
                case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
                    progress.setStatus("上传失败");
                    this.debug("错误代码: 上传失败, 文件名: " + file.name + ", 文件尺寸: " + file.size + ", 信息: " + message);
                    break;
                case SWFUpload.UPLOAD_ERROR.IO_ERROR:
                    progress.setStatus("服务器 (IO) 错误");
                    this.debug("错误代码: IO 错误, 文件名: " + file.name + ", 信息: " + message);
                    break;
                case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
                    progress.setStatus("安全错误");
                    this.debug("错误代码: 安全错误, 文件名: " + file.name + ", 信息: " + message);
                    break;
                case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
                    progress.setStatus("超出上传限制.");
                    this.debug("错误代码: 超出上传限制, 文件名: " + file.name + ", 文件尺寸: " + file.size + ", 信息: " + message);
                    break;
                case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
                    progress.setStatus("无法验证.  跳过上传.");
                    this.debug("错误代码: 文件验证失败, 文件名: " + file.name + ", 文件尺寸: " + file.size + ", 信息: " + message);
                    break;
                case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
                    // If there aren't any files left (they were all cancelled) disable the cancel button
                    if (this.getStats().files_queued === 0) {
                        document.getElementById(this.customSettings.cancelButtonId).disabled = true;
                    }
                    progress.setStatus("取消");
                    progress.setCancelled();
                    break;
                case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
                    progress.setStatus("停止");
                    break;
                default:
                    progress.setStatus("未处理的错误: " + errorCode);
                    this.debug("错误代码: " + errorCode + ", 文件名: " + file.name + ", 文件尺寸: " + file.size + ", 信息: " + message);
                    break;
            }
        } catch (ex) {
            this.debug(ex);
        }
    }

    function uploadComplete(file) {

    }

    // This event comes from the Queue Plugin
    function queueComplete(numFilesUploaded) {
        var status = document.getElementById("divStatus");
        status.innerHTML = numFilesUploaded + " 个文件" + (numFilesUploaded === 1 ? "" : "s") + "已上传.";
    }

    var count = 0;

    window.handlers = {
        getCount: function () {
            count++;

            return count;
        },
        settings: {
            //upload_url: "http://upload.test.ximalaya.com/dtres/cover/upload",
            flash_url: "/admin/js/plugins/swfupload/swfupload.swf",
            file_post_name: "Filedata",
            use_query_string: false,
            requeue_on_error: false,
            http_success: [201, 202, 200],
            assume_success_timeout: 0,
            file_types: "*.jpg;*.gif;*.png",
            file_types_description: "Web Image Files",
            file_size_limit: "1024",
            file_upload_limit: 10,
            //file_queue_limit: 2,
            file_queue_limit: 0,   // 每次能上传的文件个数  
            debug: false,
            prevent_swf_caching: false,
            preserve_relative_urls: false,
            button_placeholder_id: "element_id",
            //button_image_url: "http://www.swfupload.org/button_sprite.png",
            button_width: 61,
            button_height: 22,
            button_text: " ",
            button_text_style: ".redText { color: #FF0000; }",
            button_text_left_padding: 3,
            button_text_top_padding: 2,
            //button_action: SWFUpload.BUTTON_ACTION.SELECT_FILES,
            button_disabled: false,
            //button_cursor: SWFUpload.CURSOR.HAND,
            //button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
            custom_settings: {

            },
            //swfupload_loaded_handler: swfupload_loaded_function,
            //file_dialog_start_handler: file_dialog_start_function,
            file_queued_handler: fileQueued,
            file_queue_error_handler: fileQueueError,
            file_dialog_complete_handler: fileDialogComplete,
            upload_start_handler: uploadStart,
            upload_progress_handler: uploadProgress,
            upload_error_handler: uploadError,
            upload_success_handler: uploadSuccess,
            upload_complete_handler: uploadComplete,
            //debug_handler: debug_function,
        },
        fileQueued: fileQueued,
        fileQueueError: fileQueueError,
        fileDialogComplete: fileDialogComplete,
        uploadStart: uploadStart,
        uploadProgress: uploadProgress,
        uploadSuccess: uploadSuccess,
        uploadError: uploadError,
        uploadComplete: uploadComplete,
        SWFUpload: SWFUpload
    };
})(FileProgress, SWFUpload);
