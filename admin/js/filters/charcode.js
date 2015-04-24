+(function (angular) {
    var module = angular.module("myfilters", [])
        .filter("charcode", function () {
            return function (input, offset) {
                offset *= 1;
                input *= 1;

                if (Number.isNaN(offset)) {
                    offset = 0;
                }

                return String.fromCharCode(input + offset);
            };
        });
})(angular);