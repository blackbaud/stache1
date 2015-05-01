angular.module('KitchenSink').controller('AutoFocusTestController', ['bbModal', '$scope', function (bbModal, $scope) {

    $scope.open = function () {
        bbModal.open({
            template: '<bb-modal>' +
                      '<div class="modal-form">' +
                      '<bb-modal-header bb-modal-help-key="\'bb-security-users.html\'">My Header</bb-modal-header>' +
                      '<div bb-modal-body>' +
                      '<input bb-autofocus/>' +
                      '</div>' +
                      '<bb-modal-footer>' +
                      '<bb-modal-footer-button-primary></bb-modal-footer-button-primary>' +
                      '<bb-modal-footer-button>Sample button</bb-modal-footer-button>' +
                      '<bb-modal-footer-button-cancel></bb-modal-footer-button-cancel>' +
                      '</bb-modal-footer>' +
                      '</div>' +
                      '</bb-modal>'
        });
    };

}]);