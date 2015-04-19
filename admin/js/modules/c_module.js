+(function () {
    var moduleName = "c_module",
        c_module = angular.module(moduleName, ["ui.bootstrap", 'ngAnimate', 'angular-loading-bar', 'ngMessages']);


    c_module.config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = false;
        cfpLoadingBarProvider.latencyThreshold = 500;

    }]);

    window.CSystem = {};

    window.CSystem.c_module = c_module;
})();

