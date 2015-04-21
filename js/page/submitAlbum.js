(function($) {


	$(function() {

		$('.deleteAudio').on('click',function() {
			var url = $(this).attr('data-url');
			deleteAudio(url);
		});

		$('#commitAlbum').on('click',function() {
			var url = $(this).attr('data-url');
			complateSubmit(url);
		});

	});

	var dialog = window.xm.plugin;

	/**
	 * 删除声音
	 * @return {[type]} [description]
	 */
	function deleteAudio(url) {
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
			,
			{
				yesText : '确认'
			}
		);
	};

	/**
	 * 完本提交
	 * @return {[type]} [description]
	 */
	function complateSubmit(url) {
		dialog.confirm('提交完本申请后不可撤销哟！<br>您确定本次创作已经全部完成了吗？',
			function() {
				$.ajax({
					url : url ,
					type : 'PUT',
					success : function(data) {
						window.location.reload();
					}
				});
			}
			,{yesText : '提交'});
	};

})(jQuery);