/*jshint browser: true, jasmine: true */
/*global angular, inject, module, $ */

describe('Modal', function () {
    'use strict';
    
    var $compile,
        $rootScope,
        $templateCache,
        $timeout,
        bbModal,
        bbResources;
    
    function closeModalInstance(modalInstance) {
        modalInstance.close();
        $timeout.flush();
    }
    
    beforeEach(module(
        'ngMock',
        'sky.helpbutton',
        'sky.modal',
        'sky.templates',
        'template/modal/backdrop.html',
        'template/modal/window.html'
    ));

    beforeEach(inject(function (_$compile_, _$modal_, _$rootScope_, _$templateCache_, _$timeout_, _bbModal_, _bbResources_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $templateCache = _$templateCache_;
        $timeout = _$timeout_;
        bbModal = _bbModal_;
        bbResources = _bbResources_;
    }));
    
    afterEach(function () {
        $('.modal-backdrop').remove();
    });
    
    describe('directive', function () {
        function getPixelValue(val) {
            val = val || '0';

            return parseFloat(val.replace('px', ''));
        }

        it('should display a modal form from a template URL', function () {
            var modalInstance;
            
            /*jslint white: true */
            $templateCache.put(
                'test/modal/modal.html',
                '<bb-modal>' +
                    '<div class="modal-form">' +
                        '<div bb-modal-body>' +
                            '<span class="test-modal-template-url"></span>' +
                        '</div>' +
                    '</div>' +
                '</bb-modal>');
            /*jslint white: false */
            
            modalInstance = bbModal.open({
                templateUrl: 'test/modal/modal.html'
            });
            
            $rootScope.$digest();
            
            expect($('.modal-dialog .test-modal-template-url')).toBeInDOM();
            
            closeModalInstance(modalInstance);
        });
        
        it('should display a modal form from a template string', function () {
            var modalInstance;
            
            /*jlint white: true */
            modalInstance = bbModal.open({
                template:
                    '<bb-modal>' +
                        '<div class="modal-form">' +
                            '<div bb-modal-body>' +
                                '<span class="test-modal-template"></span>' +
                            '</div>' +
                        '</div>' +
                    '</bb-modal>'
            });
            /*jlint white: false */
            
            $rootScope.$digest();

            expect($('.modal-dialog .test-modal-template')).toBeInDOM();
            
            closeModalInstance(modalInstance);
        });
        
        it('should fit the modal to the current window height', function () {
            var modalEl,
                modalInstance,
                modalMargin,
                windowHeight = $(window).height();
            
            /*jlint white: true */
            modalInstance = bbModal.open({
                template:
                    '<bb-modal>' +
                        '<div bb-modal-body>' +
                            '<div style="height: ' + (windowHeight + 100) + '></span>' +
                        '</div>' +
                    '</bb-modal>'
            });
            /*jlint white: false */
            
            $rootScope.$digest();
            
            modalEl = $('.bb-modal .modal-dialog');
            
            modalMargin = getPixelValue(modalEl.css('margin-top')) + getPixelValue(modalEl.css('margin-bottom'));

            expect($('.modal-body').css('max-height')).toBe((windowHeight - modalMargin) + 'px');
            
            closeModalInstance(modalInstance);
        });
        
        it('should fit the modal to the window height when the window is resized', function () {
            var cssSpy,
                modalInstance,
                resizeListenerCount;

            function getResizeListenerCount() {
                var eventsData = $._data($(window)[0], 'events'),
                    resizeListeners;

                if (eventsData) {
                    resizeListeners = eventsData.resize;

                    if (resizeListeners) {
                        return resizeListeners.length;
                    }
                }

                return 0;
            }

            resizeListenerCount = getResizeListenerCount();

            modalInstance = bbModal.open({
                template: '<bb-modal><div bb-modal-body></div></bb-modal>'
            });

            $rootScope.$digest();

            expect(getResizeListenerCount()).toBe(resizeListenerCount + 1);
            
            cssSpy = spyOn($.fn, 'css');
            
            $(window).resize();
            $timeout.flush();
            
            expect(cssSpy.calls.mostRecent().object[0]).toBe($('.modal-body')[0]);

            closeModalInstance(modalInstance);

            // Ensure the window resize listener is removed when the modal is closed.
            expect(getResizeListenerCount()).toBe(resizeListenerCount);
        });
    });
    
    describe('body directive', function () {
        it('should render the body contents', function () {
            var $scope = $rootScope.$new(),
                el;
            
            /*jslint white: true */
            el = $compile(
                '<bb-modal>' +
                    '<div bb-modal-body>Test body</div>' +
                '</bb-modal>'
            )($scope);
            /*jslint white: false */
            
            $scope.$digest();
            
            expect(el.find('.modal-body')).toHaveText('Test body');
        });
    });
    
    describe('header directive', function () {
        it('should render header text', function () {
            var $scope = $rootScope.$new(),
                el;
            
            /*jslint white: true */
            el = $compile(
                '<bb-modal>' +
                    '<bb-modal-header>Test Header</bb-modal-header>' +
                '</bb-modal>'
            )($scope);
            /*jslint white: false */
            
            $scope.$digest();
            
            expect(el.find('h4.bb-dialog-header')).toHaveText('Test Header');
        });
        
        it('should set the help key button\'s help key', function () {
            var $scope = $rootScope.$new(),
                el;
            
            /*jslint white: true */
            el = $compile(
                '<bb-modal>' +
                    '<bb-modal-header bb-modal-help-key="helpKey"></bb-modal-header>' +
                '</bb-modal>'
            )($scope);
            /*jslint white: false */
            
            $scope.helpKey = 'modalhelpkeytest.html';
            $scope.$digest();
            
            expect(el.find('.bb-helpbutton')).toHaveAttr('bb-help-key', 'modalhelpkeytest.html');
        });
    });
    
    describe('footer', function () {
        describe('directive', function () {
            it('should render the footer contents', function () {
                var $scope = $rootScope.$new(),
                    el;

                /*jslint white: true */
                el = $compile(
                    '<bb-modal>' +
                        '<bb-modal-footer>Test footer</bb-modal-footer>' +
                    '</bb-modal>'
                )($scope);
                /*jslint white: false */

                $scope.$digest();

                expect(el.find('.modal-footer')).toHaveText('Test footer');
            });
        });
        
        describe('button directive', function () {
            it('should render a footer button', function () {
                var $scope = $rootScope.$new(),
                    btnEl,
                    el;

                /*jslint white: true */
                el = $compile(
                    '<bb-modal>' +
                        '<bb-modal-footer>' + 
                            '<bb-modal-footer-button>Test button</bb-modal-footer-button>' +
                        '</bb-modal-footer>' +
                    '</bb-modal>'
                )($scope);
                /*jslint white: false */

                $scope.$digest();
                
                btnEl = el.find('button.btn.btn-white');

                expect(btnEl).toHaveAttr('type', 'button');
                expect(btnEl.find('span')).toHaveText('Test button');
            });
        });
        
        describe('button primary directive', function () {
            it('should render a primary footer button with default text', function () {
                var $scope = $rootScope.$new(),
                    btnEl,
                    el;

                /*jslint white: true */
                el = $compile(
                    '<bb-modal>' +
                        '<bb-modal-footer>' + 
                            '<bb-modal-footer-button-primary></bb-modal-footer-button-primary>' +
                        '</bb-modal-footer>' +
                    '</bb-modal>'
                )($scope);
                /*jslint white: false */

                $scope.$digest();
                
                btnEl = el.find('button.btn.btn-primary');

                expect(btnEl).toHaveAttr('type', 'submit');
                expect(btnEl.find('span')).toHaveText(bbResources.modal_footer_primary_button);
            });
            
            it('should render a primary footer button with the specified text', function () {
                var $scope = $rootScope.$new(),
                    btnEl,
                    el;

                /*jslint white: true */
                el = $compile(
                    '<bb-modal>' +
                        '<bb-modal-footer>' + 
                            '<bb-modal-footer-button-primary>{{primaryButtonText}}</bb-modal-footer-button-primary>' +
                        '</bb-modal-footer>' +
                    '</bb-modal>'
                )($scope);
                /*jslint white: false */

                $scope.primaryButtonText = bbResources.modal_footer_primary_button + ' override';
                $scope.$digest();
                
                btnEl = el.find('button.btn.btn-primary');

                expect(btnEl).toHaveAttr('type', 'submit');
                expect(btnEl.find('span')).toHaveText($scope.primaryButtonText);
            });
        });
        
        describe('button cancel directive', function () {
            it('should render a cancel footer button with default text', function () {
                var $scope = $rootScope.$new(),
                    btnEl,
                    el;

                /*jslint white: true */
                el = $compile(
                    '<bb-modal>' +
                        '<bb-modal-footer>' + 
                            '<bb-modal-footer-button-cancel></bb-modal-footer-button-cancel>' +
                        '</bb-modal-footer>' +
                    '</bb-modal>'
                )($scope);
                /*jslint white: false */

                $scope.$digest();
                
                btnEl = el.find('button.btn.btn-link');

                expect(btnEl).toHaveAttr('type', 'button');
                expect(btnEl.find('span')).toHaveText(bbResources.modal_footer_cancel_button);
            });
            
            it('should render a cancel footer button with the specified text', function () {
                var $scope = $rootScope.$new(),
                    btnEl,
                    el;

                /*jslint white: true */
                el = $compile(
                    '<bb-modal>' +
                        '<bb-modal-footer>' + 
                            '<bb-modal-footer-button-cancel>{{cancelButtonText}}</bb-modal-footer-button-cancel>' +
                        '</bb-modal-footer>' +
                    '</bb-modal>'
                )($scope);
                /*jslint white: false */

                $scope.cancelButtonText = bbResources.modal_footer_cancel_button + ' override';
                $scope.$digest();
                
                btnEl = el.find('button.btn.btn-link');

                expect(btnEl).toHaveAttr('type', 'button');
                expect(btnEl.find('span')).toHaveText($scope.cancelButtonText);
            });
        });
    });
});
    
describe('Modal service', function () {
    'use strict';
    
    beforeEach(module(
        'ngMock',
        'sky.modal'
    ));

    var $modal,
        $rootScope,
        bbModal;

    beforeEach(module(function ($provide) {
        $modal = {
            open: angular.noop
        };

        $provide.value('$modal', $modal);
    }));

    beforeEach(inject(function (_$rootScope_, _bbModal_) {
        $rootScope = _$rootScope_;
        bbModal = _bbModal_;
    }));

    it('should add default options and call through to the UI Bootstrap modal service', function () {
        var openSpy = spyOn($modal, 'open');

        bbModal.open({
            template: 'a'
        });

        $rootScope.$digest();

        expect(openSpy).toHaveBeenCalledWith({
            template: 'a',
            backdrop: 'static',
            windowClass: 'bb-modal'
        });
    });
});