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

    CSystem.c_module.controller("TaskCreateController", function ($scope, $http) {

        $scope.entitle = {
            workName: ""
        };

        $scope.expectedTotalTimeLength = "";
    });

})(angular);