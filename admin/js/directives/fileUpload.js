+(function (angular) {
    var module = angular.module("fileUpload", [])
        .directive("fileupload", function () {
            return {
                restrict: 'E',
                replace: true,
                template: [
                    '<div class="fileUpload">',
                    '   <span class="btn btn-default btn-file">上传文件',
                    '       <input type="file" />',
                    '   </span>',
                    '   <span ng-transclude></span>',
                    '   <div class="progress" ng-show="isUpload"> ',
                    '       <div class="progress-bar" ng-style="progress"></div>',
                    '   </div>',
                    '   <div ng-bind-html="myHTML"></div>',
                    //'   <div class="input-group" ng-show="files.length>0">',
                    //'       <label></label>',
                    //'       <table class="table table-striped table-hover table-bordered">',
                    //'           <tr ng-repeat="file in files">',
                    //'              <td><label>{{file.fileName}}</label></td>',
                    ////'              <td>{{file.fileSize/1024|number:2}}kb</td>',
                    //'              <td><a class="btn btn-link btn-xs" ng-click="doDelFile($index)">删除</a></td>',
                    //'           </tr>',
                    //'       </table>',
                    //'   </div>',
                    '</div>'
                ].join(''),
                transclude: true,
                scope: {
                    files: "=files",
                    success: "=success",
                    doDelFileCallback: "=delete"
                },
                controller: function ($scope, $element, $attrs, $transclude, $http) {
                    var $btn = $element.find(".btn-file input").attr("id", "btnFile" + handlers.getCount());

                    $scope.progress = "";
                    $scope.isUpload = false;
                    $scope.maxcount = $attrs.maxcount || 1;

                    !$scope.doDelFile && ($scope.doDelFile = function (index) {
                        var state = swfu.getStats();

                        state.successful_uploads--;
                        swfu.setStats(state);
                        $scope.doDelFileCallback && angular.isFunction($scope.doDelFileCallback) && $scope.doDelFileCallback(index);
                    });

                    var swfu = new handlers.SWFUpload($.extend({}, handlers.settings, {
                        button_placeholder_id: $btn.attr("id"),
                        button_window_mode: handlers.SWFUpload.WINDOW_MODE.TRANSPARENT,
                        button_action: $attrs.multiple != "true" ? handlers.SWFUpload.BUTTON_ACTION.SELECT_FILE : handlers.SWFUpload.BUTTON_ACTION.SELECT_FILES,

                        flash_url: config.staticUrl + "/js/plugins/swfupload/swfupload.swf",
                        button_width: "80",
                        button_height: "29",
                        button_text: '<span></span>',
                        button_text_left_padding: 0,
                        button_text_top_padding: 0,

                        file_types: $attrs.filetype || "",

                        upload_url: $attrs.uploadurl,
                        file_upload_limit: $scope.maxcount,
                        uploadStart: function (file) {

                        },
                        file_dialog_complete_handler: function (numFilesSelected, numFilesQueued) {
                            if (numFilesSelected > 0) {
                                if ($scope.files.length >= $scope.maxcount) {
                                    alert("超过最大上传限制！");
                                    return;
                                }
                                $scope.$apply(function () {
                                    $scope.isUpload = true;
                                });
                                this.startUpload();
                            }
                        },
                        upload_start_handler: function (file) {
                            $scope.$apply(function () {
                                $scope.isUpload = true;
                            });
                        },
                        upload_progress_handler: function (file, bytesLoaded, bytesTotal) {
                            var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);

                            $scope.$apply(function () {
                                $scope.progress = {
                                    width: percent + "%"
                                };
                            });
                        },
                        upload_error_handler: function (file, errorCode, message) {
                            $scope.$apply(function () {
                                $scope.isUpload = false;
                            });
                        },
                        upload_success_handler: function (file, serverData) {
                            $scope.success && angular.isFunction($scope.success) && $scope.success(serverData, swfu, file);
                        },
                        upload_complete_handler: function () {
                            setTimeout(function () {
                                $scope.$apply(function () {
                                    $scope.isUpload = false;
                                    $scope.progress = {
                                        width: 0
                                    };
                                });
                            }, 500);
                        }
                    }));
                },
                compile: function ($element, $attrs) {
                    var $temp = $("#" + $attrs.listtemplateid);

                    $element.append($temp.html());
                }
            };
        });
})(angular);