+(function (angular) {

    function gblen(str) { return $.trim(str).replace(/[^\x00-\xff]/ig, 'xx').length; }

    var module = angular.module("validation", []);

    module.directive("maxgblen", function () {
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
    module.directive("range", function (numberFilter) {
        return {
            restrict: 'EA',
            replace: true,
            require: '?ngModel',
            link: function (scope, element, attrs, ctrl) {
                if (!ctrl) return;

                var max = attrs.rangeMax * 1 || 1000000000,
                    min = attrs.rangeMin * 1 || 0;

                function valid(viewValue) {
                    viewValue *= 1;
                    if (angular.isNumber(viewValue) && !Number.isNaN(viewValue)) {

                        if (viewValue >= min && viewValue <= max) {
                            ctrl.$setValidity('range', true);

                            return viewValue;
                        } else {
                            ctrl.$setValidity('range', false);

                            return undefined;
                        }
                    } else {
                        return viewValue;
                    }

                }

                ctrl.$parsers.unshift(function (viewValue) {
                    return valid(viewValue) || 0;
                });

                ctrl.$formatters.push(function (viewValue) {
                    return valid(viewValue) || viewValue;
                });
            }
        };
    });
})(angular);