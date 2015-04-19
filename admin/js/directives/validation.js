+(function (angular) {

    function gblen(str) { return $.trim(str).replace(/[^\x00-\xff]/ig, 'xx').length; }

    CSystem.c_module.directive("maxgblen", function () {
        return {
            restrict: 'EA',
            replace: true,
            require: '?ngModel',
            link: function (scope, element, attrs, ctrl) {
                if (!ctrl) return;

                var maxgblen = attrs.maxgblen;

                function valid(viewValue) {
                    var glen = gblen(viewValue);

                    if (glen > maxgblen) {
                        ctrl.$setValidity('maxgblen', false);

                        return undefined;
                    } else {
                        ctrl.$setValidity('maxgblen', true);

                        return viewValue;
                    }
                }

                ctrl.$parsers.unshift(function (viewValue) {
                    return valid(viewValue);
                });

                ctrl.$formatters.push(function (viewValue) {
                    valid(viewValue);

                    return viewValue;
                });
            }
        };
    });
})(angular);