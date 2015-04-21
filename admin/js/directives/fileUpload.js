+(function (angular) {
    var module = angular.module("fileUpload", [])
        .directive("fileupload", function () {
            return {
                restrict: 'E',
                replace: true,
                template: [
                    '<span class="btn btn-default btn-file">上传文件',
                    '   <input type="file" multiple="multiple" />',
                    '</span>'
                ].join(''),
                scope: {
                    multiple: "@multiple"
                },
                controller: function ($scope, $element, $attrs, $transclude, $http) {

                },
                compile: function (element, attrs, trasnclude) {
                    console.log(element);
                }
            };
        });
})(angular);