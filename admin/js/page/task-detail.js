;(function($, ajaxModel, xDialog) {

	function TaskDetail() {
		this.init();
	}

	TaskDetail.prototype = {

		init: function(argument) {
			this.bindEvents();
			this.initPlayer();

		},
		bindEvents: function(argument) {
			var hEl = $('#entity'),
				entity = {
					id:hEl.attr('data-id'),
					author:hEl.attr('data-author')
				};

			
			$('[data-toggle="tooltip"]').tooltip();

			// 时间控件
			$(document).on('click focus','.input-date',function(){
				$(this).datepicker({
					minDate:0,
					changeMonth: true
				});
			});

			
			// 通过
			$('#auditPass').on('click', function(e) {
				var el = $(this);

				var data = {

				};
				

				var d = xDialog({
					title: '通过',
					content:  '<div class="dialog-content"><p>确认要通过此次完本审核吗？<br/>审核一旦通过，不可撤销哟~</p></div>',
					onshow: function(argument) {
						// console.log(this.node)
					},
					ok: function(argument) {
						ajaxModel.postData(el.attr("data-url"), data).then(function(res) {
							// TODO

						})

						console.log(this)
					},
					cancel: function(argument) {
						this.close();
					}
				});

				d.showModal();

				// e.preventDefault();
			});

			// 驳回
			$('#auditBack').on('click', function(e) {
				var el = $(this);
				var data = {

				};
				var d = xDialog({
					title: '驳回',
					content: '<div class="dialog-content"><p>确认要驳回此次完本申请吗？<br/>请填写驳回原因，以便主播修改</p><div class="form-group"><label for="message-text" class="sr-only">驳回原因</label><textarea class="form-control" id="message-text" placeholder="驳回原因"></textarea></div></div> ',
					quickClose: true,
					width: '360px',
					ok: function(argument) {
						ajaxModel.postData('/url/', data).then(function(res) {
							// TODO

						});
					}
				});
				d.showModal();

				e.preventDefault();
			});


			// 任务上下线
			$('#taskOperation').on('click', function(e) {
				var el = $(this),
					type = el.attr('data-type');

				var d = xDialog({
					title: '任务下线',
					content: '<div class="dialog-content"><p>确认要将此任务下线吗？<br/>任务下线后，用户在前台将无法找到此任务</p><div class="form-group"><label for="message-text" class="sr-only">任务下线原因</label><textarea class="form-control" id="message-text" placeholder="下线原因"></textarea></div>',
					width: '360px',
					onshow:function(){
						this.inputEl = $(this.node).find('textarea');
						if(type === 'takeoff1'){
							this.inputEl.remove();
							this.title('重新上线');
							this.inputEl.attr('placeholder','上线原因');
						}else{
							this.title('任务下线');
							this.inputEl.attr('placeholder','下线原因');
						}
					},
					ok: function(argument) {
						
						ajaxModel.postData(el.attr('data-url') || el.attr('href'), {'reason':this.inputEl.val().trim() || ''},{type:'PUT'}).then(function(res) {
							if(res.code === 200){
								window.location.reload();
							}else{
								alert(res.message || '操作失败');
							}

						});
					},
					cancel: function(argument) {
						this.close();
					}
				});
				d.showModal();

				e.preventDefault();
			});

			// 重新试音
			$('#auditAgain').on('click', function(e) {
				var data = {
					openCallStartTime:'2015-4-25',
					openCallEndTime:'2015-5-1'
				};
				var el = $(this),
					type = el.attr('data-type');

				var d = xDialog({
					title: '重新试音',
					content: '<div class="dialog-content sy-dialog"><form class="form-inline"><div class="form-group"><input class="form-control input-date a-start" placeholder="开始时间"/>&nbsp;至&nbsp;<input class="form-control a-end input-date" placeholder="结束时间"/></div></form></div>',
					width: '370px',
					onshow:function(){
						this.inputEl1 = $(this.node).find('.a-start');
						this.inputEl2 = $(this.node).find('.a-end');
					},
					ok: function(argument) {
						var s = this.inputEl1.val().trim(),
							e = this.inputEl2.val().trim();
						if(s === '' || e ===''){
							alert('请输入时间');
							return false;
						}
						if(e < s){
							alert('结束时间不小于开始时间');
							return false;
						}
						ajaxModel.postData(el.attr('data-url') || el.attr('href'), data).then(function(res) {
							if(res.code === 200){
								window.location.reload();
							}else{
								alert(res.message || '操作失败');
							}
						});
					},
					cancel: function(argument) {
						this.close();
					}
				});
				d.showModal();

				e.preventDefault();
			});

			// 邀约
			$('.audio-list .invite:not([disabled])').on('click', function(e) {
				var el = $(this),
					trEl = el.closest('tr'),
					author = entity.author;

				var d = xDialog({
					title: '邀约',
					content: '<div class="dialog-content"><p>确认要向主播【<span class="name">' + author + '</span>】发送工作邀约吗？<br/>邀约一旦发送，不可撤销哟~</p></div>',
					width: '360px',
					ok: function(argument) {
						// var url = '/task/'+ entity.id+'/sample/'+trEl.attr('data-id')+'/sendoffer'
						ajaxModel.postData(el.attr('data-url') || el.attr('href')).then(function(res) {
							if (res.code === 200) {
								window.location.reload();
								// 邀约按钮置灰
								// el.prop('disabled', true);
							}else{
								alert(res.message || '操作失败');
							}
						});
					},
					cancel: function(argument) {
						this.close();
					}
				});
				d.showModal();

				e.preventDefault();
			});

			//	拒绝 or 取消
			$('.audio-list .reject-invitation').on('click', function(e) {
				var el = $(this),
					trEl = el.closest('tr'),
					type = el.attr('data-type'); // [0 取消 1 拒绝]


				var data = {};

				// if (type === '0') {
				// 	// 当前取消状态
				// 	el.html("拒绝");
				// 	el.attr('data-status', 1);

				// } else {
				// 	el.html('取消');
				// 	el.attr('data-status', 0);
				// }

				ajaxModel.postData(el.attr('data-url') || el.attr('href')).then(function(res) {
					// TODO

					if (res.code === 200) {

						// 邀约按钮置灰
						el.prop('disabled', true);
					}
				});

			});
		},
		initPlayer:function(){
			xm.player.setup();
    		$("[sound_id]").xmPlayer();
    		
		}

	};







	$(function() {
		new TaskDetail();
	});




})(jQuery, window.xm.component.ajaxModel, window.xm.component.xDialog);