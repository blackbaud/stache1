angular.module('KitchenSink').controller('TileTestController', ['bbModal', '$scope', function (bbModal, $scope) {
    $scope.resources = {
        tile_header: 'Tile header'
    };
    
    $scope.locals = {
        is_collapsed: false
    };

    $scope.open = function () {
        bbModal.open({
            template: '<bb-modal>' +
                      '    <div class="modal-form">' +
                      '        <bb-modal-header bb-modal-help-key="\'bb-security-users.html\'">Form Header</bb-modal-header>' +
                      '        <div bb-modal-body>' +
                      '            <bb-tile bb-tile-header="\'Tile header\'">' +
                      '                <div bb-tile-section>' +
                      '                    Test.' +
                      '                </div>' +
                      '            </bb-tile>' +
                      '        </div>' +
                      '        <bb-modal-footer>' +
                      '            <bb-modal-footer-button-primary></bb-modal-footer-button-primary>' +
                      '            <bb-modal-footer-button-cancel></bb-modal-footer-button-cancel>' +
                      '        </bb-modal-footer>' +
                      '    </div>' +
                      '</bb-modal>'
        });
    };
}]);