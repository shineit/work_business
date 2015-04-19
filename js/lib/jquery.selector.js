(function ($) {
    var $window = $(window);

    function doInit(jq) {
        var $jq = $(jq),
            options = $jq.Selector("options"),
            timeid = 0;

        options.select = $jq.find(".xm-selector-data");
        options.ul = $jq.find(".xm-selector-list");
        options.arrow = $jq.find(".xm-selector-arrow");
        options.title = $jq.find(".xm-selector-title");

        options.width && $jq.width(options.width);
        options.height && $jq.height(options.height);

        options.width = $jq.width();
        options.height = $jq.height();
        options.isOpen = $jq.hasClass("open");
        options.isMuti = !!options.select.attr("multiple");

        options.ul.width(options.width).empty();
        //初始化ul
        listToUl(options.ul, options.select);
        //设置title
        setTitle(options);

        options.arrow.on("blur.selector", function (e) {
            clearTimeout(timeid);
            !e.data && $jq.hasClass("open") && (timeid = setTimeout(function () {
                $jq.removeClass("open");
            }, 500));
            return false;
        }).on("focus", function () {
            clearTimeout(timeid);
            return false;
        }).focus();
        //箭头点击事件
        options.arrow.on("click.selector", function () {
            clearTimeout(timeid);
            //判断是否展开
            !$jq.hasClass("open") && setDirection($jq, options);

            $jq.toggleClass("open");
            return false;
        });

        //select控件更改事件
        options.select.on("change.item", function (e) {
            setValue(jq, e.currentTarget.value, true);
        });

        //数据项点击事件
        options.ul.on("click.item", ".xm-selector-item", function (e) {
            var $this = $(this);
            var $option = options.select.find("option[value='" + $this.attr("data-value") + "']");

            //除去单选的selected
            !options.isMuti && options.ul.find(".selected").toggleClass("selected");

            $this.toggleClass("selected");

            //如果是单选
            if (!options.isMuti) {
                options.select.get(0).selectedIndex = $option.get(0).index;
                options.title.text($option.get(0).text);
            } else { //如果是多选
                $option.get(0).selected = !$option.get(0).selected;
                setTitle(options);
                options.arrow.focus();
            }
            $jq.removeClass("open");

            return false;
        }).on("item.muti", ".xm-selector-item", function () {
            if (!options.isMuti) return;
            var $options = options.select.find("option:selected");

            options.ul.find(".selected").toggleClass("selected");
            $options.each(function () {
                this.selected = false;
                var $li = options.ul.find("[data-value='" + this.value + "']");
                $li.trigger("click.item");
            });

            return false;
        }).on("click.triggerevent", ".xm-selector-item", function () {
            options.select.trigger("change.^");

            return false;
        }).on("click.xm-item", ".xm-item", function () {
            options.arrow.focus();

            return false;
        }).on("mouseenter", function () {
            options.arrow.trigger("blur.selector", [true]);
            setTimeout(function () {
                clearTimeout(timeid);
            }, 100);
            return false;
        }).on("mouseleave", function () {
            options.arrow.focus();
            console.log("mouseleave");
        });
    }

    //设置title值
    function setTitle(options) {
        var texts = options.select.find("option:selected").map(function () {
            return this.text;
        }).toArray();
        options.title.text(texts.join(','));
    }
    //设置选中值
    function setValue(jq, val, isMuti) {
        var $jq = $(jq),
            options = $jq.Selector("options");
        $select = $jq.find(".xm-selector-data"),
        $li = $jq.find("[data-value='" + val + "']");
        option = $select.find("option[value='" + val + "']");

        if (options.isMuti && isMuti) {
            $li.trigger("item.muti");
        } else if (options.isMuti) {
            !option.get(0).selected && $li.trigger("click.item");
            $li.trigger("item.muti");
        }
        else {
            $li.trigger("click.item");
        }

        return $jq;
    }

    //得到选中值
    function getValue(jq) {
        var $jq = $(jq),
            options = $jq.Selector("options");

        return options.select.val();
    }

    //设置select选项展开方向                                                                                                                                                                                                 
    function setDirection($jq, options) {
        var current = $jq.offset().top,       //当前元素top值
			top = $window.scrollTop(),        //滚动条位置
			bottom = top + $window.height(),  //屏幕底部位置
            optionHeight = options.height,
			upHeight = current - top,         //元素距离屏幕顶部高度
			downHeight = bottom - current - optionHeight,   //元素距离屏幕底部高度
            ulHeight = 0;      //ul高度

        //默认显示样式：向下、不调节高度
        options.ul.css({ top: optionHeight, height: 'auto' });
        ulHeight = options.ul.height();  //ul高度

        //如果在上边显示
        if (upHeight > downHeight) {
            ulHeight >= upHeight ? options.ul.css({ top: upHeight * -1 }).height(upHeight) : options.ul.css({ top: ulHeight * -1 });
        }
            //如果在下边显示且高度不够
        else if (ulHeight > downHeight) {
            options.ul.height(downHeight);
        }

        /*//如果下边能显示
		if(ulHeight <= downHeight){
			
		}
		//如果上边能显示
		else if(ulHeight < upHeight){
			options.ul.css({top:ulHeight*-1});
		}
		//两边都不能显示
        //如果下面空间大
		else if(downHeight >= upHeight){
            options.ul.height(downHeight);  
        }
        //如果上边空间大
        else{
            options.ul.css({top:upHeight*-1}).height(upHeight);;
        }	*/
    }

    //select内容添加到ul
    function listToUl($to, $from) {
        $from.children().each(function () {
            this.nodeName.toLowerCase() == 'optgroup' ? groupToUl($to, this) : optionToLi($to, this);
        });
    }
    //optgroup内容添加到ul
    function groupToUl($ul, optgroup) {
        var $optgroup = $('<ul class="xm-selector-optgroup" data-label="' + optgroup.label + '" ></ul>').appendTo($('<li class="xm-item"><strong class="xm-item-label">' + optgroup.label + '</strong></li>').appendTo($ul));
        listToUl($optgroup, $(optgroup));
    }

    //option内容添加到li
    function optionToLi($ul, option) {
        $ul.append("<li class='xm-selector-item " + (option.selected ? "selected" : "") + "' data-value='" + option.value + "'>" + option.text + "</li>");
    }

    //添加新项
    function addItem(jq, opts) {
        var $jq = $(jq);
        $jq.each(function () {
            var options = $(this).Selector('options');
            if (!opts.value || !opts.text) return $jq;

            var option = document.createElement("option");
            option.text = opts.text;
            option.value = opts.value;
            options.select[0].add(option);
            optionToLi(options.ul, option);
        });

        return $jq;
    }

    //初始化函数
    $.fn.Selector = function (method, options) {
        if (typeof method == "string") {
            return $.fn.Selector.methods[method] ? $.fn.Selector.methods[method](this, options) : this;
        }
        method = method || {};
        return this.each(function () {
            var data = $.data(this, "selector");
            if (data) {
                $.extend(data.options, method);
            }
            else {
                data = $.data(this, "selector", {
                    options: $.extend({}, $.fn.Selector.defaults, method)
                });
                doInit(this);
            }
        });
    };
    //提供的方法
    $.fn.Selector.methods = {
        options: function (jq, key) {
            key = key || "options";
            return $.data(jq[0], "selector")[key] || {};
        },
        setValue: function (jq, val) {
            return setValue(jq, val);
        },
        getValue: function (jq) {
            return getValue(jq);
        },
        addItem: function (jq, opts) {
            return addItem(jq, opts);
        }
    };
    //默认参数值
    $.fn.Selector.defaults = {
        isMuti: false,
        width: 0,                      //控件宽度
        height: 0,                     //控件高度
        isOpen: false,                 //是否打开标志位
        onchange: function () { },
        current: {

        }
    };

})(jQuery);