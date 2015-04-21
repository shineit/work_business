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

    CSystem.c_module.controller("TaskCreateController", function ($scope, $http, FileUploader) {

        $scope.formData = {
            "entitle.workId": "",
            "entitle.workName": "",
            "entitle.workName1": "",
            "entitle.authorName": "",
            "entitle.authorAlisa": "",
            "entitle.categoryId": "",
            "entitle.totalWordCount": "",
            "entitle.workBrief": "",
            "entitle.studioStyleId": 10,
            "entitle.openCallStartTime": "",
            "entitle.openCallEndTime": "",
            "entitle.fileContext": "",
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
            "entitle.contactPhoneNo": ""
        }

        $scope.filesContext = [];

        var uploader = $scope.uploader = new FileUploader({
            url: 'http://upload.test.ximalaya.com/dtres/backend/picture/upload'
        });

        uploader.filters.push({
            name: 'imageFilter',
            fn: function (item /*{File|FileLikeObject}*/, options) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        });
        uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
            console.info('onWhenAddingFileFailed', item, filter, options);
        };
        uploader.onAfterAddingFile = function (fileItem) {
            console.info('onAfterAddingFile', fileItem);
        };
        uploader.onAfterAddingAll = function (addedFileItems) {
            console.info('onAfterAddingAll', addedFileItems);
        };
        uploader.onBeforeUploadItem = function (item) {
            console.info('onBeforeUploadItem', item);
        };
        uploader.onProgressItem = function (fileItem, progress) {
            console.info('onProgressItem', fileItem, progress);
        };
        uploader.onProgressAll = function (progress) {
            console.info('onProgressAll', progress);
        };
        uploader.onSuccessItem = function (fileItem, response, status, headers) {
            console.info('onSuccessItem', fileItem, response, status, headers);
        };
        uploader.onErrorItem = function (fileItem, response, status, headers) {
            console.info('onErrorItem', fileItem, response, status, headers);
        };
        uploader.onCancelItem = function (fileItem, response, status, headers) {
            console.info('onCancelItem', fileItem, response, status, headers);
        };
        uploader.onCompleteItem = function (fileItem, response, status, headers) {
            console.info('onCompleteItem', fileItem, response, status, headers);
        };
        uploader.onCompleteAll = function () {
            console.info('onCompleteAll');
        };

        console.info('uploader', uploader);

        $scope.doAddFileContext = function () {
            var index = $scope.filesContext.length ? $scope.filesContext[$scope.filesContext.length - 1] : 0;

            index++;
            $scope.filesContext.push(index);
        };
        $scope.doRemoveFileContext = function (index) {
            $scope.filesContext.splice(index, 1);
        }

        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };

        $scope.doUploadPic = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            console.log("upload");
        }

        $scope.doGetWorks = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $http({ method: 'GET', url: '/work/' + $scope.formData['entitle.workName1'] }).
                success(function (data, status, headers, config) {
                    console.log(data);
                }).
                error(function (data, status, headers, config) {

                });
        }

        $scope.formats = ['dd-MMMM-yyyy', 'yyyy-MM-dd', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        $scope.format = $scope.formats[1];
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

})(angular);