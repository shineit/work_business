message = {
	timer : '',
	unreadCount : 0,
	$el : '',
	init : function  () {
		this.$el = $(".header .msg");
		
		//做轮循来获取未读的信息
		var _this = this;
		this.timer = setInterval(function () {
			_this.getNewMessage();
		},10 *1000);
	},
	getNewMessage : function () {
		var _this = this;
		$.ajax({
			url:  '/message/messagecount',
			dataType:'json',
			success:function (data) {
				console && console.log(data);
				if(data.code == 200){
					_this.unreadCount = data.data ;
					if(_this.unreadCount == 0){
						_this.$el.addClass('hidden').html('0');
					}else{
						_this.$el.removeClass('hidden').html(""+_this.unreadCount);
					}
					
				}
			}
		}); 
	}
}

$(function() {
	message.init();	
})
