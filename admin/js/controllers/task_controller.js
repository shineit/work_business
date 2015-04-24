+(function (angular) {

    CSystem.c_module.controller("TaskController", function ($scope, $interval, $http, cfpLoadingBar) {
        $scope.searchModel = {
            searchUrl: "",
            status: null,
            taskId: null,
            doSearch: function () {
                var href = "";

                this.taskId && (href += "/taskid/" + this.taskId);
                this.status && (href += "/status/" + this.status);

                href && (location.href = this.searchUrl + href);
            }
        };
    });

    CSystem.c_module.controller("TaskCreateController", function ($scope, $rootScope, $http, $modal) {
        //字段
        $scope.formData = {
            "taskId": "",
            "entitle.entitleId": "",
            "entitle.workId": "",
            "entitle.workName": "",
            "entitle.workName1": "",
            "entitle.authorName": "",
            "entitle.authorAlisa": "",
            "entitle.categoryId": "",
            "entitle.totalWordCount": "",
            "entitle.workBrief": "",
            "entitle.studioStyleId": null,
            "entitle.openCallStartTime": "",
            "entitle.openCallEndTime": "",
            "entitle.fileContext": [{ value: "" }],//试音片段文本列表
            "entitle_fileContext1": "",
            "entitle_fileContext2": "",
            "entitle_fileContext3": "",
            "entitle_fileContext4": "",
            "entitle_fileContext5": "",
            "entitle_fileContext6": "",
            "expectedTotalTimeLength": "",
            "distributionType": "",
            "paymentOptionId": "",
            "prePayAmount": 0,
            "royaltyShareRatio": 0,
            "updateFrequency": "",
            "expectedSectionTimeLength": "",
            "theFirstSectionFinishedTime": "",
            "allSectionsFinishedTime": "",
            "entitle.contactName": "",
            "entitle.contactPhoneNo": "",
            "workCoverUrl": [],// 封面
            "audioScript": [] // 文稿
        }

        //试音片段文本列表
        $scope.filesContext = [];
        //添加试音片段文本
        $scope.doAddFileContext = function () {
            var index = $scope.formData["entitle.fileContext"].length ? $scope.formData["entitle.fileContext"][$scope.formData["entitle.fileContext"].length - 1] : 0;

            $scope.formData["entitle.fileContext"].push({
                value: ""
            });
        };
        //删除试音片段文本
        $scope.doRemoveFileContext = function (index) {
            $scope.formData["entitle.fileContext"].splice(index, 1);
        }
        //获取版权关联列表
        $scope.doGetWorks = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            function popup(items) {
                var modalInstance = $modal.open({
                    template: ['<div class="modal-header">',
                               '    <div class="panel-heading">',
                               '        <div class="panel-title">版权关联<a class="close pull-right" ng-click="doCancel()"><span>&times;</span></a></div>',
                               '        ',
                               '    </div>',
                               '</div>',
                               '<div class="modal-body">',
                               '    <h5>找到{{items.length}}条与“{{keyword}}”相关的记录：</h5>',
                               '    <div class="table-responsive">',
                               '        <table class="table table-bordered table-hover table-striped">',
                               '            <thead>',
                               '                <tr>',
                               '                    <td>ID</td>',
                               '                    <td>作品名</td>',
                               '                    <td>作者</td>',
                               '                </tr>',
                               '            </thead>',
                               '            <tr ng-repeat="item in items" ng-class="{info:$index==selectedIndex}" ng-click="doSelect($index)" >',
                               '                <td>{{item.workId}}</td>',
                               '                <td>{{item.workName}}</td>',
                               '                <td>{{item.authorName}}</td>',
                               '            </tr>',
                               '        </table>',
                               '    </div>',
                               '</div>',
                               '<div class="modal-footer">',
                               '    <button class="btn btn-primary" ng-click="doLink()">确认关联</button>',
                               '</div>',
                               ''].join(''),
                    controller: "WorkController",
                    size: "",
                    resolve: {
                        items: function () {
                            return items;
                        }, keyword: function () {
                            return $scope.formData["entitle.workName1"];
                        }
                    }
                });
                modalInstance.result.then(function (item) {
                    $scope.formData["entitle.workId"] = item.workId;
                    $scope.formData["entitle.workName"] = item.workName;
                    $scope.formData["entitle.workName1"] = item.workName;
                });
            }
            function popupnon() {
                var modalInstance = $modal.open({
                    template: ['<div class="modal-header">',
                               '    <div class="panel-heading">',
                               '        <div class="panel-title">版权关联<a class="close pull-right" ng-click="doCancel()"><span>&times;</span></a></div>',
                               '        ',
                               '    </div>',
                               '</div>',
                               '<div class="modal-body">',
                               '    <h5 class="text-center">没有找到与“{{keyword}}”相关的记录<br/>请先倒版权平台添加版权记录！</h5>',
                               '</div>',
                               '<div class="modal-footer">',
                               '    <button class="btn btn-primary" ng-click="doCancel()">知道了</button>',
                               '</div>',
                               ''].join(''),
                    controller: "WorkController",
                    size: "sm",
                    resolve: {
                        items: function () {
                            return [];
                        }, keyword: function () {
                            return $scope.formData["entitle.workName1"];
                        }
                    }
                });
                modalInstance.result.then(function (item) {
                    $scope.formData["entitle.workId"] = item.workId;
                    $scope.formData["entitle.workName"] = item.workName;
                });
            }

            if (!$scope.formData['entitle.workName1']) {
                alert("请填写作品名称进行搜索！");
                return;
            }

            $http({ method: 'GET', url: '/work/' + ($scope.formData['entitle.workName1'] || "") }).
                success(function (data, status, headers, config) {
                    if (data.code == 200) {
                        if (data.data && data.data.length) {
                            popup(data.data);
                        } else {
                            popupnon();
                        }
                    } else {
                        alert(data.message);
                    }
                }).
                error(function (data, status, headers, config) {

                });
        }
        //发布
        $scope.doDescribe = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            var data = $.extend({}, $scope.formData);
            var files = [];
            data.workCoverUrl = data.workCoverUrl[0].url;
            data.audioScript = JSON.stringify(data.audioScript);
            for (var filecontext in data['entitle.fileContext']) {
                files.push(data['entitle.fileContext'][filecontext].value);
            }
            data['entitle.fileContext'] = files;
            $http({
                method: $scope.formData["taskId"] ? "put" : "post",
                url: $scope.formData["taskId"] ? "/task/" + $scope.formData["taskId"] : "/task",
                data: data
            }).success(function (data, status, headers, config) {
                if (data.code == 200) {
                    data.data && !$scope.formData["taskId"] && ($scope.formData["taskId"] = data.data);
                    alert(data.message);
                } else {
                    alert(data.message);
                }
            });
        }
        //驳回
        $scope.doBack = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $http({
                method: "put",
                url: "/entitle/" + $scope.formData["entitle.entitleId"] + "/reject",
            }).success(function (data, status, headers, config) {
                if (data.code == 200) {
                    alert(data.message);
                } else {
                    alert(data.message);
                }
            }).error(function (data, status) {
                alert(status);
            });
        }
        //上传文稿成功回调
        $scope.audioScriptSuccess = function (responseData, swfu, file) {
            console.log(responseData);
            responseData = JSON.parse(responseData);
            if (responseData.code == 200) {
                $scope.formData.audioScript.push({
                    fileId: responseData.data,
                    title: file.name,
                    isDelete: false,
                    sequence: $scope.formData.audioScript.length + 1
                });
            }
            else {
                alert(responseData.message);
            }
        }
        //删除文稿
        $scope.doDelAudioScript = function (index) {
            $scope.formData.audioScript[index].isDelete = true;
        }
        //上传封面成功回调
        $scope.workCoverUrlSuccess = function (responseData, swfu) {
            responseData = JSON.parse(responseData);
            if (responseData && responseData.ret == 0) {
                responseData.data[0].uploadTrack.url = config.fdfs + "/" + responseData.data[0].uploadTrack.url;
                $scope.formData.workCoverUrl.push(responseData.data[0].uploadTrack);
            } else {
                var state = swfu.getStats();
                state.successful_uploads--;
                swfu.setStats(state);
                alert(responseData.msg);
            }
        }
        //删除封面图片
        $scope.doDelWorkCoverScript = function (index) {
            $scope.formData.workCoverUrl.splice(index, 1);
        }

        $scope.$watch($scope.formData["entitle.fileContext"], function () {
            console.log(arguments);
        });

        //日历功能
        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };
        $scope.format = 'yyyy-MM-dd';
        $scope.openCallStartTimeOpened = false;
        $scope.openCallEndTimeOpened = false;
        $scope.theFirstSectionFinishedTimeOpened = false;
        $scope.allSectionsFinishedTimeOpened = false;

        $scope.openCallStartTime = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.openCallStartTimeOpened = true;
        };
        $scope.openCallEndTime = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.openCallEndTimeOpened = true;
        };
        $scope.openTheFirstSectionFinishedTime = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.theFirstSectionFinishedTimeOpened = true;
        };
        $scope.openallSectionsFinishedTime = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.allSectionsFinishedTimeOpened = true;
        };
    });


    CSystem.c_module.controller("WorkController", function ($scope, $modalInstance, items, keyword) {
        $scope.items = items;
        $scope.keyword = keyword;
        $scope.selectedIndex = null;
        $scope.doSelect = function (index) {
            $scope.selectedIndex = index;
        }
        $scope.doLink = function () {
            if (angular.isNumber($scope.selectedIndex)) {
                $modalInstance.close($scope.items[$scope.selectedIndex]);
            } else {
                alert("请选择");
            }
        }
        $scope.doCancel = function () {
            $modalInstance.dismiss('cancel');
        }
    });

})(angular);