/* global angular */
(function(angular) {
    angular.module('angularScreenfull')

    .directive('showIfFullscreen', showIfFullscreenDirective);
    showIfFullscreenDirective.$inject = ['$animate'];
    function showIfFullscreenDirective ($animate) {
        return {
            restrict: 'A',
            require: '^ngsfFullscreen',
            link: function(scope, elm, attrs,fullScreenCtrl) {
                var hideOrShow = function () {

                    var show = fullScreenCtrl.isFullscreen();
                    if (attrs.showIfFullscreen === 'false' || attrs.showIfFullscreen === false) {
                        show = !show;
                    }

                    if ( show ) {
                        $animate.removeClass(elm, 'ng-hide');
                    } else {
                        $animate.addClass(elm, 'ng-hide');
                    }
                };
                hideOrShow();
                var unwatch = fullScreenCtrl.onFullscreenChange(hideOrShow);
                scope.$on('$destroy', unwatch);
            }
        };
    }
})(angular);
