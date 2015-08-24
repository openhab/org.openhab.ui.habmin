/* global angular */
(function(angular) {
    angular.module('angularScreenfull')
    .directive('showIfFullscreenEnabled', showIfFullscreenEnabledDirective);

    showIfFullscreenEnabledDirective.$inject = ['$animate'];

    function showIfFullscreenEnabledDirective ($animate) {
        return {
            restrict: 'A',
            require: '^ngsfFullscreen',
            link: function(scope, elm, attrs,fullScreenCtrl) {
                if (fullScreenCtrl.fullscreenEnabled()) {
                    $animate.removeClass(elm, 'ng-hide');
                } else {
                    $animate.addClass(elm, 'ng-hide');
                }
            }
        };
    }
})(angular);


