/* jquery ajax 封装 */
window.xm ? window.xm.component = {} : window.xm = {component: {}};
window.xm.component.ajaxModel = {
	_ajax: function(type, url, data, custom) {

		return $.ajax({
			url: url,
			data: data,
			type: custom.type || type,
			dataType: "json",
			cache: false,
			beforeSend: function() {
				custom.beforeSend && custom.beforeSend(arguments);
			},
			success: function() {
				custom.success && custom.success(arguments);
			},
			complete: function() {
				custom.complete && custom.complete(arguments);
			},
			error: function() {
				custom.error && custom.error(arguments);
			}
		});
	},
	getData: function(url, data, custom) {
		return this._ajax("get", url, data, custom || {});
	},
	postData: function(url, data, custom) {
		return this._ajax("post", url, data, custom || {});
	}
};

/* dialog 封装  -> xDialog*/
window.xm.component.xDialog = function(option) {
	var opt = {
		title: '',
		content: '',
		// quickClose: false,
		okValue: '确定',
		cancelValue: '取消',
		width: "360px",
		cancel: function(argument) {
			this.close();
		}
	};
	return dialog($.extend(opt, option));
}