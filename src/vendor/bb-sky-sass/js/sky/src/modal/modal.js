/*jshint browser: true */
/*global angular, jQuery */

/** @module Modal
 @description The Modal directive and service can be used to launch modals in a consistent way in a Sky application.  Rather than using the ui-bootstrap `$modal.open`, use `bbModal.open` instead.  This will take the same options object but allows for some custom default behaviors in Sky.

In addition to the `bbModal` service for lauching modals, a `bb-modal` directive should be used to have common look-and-feel for modal content.  Within `bb-modal`, use `bb-modal-header` to include a common modal header, `bb-modal-footer` to include a common modal footer and buttons, and `bb-modal-body` to wrap the modal's body content.

### Modal Header Settings ###

 - `bb-modal-help-key` Specifies the help key for the modal.  This will be be linked from a help button included in the modal header.

### Modal Footer Buttons ##

 - `bb-modal-footer-button` Generic button for the modal footer.  HTML included in this tag will be included in the contents of the button.  You must register events for the button manually.

 - `bb-modal-footer-primary-button` Primary button for the modal footer which will have a custom look.  Default content is 'Save', but HTML included in this tag will be included as the contents of the button if provided.  You must register events for the button manually.

 - `bb-modal-footer-cancel-button` Cancel button for the modal footer.  Default content is 'Cancel', but HTML included in this tag will be included as the contents of the button if provided.  This button will automatically cancel the modal form.

 */

(function ($) {
    'use strict';

    angular.module('sky.modal', ['sky.helpbutton', 'sky.resources', 'ui.bootstrap'])
        .factory('bbModal', ['$modal', function ($modal) {
            return {
                open: function (opts) {
                    // Change default values for modal options
                    opts = angular.extend({
                        backdrop: 'static',
                        windowClass: 'bb-modal'
                    }, opts);

                    return $modal.open(opts);
                }
            };
        }])
        .directive('bbModal', ['$timeout', '$window', function ($timeout, $window) {
            function getPixelValue(val) {
                val = val || '0';
                
                return parseFloat(val.replace('px', ''));
            }
            
            return {
                controller: ['$scope', function ($scope) {
                    this.setBodyEl = function (bodyEl) {
                        $scope.bodyEl = bodyEl;
                    };
                }],
                replace: true,
                transclude: true,
                restrict: 'E',
                templateUrl: 'sky/templates/modal/modal.html',
                link: function ($scope, el) {
                    var bodyEl,
                        resizeTimeout,
                        windowEl = $($window);
                    
                    function fitToWindow() {
                        var margin,
                            modalParentEl,
                            newMaxHeight,
                            reservedHeight;
                        
                        if (bodyEl) {
                            modalParentEl = el.parents('.modal-dialog');

                            margin = getPixelValue(modalParentEl.css('margin-bottom')) + getPixelValue(modalParentEl.css('margin-top'));
                            
                            reservedHeight = margin + el.find('.modal-header').outerHeight() + el.find('.modal-footer').outerHeight();

                            newMaxHeight = windowEl.height() - reservedHeight;

                            bodyEl.css('max-height', newMaxHeight);
                        }
                    }
                             
                    $scope.$watch('bodyEl', function (newValue) {
                        bodyEl = newValue;
                        fitToWindow();
                    });
                    
                    $timeout(function () {
                        fitToWindow();
                    }, 0);

                    windowEl.on('resize.bbModal' + $scope.$id, function () {
                        $timeout.cancel(resizeTimeout);
                        
                        resizeTimeout = $timeout(function () {
                            fitToWindow();
                        }, 250);
                    });
                    
                    el.on('$destroy', function () {
                        windowEl.off('.bbModal' + $scope.$id);
                    });
                }
            };
        }])
        .directive('bbModalBody', function () {
            return {
                link: function (scope, el, attrs, modalCtrl) {
                    modalCtrl.setBodyEl(el);
                },
                require: '^bbModal',
                restrict: 'A',
                template: function (el) {
                    el.addClass('modal-body');
                }
            };
        })
        .directive('bbModalHeader', function () {
            return {
                controller: angular.noop,
                replace: true,
                transclude: true,
                require: '^bbModal',
                restrict: 'E',
                templateUrl: 'sky/templates/modal/modalheader.html',
                scope: {
                    bbModalHelpKey: '='
                }
            };
        })
        .directive('bbModalFooter', function () {
            return {
                controller: angular.noop,
                replace: true,
                transclude: true,
                require: '^bbModal',
                restrict: 'E',
                templateUrl: 'sky/templates/modal/modalfooter.html'
            };
        })
        .directive('bbModalFooterButton', function () {
            return {
                replace: true,
                transclude: true,
                require: '^bbModalFooter',
                restrict: 'E',
                templateUrl: 'sky/templates/modal/modalfooterbutton.html'
            };
        })
        .directive('bbModalFooterButtonPrimary', ['bbResources', function (bbResources) {
            return {
                replace: true,
                transclude: true,
                require: '^bbModalFooter',
                restrict: 'E',
                templateUrl: 'sky/templates/modal/modalfooterbuttonprimary.html',
                link: function ($scope, el) {
                    if (el.children().length === 0) {
                        el.append("<span>" + bbResources.modal_footer_primary_button + "</span>");
                    }
                }
            };
        }])
        .directive('bbModalFooterButtonCancel', ['bbResources', function (bbResources) {
            return {
                replace: true,
                transclude: true,
                require: '^bbModalFooter',
                restrict: 'E',
                templateUrl: 'sky/templates/modal/modalfooterbuttoncancel.html',
                link: function ($scope, el) {
                    if (el.children().length === 0) {
                        el.append("<span>" + bbResources.modal_footer_cancel_button + "</span>");
                    }
                }
            };
        }]);
}(jQuery));
