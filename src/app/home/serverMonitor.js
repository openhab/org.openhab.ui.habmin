/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014-2015 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('serverMonitor', [
    'ui.bootstrap',
    'ngSanitize',
    'ngLocalize',
    'HABmin.userModel'
])
    .service('ServerMonitor',
    function ($modal, $rootScope, ChartModel, growl, locale, UserService) {
        var modalInstance = null;

        /**
         * Listen for the online/offline broadcasts and display a modal
         * dialog when the server is not responding.
         */
        this.monitor = function () {
            $rootScope.$on("habminOnline", function (event, status) {
                if (status == false) {
                    if (modalInstance == null) {
                        modalInstance = $modal.open({
                            backdrop: 'static',
                            keyboard: true,
                            modalFade: true,
                            size: 'lg',
                            template: '<div class="modal-body"><h3 class="text-center">' +
                            '<span class="fa fa-exclamation-triangle text-danger"></span>' +
                            '&nbsp;' +
                            '<span i18n="habmin.mainStatusOffline"></span>' +
                            '</h3></div>',
                            windowClass: UserService.getTheme()
                        });
                    }
                }
                else if (modalInstance != null) {
                    modalInstance.close();
                    modalInstance = null;
                }
            });
        };
    })

;
