/* global angular */
(function(angular) {
    angular.module('angularScreenfull')
    .directive('ngsfToggleFullscreen', ngsfToggleFullscreenDirective);

    function ngsfToggleFullscreenDirective () {
        return {
            restrict: 'A',
            require: '^ngsfFullscreen',
            link: function(scope, elm, attrs, fullScreenCtrl) {
                elm.on('click', function() {
                    fullScreenCtrl.toggleFullscreen();
                });
            }
        };
    }
})(angular);

