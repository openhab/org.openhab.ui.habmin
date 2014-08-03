describe('HABminCtrl', function () {
    describe('isCurrentUrl', function () {
        var AppCtrl, $location, $scope;

        beforeEach(module('HABmin'));

        beforeEach(inject(function ($controller, _$location_, $rootScope) {
            $location = _$location_;
            $scope = $rootScope.$new();
            HABminCtrl = $controller('HABminCtrl', { $location: $location, $scope: $scope });
        }));

        it('should pass a dummy test', inject(function () {
            expect(HABminCtrl).toBeTruthy();
        }));
    });
});
