define(["angular", "angular-ui-router", "plugins/angular/angular-ui-bootstrap", "plugins/angular/angular-animate", "plugins/angular/angular.loadingbar"], function (angular) {
    var moduleName = "admin.module",
        module = angular.module("admin.module", ["ui.router", "ui.bootstrap", 'ngAnimate', 'angular-loading-bar']);

    module.config(['$stateProvider', '$urlRouterProvider', 'cfpLoadingBarProvider', function ($stateProvider, $urlRouterProvider, cfpLoadingBarProvider) {
        $urlRouterProvider.otherwise("/page1");

        $stateProvider.state('page1', {
            url: "/page1",
            template: '<div></div>',
            controller: "page1"
        }).state('page2', {
            url: "/page2",
            template: '<div></div>',
            controller: "page2"
        });

        cfpLoadingBarProvider.includeSpinner = false;
        cfpLoadingBarProvider.latencyThreshold = 500;
    }]);

    return module;
});