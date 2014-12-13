/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
describe('HABminCtrl', function () {
    describe('isCurrentUrl', function () {
        var AppCtrl, $location, $scope;

        beforeEach(module('HABmin'));

        beforeEach(inject(function ($controller, _$location_, $rootScope) {
            $location = _$location_;
            $scope = $rootScope.$new();
            HABminCtrl = $controller('HABminCtrl', {$location: $location, $scope: $scope});
        }));

        it('should pass a dummy test', inject(function () {
            expect(HABminCtrl).toBeTruthy();
        }));
    });
});
