/*jshint browser: true, jasmine: true */
/*global angular, inject, module, $ */

describe('Viewkeeper', function () {
    'use strict';
    
    var $compile,
        $document,
        $rootScope,
        $window;
    
    function getScrollListenerCount() {
        var eventsData = $._data($(window)[0], 'events'),
            listeners;

        if (eventsData) {
            listeners = eventsData.scroll;

            if (listeners) {
                return listeners.length;
            }
        }

        return 0;
    }

    beforeEach(module(
        'ngMock',
        'sky.viewkeeper'
    ));
    
    beforeEach(inject(function (_$compile_, _$rootScope_, _$document_, _$window_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $document = _$document_;
        $window = _$window_;
    }));
    
    describe('directive', function () {
        it('should destroy viewkeeper when the element is destroyed', function () {
            var $scope = $rootScope.$new(),
                el,
                scrollListenerCount;
            
            el = $compile(
                '<div id="viewkeeper-test-{{$id}}">' +
                    '<div bb-view-keeper bb-boundary-el-id="\'viewkeeper-test-\' + $id">a</div>' +
                '</div>'
            )($scope);
            
            el.appendTo(document.body);
            $scope.$digest();
            
            scrollListenerCount = getScrollListenerCount();
            
            el.remove();
            
            // This isn't the ideal way to determine whether a viewkeeper gets created, but since it's not public
            // there's no way to get at the destroy() method to verify it was called.  As long as viewkeeper listens
            // for the window scroll event then this should tell us whether the listener that was there has no been
            // removed.
            expect(getScrollListenerCount()).toBe(scrollListenerCount - 1);
        });
    });
    
    describe('service', function () {
        var bbViewKeeperBuilder,
            bbViewKeeperConfig,
            initialViewportMarginTop;
        
        function validateFixed(el, fixed, bottom) {
            var expectedCls = 'bb-viewkeeper-fixed';
            
            if (fixed) {
                expect(el).toHaveClass(expectedCls);
            } else {
                expect(el).not.toHaveClass(expectedCls);
            }
            
            if (bottom) {
                expect(el).toHaveCss({
                    bottom: '0px'
                });
            }
        }
        
        function createViewKeeper(options) {
            var boundaryEl,
                el,
                windowHeight = $(window).height();
            
            boundaryEl = $(
                '<div style="position: absolute; width: 500px; background-color: red">' + 
                   '<div style="height: 100px; background-color: blue">a</div>' + 
                '</div>'
            )
                .css('top', bbViewKeeperConfig.viewportMarginTop)
                .height(windowHeight + 1000)
                .appendTo(document.body);
            
            el = boundaryEl.children('div');
            
            options = options || {};
            
            angular.extend(options, {
                el: el[0],
                boundaryEl: boundaryEl[0]
            });
            
            return bbViewKeeperBuilder.create(options);
        }
        
        function validateScrolledToTop(vk) {
            var expectedTop = Math.max(parseFloat($(vk.boundaryEl).css('top')) - bbViewKeeperConfig.viewportMarginTop, 0);
            
            expect($(document).scrollTop()).toBe(expectedTop);
        }
        
        function destroyAndRemove(vk) {
            vk.destroy();
            $(vk.boundaryEl).remove();
        }
        
        beforeEach(inject(function (_bbViewKeeperBuilder_, _bbViewKeeperConfig_) {
            bbViewKeeperBuilder = _bbViewKeeperBuilder_;
            bbViewKeeperConfig = _bbViewKeeperConfig_;
            
            initialViewportMarginTop = bbViewKeeperConfig.viewportMarginTop;
        }));
        
        beforeEach(function () {
            $(document).scrollTop(0);
        });
        
        afterEach(function () {
            $(document).scrollTop(0);
        });
        
        it('should fix the element when the page scrolls beyond the top of the element', function () {
            var vk = createViewKeeper();
            
            validateFixed(vk.el, false);
            
            $(document)
                .scrollTop(initialViewportMarginTop + 1)
                .scroll();
            
            validateFixed(vk.el, true);
            
            // Make sure the element remains fixed.
            $(document)
                .scrollTop(initialViewportMarginTop + 10)
                .scroll();
            
            validateFixed(vk.el, true);
            
            $(document)
                .scrollTop(0)
                .scroll();
            
            validateFixed(vk.el, false);
            
            destroyAndRemove(vk);
        });

        it('should allow the element to be fixed and unfixed programmatically', function () {
            var vk = createViewKeeper();

            $(document).scrollTop(initialViewportMarginTop + 1);

            validateFixed(vk.el, false);
            
            vk.syncElPosition();

            validateFixed(vk.el, true);
            
            vk.destroy();
            
            validateFixed(vk.el, false);

            destroyAndRemove(vk);
        });
        
        it('should fix the element to the bottom when that option is specified', function () {
            var vk = createViewKeeper({
                fixToBottom: true
            });
            
            $('<div>b</div>')
                .height($(window).height() + 300)
                .prependTo(vk.boundaryEl);
            
            vk.syncElPosition();
            
            validateFixed(vk.el, true, true);
            
            destroyAndRemove(vk);
        });
        
        it('should not error when destroyed more than once', function () {
            var vk = createViewKeeper();
            
            vk.destroy();
            vk.destroy();
            
            destroyAndRemove(vk);
        });

        it('should call the onStateChanged() callback when specified', function () {
            var onStateChangedSpy,
                vk;

            $(document).scrollTop(0);
            
            vk = createViewKeeper({
                onStateChanged: angular.noop
            });
            
            // Make sure the element is in the viewport.
            $(vk.boundaryEl).css('top', bbViewKeeperConfig.viewportMarginTop + 1);
            
            onStateChangedSpy = spyOn(vk, 'onStateChanged');

            vk.syncElPosition();
            
            expect(onStateChangedSpy).not.toHaveBeenCalled();
            
            $(document).scrollTop(400);

            vk.syncElPosition();

            expect(onStateChangedSpy).toHaveBeenCalled();
            
            destroyAndRemove(vk);
        });

        it('should set the viewkeeper element`\s width when configured to do so', function () {
            var elWidth,
                vk;

            vk = createViewKeeper({
                setWidth: true
            });

            $(document).scrollTop(400);
            
            elWidth = $(vk.el).width();
            
            vk.syncElPosition();

            expect(vk.el).toHaveCss({
                width: elWidth + 'px'
            });
            
            destroyAndRemove(vk);
        });

        it('should scroll to the top of the viewkeeper element when the viewkeeper element is fixed', function () {
            var vk = createViewKeeper();

            $(vk.boundaryEl).css('top', initialViewportMarginTop);

            // Ensure the viewkeeper element is fixed to the top of the viewport.
            $(document).scrollTop(400);
            
            vk.syncElPosition();
            vk.scrollToTop();
            
            validateScrolledToTop(vk);
            
            destroyAndRemove(vk);
        });

        it('should scroll to the top of the viewkeeper element when the viewkeeper element is not fixed', function () {
            var vk = createViewKeeper();

            $(vk.boundaryEl).css('top', initialViewportMarginTop + 100);
            
            // The viewport element should remain unfixed from the top of the viewport.
            $(document).scrollTop(initialViewportMarginTop);
            
            vk.syncElPosition();
            vk.scrollToTop();
            
            validateScrolledToTop(vk);
            
            destroyAndRemove(vk);
        });
    });
    
    describe('scrolling viewkeeper', function () {
        var el,
            oldDocumentHeight,
            $scope,
            windowHeight;
        beforeEach(function () {
            $scope = $rootScope.$new();
            oldDocumentHeight = $($document.body).height();
            windowHeight = $window.innerHeight;
        });
        
        
        afterEach(function () {
            if (angular.isDefined(el)) {
                if (angular.isFunction(el.remove)) {
                    el.remove();
                }
            }
            $($document.body).height(oldDocumentHeight);
            
            $window.scroll(0, 0);
            $($window).trigger('scroll');
        });
        it('should do nothing if the element is not visible', function () {
            var el,
                vkHtml = '<div bb-scrolling-view-keeper style="display: none; top: 5px;"></div>';

            el = $compile(vkHtml)($scope);
            
            el.appendTo($document.body);
            $scope.$digest();
            
            $($document.body).height(windowHeight);
            
            $window.scroll(0, 300);
            
            $($window).trigger('scroll');
            
            expect(el).toHaveCss({"top": "5px"});
            
            el.remove();
        });
        
        it('should remove the fixed bottom class and set the fixed top class and proper vertical offset if the combined height and vertical offset of the scrolling element is less than the window inner height', function () {
            var expectedTop,
                scrollEl,
                stringTop,
                barEl,
                verticalOffsetEl,
                vkHtml = '<div style="top: 0"><div class="bb-omnibar"><div class="desktop"><div class="bar" style="height: 20px"></div></div></div><div id="myVerticalOffset" style="display: block; width: 20px; height: 20px;"></div><div class="my-element" bb-scrolling-view-keeper="vkOptions" style="width: 20px; height: 30px;"></div></div>';
            
            el = angular.element(vkHtml);
            
            $document.find('body').eq(0).prepend(el);
            
            
            $($document.body).height((windowHeight * 10));
            
            
            $compile(el)($scope);
            
            $scope.vkOptions = { viewKeeperOffsetElId: 'myVerticalOffset' };
            
            scrollEl = el.find('.my-element');
            barEl = el.find('.bar');
            verticalOffsetEl = el.find('#myVerticalOffset');
            $scope.$digest();
            
            $window.scroll(0, 10);
            
            $($window).trigger('scroll');
            
            expectedTop = barEl.outerHeight() + verticalOffsetEl.outerHeight();
            stringTop = expectedTop.toString() + "px";
            expect(scrollEl).toHaveCss({"top": stringTop});
            
            expect(scrollEl).not.toHaveClass('bb-grid-filters-fixed-bottom');
            expect(scrollEl).toHaveClass('bb-grid-filters-fixed-top');
        });
      
        it('sets the top of the scrolling element to 0 and removes the fixed top and bottom classes if the combined height and offset of the scrolling element is greater than the offsetHeight of the document body', function () {
            var scrollEl,
                vkHtml = '<div style="top: 0"><div id="myVerticalOffset" style="display: block; width: 20px; height: 20px;"></div><div class="my-element" bb-scrolling-view-keeper="vkOptions" style="top: 100px; width: 20px; height: 30px;"></div></div>';
            
            el = angular.element(vkHtml);
            
            $document.find('body').eq(0).prepend(el);
            
            $($document.body).height((windowHeight * 10));
            
            $compile(el)($scope);
            
            scrollEl = el.find('.my-element');

            $scope.$digest();
            
            $window.scroll(0, 10);
            
            $($window).trigger('scroll');
            expect(scrollEl[0].style.top).toBe("0px");
            
            expect(scrollEl).not.toHaveClass('bb-grid-filters-fixed-bottom');
            expect(scrollEl).not.toHaveClass('bb-grid-filters-fixed-top');
        });
        
        describe('scrolling down', function () {
            it('removes the fixed bottom and top classes and sets the top of the scrolling element to the top subtracted from the start top value when scrolling down and the height and top of the scrollable element is greater than the scroll position and height of the window', function () {
                var scrollEl,
                    verticalOffsetEl,
                    vkHtml = '<div style="top: 0"><div class="bb-omnibar"><div class="desktop"><div class="bar" style="height: 20px"></div></div></div><div id="myVerticalOffset" style="width: 20px;"></div><div class="my-element" bb-scrolling-view-keeper="vkOptions" style="width: 20px; height: 30px;"></div></div>';
            
                el = angular.element(vkHtml);
            
                $document.find('body').eq(0).prepend(el);
            
            
                $($document.body).height((windowHeight * 10));
            
            
                $compile(el)($scope);
            
                $scope.vkOptions = { viewKeeperOffsetElId: 'myVerticalOffset' };
            
                verticalOffsetEl = el.find('#myVerticalOffset');
                verticalOffsetEl.height(windowHeight);
                
                scrollEl = el.find('.my-element');
                $scope.$digest();
            
                $window.scroll(0, 10);
            
                $($window).trigger('scroll');
            
                expect(scrollEl[0].style.top).toBe("0px");
            
                expect(scrollEl).not.toHaveClass('bb-grid-filters-fixed-bottom');
                expect(scrollEl).not.toHaveClass('bb-grid-filters-fixed-top');
            });
        
            it('removes the fixed top class and adds the fixed bottom class when scrolling down and the height and top of the scrollable element is less than the scroll position and height of the window', function () {
                var scrollEl,
                    verticalOffsetEl,
                    vkHtml = '<div style="top: 0"><div class="bb-omnibar"><div class="desktop"><div class="bar" style="height: 20px"></div></div></div><div id="myVerticalOffset" style="display: block; width: 20px;"></div><div class="my-element" bb-scrolling-view-keeper="vkOptions" style="width: 20px; height: 100px;"></div></div>';
            
                el = angular.element(vkHtml);
            
                $document.find('body').eq(0).prepend(el);
            
            
                $($document.body).height((windowHeight * 10));
            
            
                $compile(el)($scope);
            
                $scope.vkOptions = { viewKeeperOffsetElId: 'myVerticalOffset' };
                
                verticalOffsetEl = el.find('#myVerticalOffset');
                verticalOffsetEl.height(windowHeight);
            
                scrollEl = el.find('.my-element');
                $scope.$digest();
            
                $window.scroll(0, (windowHeight * 1.5));
            
                $($window).trigger('scroll');
            
                expect(scrollEl).toHaveClass('bb-grid-filters-fixed-bottom');
                expect(scrollEl).not.toHaveClass('bb-grid-filters-fixed-top');
            });
        });
        
        describe('scrolling up', function () {
            it('removes the fixed bottom and top classes and sets the top of the scrolling element to the top subtracted from the start top value when scrolling up and the top value of the scrolling element is less than the scroll position and vertical offset', function () {
                var scrollEl,
                    vkHtml = '<div style="top: 5px;"><div id="myVerticalOffset" style="height: 20px;"></div><div class="my-element" bb-scrolling-view-keeper="vkOptions" style="width: 20px;"></div></div>';
            
                el = angular.element(vkHtml);
            
                $document.find('body').eq(0).prepend(el);
            
            
                $($document.body).height((windowHeight * 10));
            
            
                $compile(el)($scope);
            
                $scope.vkOptions = { viewKeeperOffsetElId: 'myVerticalOffset' };
            
                scrollEl = el.find('.my-element');
                scrollEl.height((windowHeight * 2));
                $scope.$digest();
            
                $window.scroll(0, windowHeight);
            
                $($window).trigger('scroll');
                
                expect(scrollEl).not.toHaveClass('bb-grid-filters-fixed-bottom');
                expect(scrollEl).not.toHaveClass('bb-grid-filters-fixed-top');
                
                $window.scroll(0, (windowHeight * 0.5));
                
                $($window).trigger('scroll');
                
                expect(scrollEl[0].style.top).toBe("0px");
            
                expect(scrollEl).not.toHaveClass('bb-grid-filters-fixed-bottom');
                expect(scrollEl).not.toHaveClass('bb-grid-filters-fixed-top');
            });
        
            it('removes the fixed bottom class and adds the fixed top class and sets the top of the scrolling element to the vertical offset when scrolling up and the top value of the scrolling element is greater than or equal to the scroll position and vertical offset', function () {
                var scrollEl,
                    vkHtml = '<div style="top: 5px;"><div id="myVerticalOffset" style="height: 20px;"></div><div class="my-element" bb-scrolling-view-keeper="vkOptions" style="width: 20px;"></div></div>';
                el = angular.element(vkHtml);
            
                $document.find('body').eq(0).prepend(el);
            
            
                $($document.body).height((windowHeight * 10));
            
            
                $compile(el)($scope);
            
                $scope.vkOptions = { viewKeeperOffsetElId: 'myVerticalOffset' };
            
                scrollEl = el.find('.my-element');
                scrollEl.height((windowHeight * 2));
                $scope.$digest();
            
                $window.scroll(0, windowHeight);
            
                $($window).trigger('scroll');
                
                expect(scrollEl).not.toHaveClass('bb-grid-filters-fixed-bottom');
                expect(scrollEl).not.toHaveClass('bb-grid-filters-fixed-top');
                
                $window.scroll(0, 0);
                
                $($window).trigger('scroll');
                
                expect(scrollEl[0].style.top).toBe("20px");
            
                expect(scrollEl).not.toHaveClass('bb-grid-filters-fixed-bottom');
                expect(scrollEl).toHaveClass('bb-grid-filters-fixed-top');
                
            });
        });  
    });
});