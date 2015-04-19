+(function (angular) {

    CSystem.c_module.controller("EntitleController", function ($scope, $interval, $http, cfpLoadingBar) {
        $scope.searchModel = {
            searchUrl: "",
            status: null,
            doSearch: function () {
                location.href = this.searchUrl + this.status;
            }
        };
    });

})(angular);