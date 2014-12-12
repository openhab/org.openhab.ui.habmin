angular.module('UserGeneralPrefs', []).service('UserGeneralPrefs', [
  '$modal',
  function ($modal) {
    this.showModal = function () {
      var controller = function ($scope, $modalInstance) {
        $scope.ok = function (result) {
          $modalInstance.close(result);
        };
        $scope.cancel = function (result) {
          $modalInstance.dismiss('cancel');
        };
      };
      return $modal.open({
        backdrop: 'static',
        keyboard: true,
        modalFade: true,
        templateUrl: 'user/userGeneral.tpl.html',
        controller: controller
      }).result;
    };
  }
]);