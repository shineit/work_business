(function($) {
    var defaultOptins = {
        target : 'progress_wrapper',
        upReset : false,
        singleFile : false 
    } 

    var template = '<div class="progressBar"><div class="progress">' +
                '<div class="warp"><span class="uploading"></span><span class="info">上传进度：0M/0M</span></div>' +
                '<div class="warp"><span class="converting" style="width:0;"></span><span class="info">等待转码</span></div></div> <div class="progMask"></div>' +
                '<input class="fileid" type="hidden" name="audioId"/></div>';
    //专辑进度条
    template = '<li>' +
        '<div class="albumList_r1 cl">' +
        '<div class="number new">${order}</div>' +
        '<div class="albumList_sound">' +
        '<div class="soundInfo">' +
        '<div class="unedit"><span class="tit" title="${file.title}">${shortTitle}</span><a class="editBtn forbid-drag"></a></div>' +
        '<div class="edit  forbid-drag"><input type="text" value="${file.title}" name="audioName" ><a class="editConfirm">确认</a><a class="cancel btn-close">取消</a></div>' +
        '</div>' +
        '<span class="c01"></span>'+
        '</div>' +
        '<div class="fr">' +
        '<div class="albumList_status"><span class="waitUpload">等待上传</span></div>' +
        '<a class="${isDel} forbid-drag"></a>' +
        '</div>' +
        '</div>' +
        '<div class="uploadStatus">' +
        template +
        '<span class="albumList_arrow"><i></i></span>' +
        '</div>' +
        '</li>';


    function FileProgress(options) {
        this.init(options);
    }

    FileProgress.prototype.setTimer = function (timer) {

    };
    FileProgress.prototype.getTimer = function (timer) {

    };


    /**
    *   初始化对象
    **/
    FileProgress.prototype.init = function(options) {
        var _this = this , file = options.file, target = options.target,
            singleFile = options.singleFile,
            unReset = !!options.unReset;
        this.options = options;
        this.fileProgressID = file.id;
        file.title = file.title || file.name.replace(file.type, "");
        this._file = file;
        this.opacity = 100;
        this.height = 0;
        this.file_upload_limit = options.upload_limit || 50; //上传的文件限制
        this.isSingleFileSelected = singleFile;
        var $con_multi = $("#multiFile"),
            title = $("#sound_title");

        if(!singleFile){ $con_multi.find(".editAlbum").show(); }

        this.fileProgressWrapper = $("#" + file.id); 
        if (this.fileProgressWrapper.length == 0) {//如果该进度条不存在，需要创建
            this.newProgress();
        }

        this.fileUploadingProgress = this.fileProgressWrapper.find(".uploading");
        this.fileUploadingStatus = this.fileUploadingProgress.next(".info");
        this.fileTranscodingProgress = this.fileProgressWrapper.find(".converting");
        this.fileTranscodingStatus = this.fileTranscodingProgress.next(".info");
        this.fileProgressContainer = $con_multi.find("." + target);

        if(this.file_upload_limit === 1){  //只能上传一条时， 不显示继续上传按钮
            $(".goOnXMUploadBtn").addClass('hidden');
        }
        
        $con_multi.find("#upload_file_sum").html(this.fileProgressContainer.children().size()); // 初始总上传文件数
        this.setDrag();  //初始化拖动
        this.bindEvents(); //初始化绑定事件
    };


    /**
    *   新建进度条
    **/
    FileProgress.prototype.newProgress = function() {
        var con_multi = $("#multiFile"),
            input_isalbum = $("#isalbum"),
            title = $("#sound_title"),
            file = this.options.file,
            target = this.options.target;
            this.fileProgressContainer = con_multi.find(".progressBarContainer");
        
        con_multi.show();
        if(this.isSingleFileSelected){
            input_isalbum.val("false");
        }else{
            input_isalbum.val("true");
        }

        title.val(file.title);
        
        var order = this.fileProgressContainer.children().length + 1;

        //模板解析 S
        template = template.replace(/\$\{order\}/g, order);//序号
        template = template.replace(/\$\{file\.title\}/g, file.title); //文件名
        template = template.replace(/\$\{shortTitle\}/g, this.shortTitle(file.title)); //处理过的文件名
        template = template.replace(/\$\{isDel\}/g, ("del")); //删除按钮
        // template = template.replace(/\$\{isDel\}/g, (this.isSingleFileSelected?"":"del")); //删除按钮
        //模板解析 E 

        this.fileProgressWrapper = $(template);
        this.fileProgressWrapper.attr("id", this.fileProgressID);
        if ($("#set-top").is(":checked")) {
            //新上传声音排最前
            this.fileProgressContainer.prepend(this.fileProgressWrapper);
            this.resetOrderNumber();
        } else {
            this.fileProgressContainer.append(this.fileProgressWrapper);
        }

    };


    /**
    *   进度条事件绑定
    **/
    FileProgress.prototype.bindEvents = function () {
        var $wrap = this.fileProgressWrapper,
            _this = this,
            $soundInfo = $wrap.find(".soundInfo");

        if($wrap.attr("binded-events")){
            return;
        }
        $wrap.attr("binded-events", true);
        //编辑按钮
        $wrap.on("click", ".editBtn", function () {
            var $btn = $(this);
            $soundInfo = $btn.closest(".soundInfo");
            var $tit = $soundInfo.find(".tit"),
                $input = $soundInfo.find(".edit input"),
                tit_width = $tit.width();
           // $input.width(tit_width > 430 ? 430 : tit_width);

            $soundInfo.find(".unedit").hide();
            $soundInfo.find(".edit").show();
        });
        //保存
        $wrap.on("click", ".editConfirm, .cancel", function () {
            var $btn = $(this);
            $soundInfo = $btn.closest(".soundInfo");
            var $tit = $soundInfo.find(".tit"),
                $input = $soundInfo.find(".edit input");
            if ($btn.hasClass("editConfirm")) {
                var val = $.trim($input.val());
                if (val && _this.checkTitle(val)) {
                    var val_tmp = _this.shortTitle(val);
                    $tit.text(val_tmp).attr("title", val);
                    _this._file.title = val;
                    _this.titleRight();
                } else {
                    _this.titleError();
                    return;
                }
            } else {
                $input.val($tit.text());
            }
            $soundInfo.find(".unedit").show();
            $soundInfo.find(".edit").hide();
        });
        //错误提醒
        $wrap.on("click", ".js-errorLog", function(){
            var $el = $(this);
            var errorLogId = $el.attr("errorLog");
            // var text = helper.ErrorLog.getLogText(errorLogId);
            // var op = {
            //     content: '<div style="word-break: break-all;word-wrap: break-word;padding:10px">'+text+"</div>",
            //     width:480,
            //     title:"错误详情"
            // };
            // var pop = new dialog.Dialog(op);
            // pop.open();
            return false;
        });

    };

    /**
    *   文件名称检验长度 
    **/
    FileProgress.prototype.checkTitle = function(title){  
        var gblen = $.trim(title).replace(/[^\x00-\xff]/ig, 'xx').length;
        if(gblen > 80){
            return false;
        }
        return true;
    };

    FileProgress.prototype.titleRight = function(){
        var $wrap = this.fileProgressWrapper,
            $albumList_r1 = $wrap.find(".albumList_r1");
        $albumList_r1.removeClass("is-error");
    };

    FileProgress.prototype.titleError = function(info){
        info = info || "标题长度不符合要求,系统要求1-80字节";
        var $wrap = this.fileProgressWrapper,
            $albumList_r1 = $wrap.find(".albumList_r1"),
            $info = $albumList_r1.find(".c01");
        $albumList_r1.addClass("is-error");
        $info.text(info); 
    };

    FileProgress.prototype.shortTitle = function(title, len){
        len = len || 45;
        var cut_str = this.cutStr(title, len);
        if(cut_str != title){
            cut_str += "...";
        }
        return cut_str;
    };

    FileProgress.prototype.cutStr = function (str, len) {
        var lens = $.trim(str).replace(/[^\x00-\xff]/ig, 'xx').length;
        if(lens<=len){
            return str;
        }else{
            str = str.substring(0, str.length-1);
            return arguments.callee(str, len);
        }
    };


    FileProgress.prototype.reset = function () {
        this.fileUploadingProgress.width("0");
        this.appear();
    };

    FileProgress.prototype.setUuid = function (id) {
        this.fileProgressWrapper.find(".fileid").val(id);
        this.appear();
    };

    FileProgress.prototype.setTrackData = function (data) {
        this.fileProgressWrapper.find(".track_data").val(data);
    };


    FileProgress.prototype.setComplete = function () {


    };
    FileProgress.prototype.setError = function () {
        var $status = this.fileProgressWrapper.find(".albumList_status"),
            $uploadStatus = this.fileProgressWrapper.find(".uploadStatus");
        $status.find("span").removeClass().addClass("failIcon").html('上传失败,请删除');
        this.fileProgressWrapper.attr("status",FileProgress.STATUS.UPLOAD_ERROR);
        $uploadStatus.slideDown(1000);
    };
    FileProgress.prototype.setCancelled = function () {
        var oSelf = this;
        this.setTimer(setTimeout(function () {
            oSelf.disappear();
        }, 2000));
    };
    FileProgress.prototype.setStatus = function (status) {
        this.fileUploadingStatus.html(status);
    };

    FileProgress.prototype.beforeCancel = function (show, swfUploadInstance, callback) {

    };

// Show/Hide the cancel button
    FileProgress.prototype.toggleCancel = function (show, swfUploadInstance, callback) {

        if (this.isSingleFile) return;
        var _this = this;
        var closeBtn = this.fileProgressWrapper.find("a.del");
        var $upload_file_sum = $("#upload_file_sum");
        var $progressBarContainer = this.fileProgressWrapper.closest(".progressBarContainer");
        var is_edit = location.href.indexOf("edit_album") !== -1;
        // if (show) {
        //     closeBtn.show();
        // } else {
        //     closeBtn.hide();
        // }


        var fileID = this.fileProgressID;
        var _this = this;
        var _event = function () {
            _this.fileProgressWrapper.addClass("fileprogress_removed");
            var $lis = $progressBarContainer.find("[drag_able]").not(".fileprogress_removed");
            var lis_size = $lis.size();
            if(lis_size == 1 && !is_edit){
                // $lis.find("a.del").removeClass("del");
            }
            $upload_file_sum.text(lis_size);

            closeBtn.unbind("click");
            if (swfUploadInstance) {
                swfUploadInstance.cancelUpload(fileID);
                if (swfUploadInstance.cancelTranscoding) {
                    swfUploadInstance.cancelTranscoding(fileID);
                }
            }
            if ($.isFunction(callback)) {
                callback(fileID);
            }
            _this.disappear();
        };
        closeBtn.unbind("click");
        closeBtn.bind("click", function () {
            var $parent =  _this.fileProgressWrapper.parent(),
                callback = function(){
                    _event();
                };
            if(_this.file_upload_limit === "1"){
                // $('.goOnXMUploadBtn').removeClass('hidden');
                $(".goOnXMUploadBtn").css("left","0");
            }
            var result = $parent.triggerHandler("beforeCancel", [callback, _this.fileProgressWrapper]);
            if ( !result) {
                _event();
            }

        });

    };

    FileProgress.prototype.appear = function () {

    };

// Fades out and clips away the FileProgress box.
    FileProgress.prototype.disappear = function () {
        var _this = this;
        var wrapper = this.fileProgressWrapper;
        wrapper.animate({"height": 0}, 1000, function () {
            wrapper.remove();
            wrapper = null;
            _this.resetOrderNumber();
        });
    };

    FileProgress.prototype.destroy = function () {
        var wrapper = this.fileProgressWrapper;
        wrapper.remove();
        this.resetOrderNumber();
    };
    FileProgress.prototype.hide = function () {
        var wrapper = this.fileProgressWrapper;
        wrapper.hide();
    };
    FileProgress.prototype.uploadStart = function () {
        var  $uploadStatus = this.fileProgressWrapper.find(".uploadStatus");
        $uploadStatus.slideDown(1000);
    };

    FileProgress.prototype.setProgress = function (percentage) {
        var member = percentage + "%";
        this.fileUploadingProgress.width(member);
        if (this.isSingleFile) {
            $("#singleFile").find(".p_tip em").text(parseInt(percentage / 2) + "%");
        } else {

            var $status = this.fileProgressWrapper.find(".albumList_status"),
                $uploadStatus = this.fileProgressWrapper.find(".uploadStatus");
            $status.find("span").removeClass().addClass("areUploading").html('正在上传(' + parseInt(percentage / 2) + '%)');
        }
        this.appear();
    };

    FileProgress.prototype.setAttr = function (name, value) {
        this.fileProgressWrapper.attr(name, value);
    };

    FileProgress.prototype.setTranscodingStatus = function (status) {
        this.fileTranscodingStatus.html(status);
    };
    FileProgress.prototype.resetTranscodingProgress = function () {
        this.fileTranscodingProgress.width("0");
    };


    FileProgress.prototype.setTranscodingSuccess = function (data) {
        if(this._transcodingSuccess){
            return;
        }
        this._transcodingSuccess = true;
        this.fileProgressWrapper.attr("status", FileProgress.STATUS.TRANSCODE_SUCCESS);
        var id;
        if(data && data.data && data.data[0] ){
            //刚上传的声音
            id = data.data[0].uploadTrack.id;
            var _this = this;
            this.getSoundUrl(id, function(path){
                var obj = {
                    sound_extension:true,
                    sound_url:path,
                    sound_id:"upload_"+id
                };
                _this.createPlayer(obj);
            });
        }else{
            //已经有的声音
            var preplay_id = this.fileProgressWrapper.attr("preplay_id");
            if(preplay_id){
                this.fileProgressWrapper.attr("sound_id", preplay_id);
                this.createPlayer({
                    sound_id:preplay_id
                });
            }else if(data && data.sound_id){
                this.createPlayer({
                    sound_id:data.sound_id
                });
            }else{
                this.createPlayer();
            }
        }

    };
    //根据上传完成返回的id获取转码后的播放url
    FileProgress.prototype.getSoundUrl = function(id, callback){
        var url = 'http://test.ximalaya.com/dtres/jsonp/uploader/transcode/url';
        xm.jsonp.uploader.transcodeUrl = function(data) {
            callback(data.url);
        };

        $.ajax({
            url:url,
            type:'get',
            data:{uploadTrackId:id},
             // data:{uploadTrackId:130277},
            dataType:"jsonp",
            jsonpCallback: "xm_jsonp_uploader_transcodeUrl"
            // success:function(data){
            //     callback(data.url);
            // }
        }).complete(function (e) {
            console && console.log(e);
        });
    };
    //播放按钮
    FileProgress.prototype.createPlayer = function(attr){
        var playerClsAlbum = "uploadPlayer2",
            playerClsSound = "btn-player";

        var playerHtml = '<div class="btn-player {playerCls}  forbid-drag">' +
            '<a title="试听" class="playBtn"></a>' +
            '</div>';
        var $container;
        playerHtml = playerHtml.replace("{playerCls}",playerClsAlbum );
        if(!attr) playerHtml = "";
        this.transcodingSuccess(playerHtml);
        $container = this.fileProgressWrapper;

        // if (this.isSingleFile) {
        //     playerHtml = playerHtml.replace("{playerCls}",playerClsSound );
        //     $container = $("#singleFile");
        //     if(!attr) playerHtml = "";
        //     $container.find(".p_tip").html("上传成功&nbsp;<em>试听</em>"+playerHtml);
        // }else{
        //     playerHtml = playerHtml.replace("{playerCls}",playerClsAlbum );
        //     if(!attr) playerHtml = "";
        //     this.transcodingSuccess(playerHtml);
        //     $container = this.fileProgressWrapper;
        // }
        if(attr){
            $container.attr(attr);
        }
        xm.player.setup();
        $("[sound_id]").xmPlayer();
        // player.render({$container:$container});
    };

    FileProgress.prototype.transcodingSuccess = function (playerHtml) {
        var $uploadStatus = this.fileProgressWrapper.find(".uploadStatus");
        var $status = this.fileProgressWrapper.find(".albumList_status");
        $uploadStatus.stop().slideUp(1000);
        if(this.fileProgressWrapper.is("[is-exist=true]")){
            $status.find("span").removeClass().addClass("successIcon").html('').css("background","none");
        }else{
            $status.find("span").removeClass().addClass("successIcon").html('上传成功');
        }
        var $status_parent = $status.parent();
        if($status_parent.find(".uploadPlayer2").size()>0){
            return;
        }
        $status_parent.append(playerHtml);
    };

    FileProgress.prototype.setTranscodingProgress = function (percentage) {
        this.fileTranscodingProgress.width(percentage + "%");
        if (this.isSingleFile) {
            $("#singleFile").find(".p_tip em").text(parseInt(percentage / 2 + 50) + "%");
        } else {
            var $status = this.fileProgressWrapper.find(".albumList_status");
            $status.find("span").removeClass().addClass("areUploading").html('正在上传(' + parseInt(percentage / 2 + 50) + '%)');
        }

        this.appear();
    };

    FileProgress.prototype.setTranscodingError = function () {
        var $status = this.fileProgressWrapper.find(".albumList_status");
        $status.find("span").removeClass().addClass("failIcon").html('上传失败,请删除');
        this.fileProgressWrapper.attr("status",FileProgress.STATUS.TRANSCODE_ERROR);
    };
    FileProgress.prototype.setOnErrorTimer = function (timer) {
        this.timer = timer;
    };
    FileProgress.prototype.getOnErrorTimer = function () {
        return this.timer;
    };

    FileProgress.prototype.resetOrderNumber = function () {
        var $container = this.fileProgressContainer,
            $items = $container.children(),
            max = $items.size();
        for (var i = 0; i < max; i++) {
            $items.eq(i).find(".number").text(i + 1);
        }

        $("#multiFile").find("#h_info").html("批量上传(" + max + ")");
    };
    //设置拖动
    FileProgress.prototype.setDrag = function () {
        //return false;
        var wrapper = this.fileProgressWrapper,
            _this = this;
        if (wrapper.attr("drag_able")) {
            return;
        }
        wrapper.attr("drag_able", true);
        var parent = wrapper.parent();
        var holder = $('<li class="albumItem-holder"></li>');
        var $move_tip = $(".dragIcon");
        if ($move_tip.length == 0) {
            $move_tip = $('<div class="dragIcon">拖动改变顺序</div>');
            $("body").append($move_tip);
        }
        var moveFn = function (e) {
            $move_tip.css({
                left: e.pageX + 20,
                top: e.pageY - 10
            });
        };
        var $target = wrapper.find(".albumList_r1"),
            $doc = $(document);

        wrapper.bind({
            mouseover: function (e) {
                var $target = $(e.target);
                if (!$target.hasClass("forbid-drag") && $target.closest(".forbid-drag").size()==0) {
                    $move_tip.show();
                    $doc.on("mousemove", moveFn);
                    moveFn(e);
                }
            },
            mouseleave: function () {
                $move_tip.hide();
                $doc.off("mousemove", moveFn);
            },
            mouseout: function () {
                $move_tip.hide();
                $doc.off("mousemove", moveFn);
            }
        });

        var $win = $(window),
            $dom = $(document);

        wrapper.easydrag(true);
     //   wrapper.setHandler($target);

        wrapper.beforeDrag(function (e, element) {
            var $target = $(e.target);
            if($target.hasClass("forbid-drag") || $target.closest(".forbid-drag").size()>0){
                return true;
            }
           
            var $this = $(this);
            wrapper.after(holder);
            var height = wrapper.height();
            holder.height(height);

            var offsetY = wrapper.offset().top - e.pageY;

        });
        function onScroll(e){
            var data = e.data,
                element = data.element,
                offsetY = data.offsetY,
                clientY = data.e.clientY,
                $el = $(element),
                parentTop = $el.parent().offset().top;
            var top = clientY + $dom.scrollTop() -parentTop + offsetY;
            if(window.console) console.log(top);
            $el.css("top", top);
            onDrag(data.e, element);
        }

        function onDrag(e, element){
            var $this = $(element);
            $this.css({left: 0, zIndex: 10});
            var height = $this.outerHeight();
            var top = $this.position().top;
            var center = top + height / 2;
            //向下移动
            var next = holder.next();
            if (next.attr("id") == $this.attr("id")) {
                next = next.next();
            }

            if (next.size() != 0) {
                var next_center = next.position().top + next.outerHeight() / 2;
                if (center > next_center) {
                    holder.insertAfter(next);
                    onDrag(e, element);
                    return;
                }
            }
            //向上移动
            var prev = holder.prev();
            if (prev.attr("id") == $this.attr("id")) {
                prev = prev.prev();
            }

            if (prev.size() != 0) {
                var prev_center = prev.position().top + prev.outerHeight() / 2;
                if (center < prev_center) {
                    holder.insertBefore(prev);
                    onDrag(e, element);
                    return;
                }
            }
        }
        wrapper.ondrag(function (e, element) {
            onDrag(e, element);
        });
        wrapper.ondrop(function (e, element) {
            $win.off("scroll", onScroll);
            var $this = $(element);
            $this.insertAfter(holder);
            holder.remove();
            $this.css({position: 'relative', left: "", top: '', zIndex: ""});
            _this.resetOrderNumber();

        });
    };



    var fileProgressUtil = { //外部调用对象  例： fileProgressUtil.createProgress();
        instances : {},
        addInstance : function(file,fp) {//添加进度条实例
            this.instances[file.id] = fp;
        },
        delInstance : function (file) {//移出进度条实例
            delete this.instances[file.id];
        },
        createProgress : function(options) {
            var file =  options.file,instance = this.instances[file.id];
            if(!instance){
                instance= new FileProgress(options);
                this.instances[file.id] = instance;
            }
            if (!options.unReset) {
                instance.reset();
            }
            return instance;   
        }
    };

    FileProgress.STATUS = {
        UPLOAD_SUCCESS : "1",  //上传成功
        UPLOAD_ERROR :   "-1",  //上传失败
        TRANSCODE_SUCCESS: "2",  //转码成功
        TRANSCODE_ERROR:  "-2"   //转码失败
    }
    fileProgressUtil.STATUS = FileProgress.STATUS;

    window.fileProgressUtil = fileProgressUtil;

})($);
    