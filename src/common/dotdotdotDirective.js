angular.module('dotdotdot', [])
    .directive('dotdotdot', function(){
        return {
            restrict: 'A',
            link: function(scope, element, attributes) {
                scope.$watch(function() {
                    element.dotdotdot({watch: true, ellipsis: '<span class="text-info fa fa-ellipsis-h"></span>'});
                });
            }
        }
    });
