angular.module('dotdotdot', [])
    .directive('dotdotdot', function(){
        return {
            restrict: 'A',
            link: function(scope, element, attributes) {
                scope.$watch(function() {
                    element.dotdotdot({watch: true, height:20, ellipsis: '...'});
                });
            }
        }
    });
