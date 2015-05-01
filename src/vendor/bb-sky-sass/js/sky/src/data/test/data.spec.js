/*jshint browser: true, jasmine: true */
/*global angular, inject, module */

describe('Data service', function () {
    'use strict';

    var bbData,
        bbDataConfig,
        postData,
        putData,
        saveData,
        $httpBackend,
        $rootScope,
        $templateCache;

    beforeEach(module('ngMock'));
    beforeEach(module('sky.data'));

    beforeEach(inject(function (_bbData_, _bbDataConfig_, _$httpBackend_, _$rootScope_, _$templateCache_) {
        bbData = _bbData_;
        bbDataConfig = _bbDataConfig_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $templateCache = _$templateCache_;

        postData = {
            query: 'abc'
        };

        putData = {
            id: 2,
            name: 'steve'
        };

        saveData = {
            name: 'bob'
        };

        $httpBackend
            .when('GET', '/foo/data')
            .respond(200, {foo: 'bar'});

        $httpBackend
            .when('GET', '/foo/data?abc=123')
            .respond(200, {foo: 'bar'});
        
        $httpBackend
            .when('GET', '/foo/resources')
            .respond(200, {name: 'value'});

        $httpBackend
            .when('GET', '/foo/text')
            .respond(200, '<div></div>');

        $httpBackend
            .when('POST', '/foo/post', JSON.stringify(postData))
            .respond(200, {post: 'worked'});

        $httpBackend
            .when('POST', '/foo/save', JSON.stringify(saveData))
            .respond(200, {id: 1});

        $httpBackend
            .when('PUT', '/foo/put', JSON.stringify(putData))
            .respond(200, {id: 2});

        $httpBackend
            .when('GET', '/foo/404')
            .respond(404);
    }));

    describe('load() method', function () {
        it('should return single data object', function () {
            bbData.load({
                data: '/foo/data'
            }).then(function (result) {
                expect(result.data.foo).toBe('bar');
            });

            $httpBackend.flush();
        });

        it('should return multiple data objects', function () {
            bbData.load({
                data: {
                    a: '/foo/data',
                    b: '/foo/data'
                }
            }).then(function (result) {
                expect(result.data.a.foo).toBe('bar');
                expect(result.data.b.foo).toBe('bar');
            });

            $httpBackend.flush();
        });

        it('should return single resources object', function () {
            bbData.load({
                resources: '/foo/resources'
            }).then(function (result) {
                expect(result.resources.name).toBe('value');
            });

            $httpBackend.flush();
        });

        it('should return multiple resources objects', function () {
            bbData.load({
                resources: {
                    c: '/foo/resources',
                    d: '/foo/resources'
                }
            }).then(function (result) {
                expect(result.resources.c.name).toBe('value');
                expect(result.resources.d.name).toBe('value');
            });

            $httpBackend.flush();
        });

        it('should return data, resources and text objects', function () {
            bbData.load({
                data: '/foo/data',
                resources: '/foo/resources',
                text: '/foo/text'
            }).then(function (result) {
                expect(result.data.foo).toBe('bar');
                expect(result.resources.name).toBe('value');
                expect(result.text).toBe('<div></div>');
            });

            $httpBackend.flush();
        });

        it('should bypass $http if text is present in $templateCache', function () {
            // $httpBackend mock doesn't expect /foo/cache, so this test should fail if bbData
            // doesn't look in the template cache first.
            $templateCache.put('/foo/cache', '<input type="text" />');

            bbData.load({
                text: '/foo/cache'
            }).then(function (result) {
                expect(result.text).toBe('<input type="text" />');
            });
        });

        it('should fall into catch() on 404 response', function () {
            bbData.load({
                data: '/foo/404'
            }).then(function () {
                fail('Request did not fall into catch().');
            }).catch(function (result) {
                expect(result.status).toBe(404);
            });

            $httpBackend.flush();
        });
    });

    describe('query() method', function () {
        it('should create a query string based on an object\'s properties', function () {
            var urlWithQuery = bbData.query('/foo/search', {x: 'y', z: 123});

            expect(urlWithQuery).toBe('/foo/search?x=y&z=123');
        });
    });

    describe('post() method', function () {
        it('should issue a POST with the provided data', function () {
            bbData.load({
                data: bbData.post('/foo/post', postData)
            }).then(function (result) {
                expect(result.data.post).toBe('worked');
            });

            $httpBackend.flush();
        });
    });

    describe('save() method', function () {
        it('should issue a POST with the provided data', function () {
            bbData.save({
                url: '/foo/save',
                data: saveData
            }).then(function (result) {
                expect(result.data.id).toBe(1);
            });

            $httpBackend.flush();
        });

        it('should issue the request with a specified HTTP verb', function () {
            bbData.save({
                url: '/foo/put',
                data: putData,
                type: 'PUT'
            }).then(function (result) {
                expect(result.data.id).toBe(2);
            });

            $httpBackend.flush();
        });
    });
    
    describe('when require is present', function () {
        var windowDefine,
            windowRequire;
        
        beforeEach(function () {
            windowDefine = window.define;
            windowRequire = window.require;
            
            window.define = {
                amd: true
            };
            
            window.require = {
                toUrl: angular.noop
            };
        });
        
        afterEach(function () {
            window.define = windowDefine;
            window.require = windowRequire;
        });
        
        it('should not pass the query string to the require.toUrl() method', function () {
            var toUrlSpy;
            
            toUrlSpy = spyOn(window.require, 'toUrl');
            
            bbData.load({
                data: '/foo/data?abc=123'
            });
            
            expect(toUrlSpy).toHaveBeenCalledWith('/foo/data');
        });
    });
    
    describe('config', function () {
        var dataUrlFilter,
            resourceUrlFilter,
            textUrlFilter;
        
        beforeEach(function () {
            function filter(url) {
                return url;
            }
            
            dataUrlFilter = bbDataConfig.dataUrlFilter;
            resourceUrlFilter = bbDataConfig.resourceUrlFilter;
            textUrlFilter = bbDataConfig.textUrlFilter;
            
            angular.extend(bbDataConfig, {
                dataUrlFilter: filter,
                resourceUrlFilter: filter,
                textUrlFilter: filter
            });
        });
        
        afterEach(function () {
            angular.extend(bbDataConfig, {
                dataUrlFilter: dataUrlFilter,
                resourceUrlFilter: resourceUrlFilter,
                textUrlFilter: textUrlFilter
            });
        });
        
        it('should allow custom filter functions for each request type', function () {
            var dataUrlFilterSpy = spyOn(bbDataConfig, 'dataUrlFilter').and.callThrough(),
                resourceUrlFilterSpy = spyOn(bbDataConfig, 'resourceUrlFilter').and.callThrough(),
                textUrlFilterSpy = spyOn(bbDataConfig, 'textUrlFilter').and.callThrough();
            
            bbData.load({
                data: '/foo/data',
                resources: '/foo/resources',
                text: '/foo/text'
            });
            
            expect(dataUrlFilterSpy).toHaveBeenCalledWith('/foo/data');
            expect(resourceUrlFilterSpy).toHaveBeenCalledWith('/foo/resources');
            expect(textUrlFilterSpy).toHaveBeenCalledWith('/foo/text');
        });
    });
    
    describe('load manager', function () {
        it('should raise the expected registered and completed events', function () {
            var $scope = $rootScope.$new(),
                completedFired = false,
                registerFired = false;
            
            $rootScope.$on('bbData.loadManager.registerItem', function () {
                registerFired = true;
            });
            
            $rootScope.$on('bbData.loadManager.markCompleted', function () {
                completedFired = true;
            });
            
            bbData.load({
                data: '/foo/data',
                loadManager: {
                    scope: $scope,
                    name: 'LoadManagerTest'
                }
            });

            expect(registerFired).toBe(true);
            expect(completedFired).toBe(false);
            
            $httpBackend.flush();
            
            expect(completedFired).toBe(true);
        });
        
        it('should start a page wait when the first child item begins to load', function () {
            var $scope = $rootScope.$new(),
                beginWaitFired;
            
            $rootScope.$on('bbBeginWait', function () {
                beginWaitFired = true;
            });
            
            bbData.load({
                data: '/foo/data',
                loadManager: {
                    scope: $scope,
                    name: 'LoadManagerTest',
                    waitForFirstItem: true
                }
            });
            
            expect(beginWaitFired).toBe(true);
        });
    });
});