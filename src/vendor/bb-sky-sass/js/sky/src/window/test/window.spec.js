/*jshint browser: true, jasmine: true */
/*global inject, module */

describe('Window', function () {
    'use strict';

    var bbWindow,
        bbWindowConfig,
        previousWindowTitle,
        $timeout;

    beforeEach(module('ngMock'));
    beforeEach(module('sky.window'));

    beforeEach(inject(function (_$timeout_, _bbWindow_, _bbWindowConfig_) {
        bbWindowConfig = _bbWindowConfig_;
        bbWindow = _bbWindow_;
        $timeout = _$timeout_;
        
        previousWindowTitle = document.title;
    }));
    
    afterEach(function () {
        document.title = previousWindowTitle;
    });

    describe('setWindowTitle() method', function () {
        function testTitle(newTitle, expectedFullTitle) {
            bbWindow.setWindowTitle(newTitle);

            $timeout.flush();

            expect(document.title).toBe(expectedFullTitle || newTitle);
        }
        
        it('should set the window title', function () {
            testTitle('New Title');
        });

        it('should include the product name in the window title', function () {
            bbWindowConfig.productName = 'Tester\'s Edge';
            
            testTitle('New Title', 'New Title - Tester\'s Edge');
        });

        it('should just use the product name with an empty window title', function () {
            bbWindowConfig.productName = 'Tester\'s Edge';
            
            testTitle('', 'Tester\'s Edge');
        });
    });
});