require(["common/xmly.upload","plugin/swfupload/swfupload.queue"], function (xmlyUpload,SWFUpload) {
		
        var ss = new xmlyUpload({
				// Backend Settings
				file_dialog_complete_handler : function() {
					alert(66);
				},
				
				button_placeholder_id : "uploadBtn",
				button_text : 'Select',
				
			});

			function file_dialog_complete_handler (argument) {
				console.log(11);
			}
});