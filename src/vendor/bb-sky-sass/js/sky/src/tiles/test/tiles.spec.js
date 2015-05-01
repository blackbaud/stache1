/*jshint browser: true, jasmine: true */
/*global angular, inject, module, $ */

describe('Tile', function () {
    'use strict';
    
    var $compile,
        $rootScope,
        $timeout,
        bbMediaBreakpoints;
    
    function getHeaderEl(el) {
        return el.find('h5.tile-header');
    }
    
    beforeEach(module(
        'ngMock',
        'sky.tiles',
        'sky.templates'
    ));
    
    beforeEach(module(function ($provide) {
        bbMediaBreakpoints = {
            register: function (handler) {
                this.handlers = this.handlers || [];
                
                this.handlers.push(handler);
                
                handler(this.getCurrent());
            },
            unregister: angular.noop,
            getCurrent: function () {
                return {xs: true};
            }
        };
        
        $provide.value('bbMediaBreakpoints', bbMediaBreakpoints);
    }));
    
    beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
    }));
    
    describe('directive', function () {
        var testTiles;

        function createTileIdSpy(tileId) {
            spyOn($.fn, 'parent').and.callFake(function () {
                return {
                    attr: function (name) {
                        if (name === 'data-tile-id') {
                            return tileId;
                        }
                    }
                };
            });
        }
        
        function initializeTile($scope, tileId) {
            var el = $compile(
                '<bb-tile bb-tile-collapsed="tileCollapsed">a</bb-tile>'
            )($scope);
            
            $scope.$digest();
            
            createTileIdSpy(tileId);
            
            $rootScope.$broadcast('tilesInitialized', {
                tiles: testTiles
            });
            $scope.$digest();
            $timeout.flush();
            
            return el;
        }
        
        beforeEach(function () {
            testTiles  = [
                {
                    id: 'Tile1',
                    collapsed: false,
                    collapsed_small: true
                },
                {
                    id: 'Tile2',
                    collapsed: true
                }
            ];
        });
        
        it('should render the header text in the expected element', function () {
            var $scope = $rootScope.$new(),
                el;
            
            el = $compile('<bb-tile bb-tile-header="tileHeader"></bb-tile>')($scope);
            
            $scope.tileHeader = 'Test header';
            
            $scope.$digest();
            
            expect(getHeaderEl(el)).toHaveText($scope.tileHeader);
        });
        
        it('should add a CSS class to the modal body when the tile is inside a modal dialog', function () {
            var $scope = $rootScope.$new(),
                el,
                modalEl;
            
            el = $compile('<bb-tile bb-tile-header="tileHeader"></bb-tile>')($scope);
            
            modalEl = $('<div class="modal-body"></div>');
            el.appendTo(modalEl);
            
            $scope.$digest();
            
            expect(modalEl).toHaveClass('modal-body-tiled');
        });
        
        it('should collapse/expand when the header is clicked', function () {
            var $scope = $rootScope.$new(),
                el,
                headerEl;
            
            el = $compile(
                '<bb-tile bb-tile-header="tileHeader" bb-tile-collapsed="tileCollapsed">a</bb-tile>'
            )($scope);
            
            $scope.tileHeader = 'Test header';
            
            $scope.$digest();
            
            headerEl = getHeaderEl(el);
            
            expect(el).toHaveClass('collapsible');
            expect($scope.tileCollapsed).toBeFalsy();
            
            headerEl.click();
            
            expect(el).toHaveClass('collapsed');
            expect($scope.tileCollapsed).toBe(true);
            
            headerEl.click();
            
            expect(el).toHaveClass('collapsible');
            expect($scope.tileCollapsed).toBe(false);
        });
        
        it('should collapse/expand when the bb-tile-collapsed value changes', function () {
            var $scope = $rootScope.$new(),
                el,
                elScope;
            
            el = $compile(
                '<bb-tile bb-tile-collapsed="tileCollapsed">a</bb-tile>'
            )($scope);
            
            $scope.$digest();
            
            elScope = el.isolateScope();
            
            expect(el).toHaveClass('collapsible');
            expect(elScope.isCollapsed).toBeFalsy();
            
            $scope.tileCollapsed = true;
            $scope.$digest();
            
            expect(el).toHaveClass('collapsed');
            expect(elScope.isCollapsed).toBe(true);
            
            $scope.tileCollapsed = false;
            $scope.$digest();
            
            expect(el).toHaveClass('collapsible');
            expect(elScope.isCollapsed).toBe(false);
        });
        
        it('should update the tile state the tile dashboard is initialized', function () {
            var $scope = $rootScope.$new(),
                el,
                elScope;
            
            el = initializeTile($scope, 'Tile2');
            elScope = el.isolateScope();
            
            expect(elScope.tileId).toBe('Tile2');
        });
        
        it('should notify the tile dashboard when the tile is collapsed', function () {
            var $scope = $rootScope.$new(),
                el,
                elScope,
                stateChangedFired;
            
            el = initializeTile($scope, 'Tile1');
            elScope = el.isolateScope();
            
            $rootScope.$on('tileStateChanged', function (event, data) {
                stateChangedFired = true;
                
                expect(data).toEqual({
                    tileId: 'Tile1',
                    collapsed: true
                });
            });
            
            $scope.tileCollapsed = true;
            $scope.$digest();
            $timeout.flush();
            
            expect(stateChangedFired).toBe(true);
        });
        
        it('should notify the tile that repaint is required when the tile is expanded', function () {
            var $scope = $rootScope.$new(),
                el,
                elScope,
                repaintSpy;
            
            el = initializeTile($scope, 'Tile1');
            elScope = el.isolateScope();
            
            repaintSpy = spyOn(elScope, '$broadcast').and.callThrough();
            
            $scope.tileCollapsed = true;
            $scope.$digest();
            $timeout.flush();
            
            expect(repaintSpy).not.toHaveBeenCalledWith('tileRepaint');
            
            $scope.tileCollapsed = false;
            $scope.$digest();
            $timeout.flush();
            
            expect(repaintSpy).toHaveBeenCalledWith('tileRepaint');
        });
        
        it('should react when tile display mode changes', function () {
            var $scope = $rootScope.$new(),
                el,
                elScope;
            
            el = initializeTile($scope, 'Tile1');
            elScope = el.isolateScope();
            
            $rootScope.$broadcast('tileDisplayModeChanged', {
                smallTileDisplayMode: true,
                tiles: testTiles
            });
            
            expect(elScope.smallTileDisplayMode).toBe(true);
            expect(elScope.isCollapsed).toBe(true);
            
            $rootScope.$broadcast('tileDisplayModeChanged', {
                smallTileDisplayMode: false,
                tiles: testTiles
            });
            
            expect(elScope.smallTileDisplayMode).toBe(false);
            expect(elScope.isCollapsed).toBe(false);
            
            // Missing tile should just return whatever the small tile display mode is.
            $rootScope.$broadcast('tileDisplayModeChanged', {
                smallTileDisplayMode: true,
                tiles: []
            });
            
            expect(elScope.smallTileDisplayMode).toBe(true);
            expect(elScope.isCollapsed).toBe(true);
        });
        
        it('should not update tile state when display mode changed but the tile have not been initialized by the tile dashboard', function () {
            var $scope = $rootScope.$new(),
                el,
                elScope;
            
            el = $compile('<bb-tile bb-tile-collapsed="isCollapsed"></bb-tile>')($scope);
            
            $scope.isCollapsed = false;
            $scope.$digest();
            
            createTileIdSpy('Tile1');
            
            elScope = el.isolateScope();
            
            $rootScope.$broadcast('tileDisplayModeChanged', {
                smallTileDisplayMode: true,
                tiles: testTiles
            });
            
            expect(elScope.isCollapsed).toBe(false);
        });
        
        it('should not update tile state when display mode changed but the tile have not been initialized by the tile dashboard', function () {
            var $scope = $rootScope.$new(),
                el,
                elScope;
            
            el = $compile('<bb-tile bb-tile-collapsed="isCollapsed"></bb-tile>')($scope);
            
            $scope.isCollapsed = false;
            $scope.$digest();
            
            createTileIdSpy('Tile1');
            
            elScope = el.isolateScope();
            
            $rootScope.$broadcast('tilesInitialized', {
                smallTileDisplayMode: true
            });
            
            expect(elScope.smallTileDisplayMode).toBe(true);
            
            // This should have no effect if the tile has already been initialized.
            $rootScope.$broadcast('tilesInitialized', {
                smallTileDisplayMode: false
            });
            
            expect(elScope.smallTileDisplayMode).toBe(true);
        });
    });
    
    describe('section directive', function () {
        it('should add the expected CSS class to the element', function () {
            var el = $compile('<div bb-tile-section></div>')($rootScope);
            
            expect(el).toHaveClass('tile-content-section');
        });
    });
    
    describe('dashboard directive', function () {
        function validateTileColumn(breakpoint, expectedColumn, shouldHaveTwoColumns) {
            var $scope = $rootScope.$new(),
                el,
                fakeBreakpoint = {};

            bbMediaBreakpoints.getCurrent = function () {
                return fakeBreakpoint;
            };

            el = $compile('<bb-tile-dashboard bb-layout="layout" bb-tiles="tiles"></bb-tile-dashboard>')($scope);

            el.appendTo(document.body);

            fakeBreakpoint[breakpoint] = true;

            $scope.layout = {
                two_column_layout: [
                    [],
                    [
                        'Tile1'
                    ]
                ]
            };

            $scope.tiles = [
                {
                    id: 'Tile1'
                }
            ];

            $scope.$digest();
            $timeout.flush();

            expect(el.hasClass('page-content-multicolumn')).toBe(shouldHaveTwoColumns);
            expect(el.find('[data-dashboard-column="2"]').is(':visible')).toBe(shouldHaveTwoColumns);
            expect(el.find('[data-dashboard-column="' + expectedColumn + '"] > [data-tile-id="Tile1"]').length).toBe(1);
            
            el.remove();
        }
        
        function createTileDashboard($scope, breakpoint, addAllCollapsed) {
            var el,
                fakeBreakpoint = {},
                sortableSpy,
                updateCallback;
            
            sortableSpy = spyOn($.fn, 'sortable').and.callFake(function (sortableOptions) {
                if ($(this).attr('data-dashboard-column') && sortableOptions.update) {
                    updateCallback = sortableOptions.update;
                }
            });
            
            bbMediaBreakpoints.getCurrent = function () {
                return fakeBreakpoint;
            };
            
            el = $compile(
                '<bb-tile-dashboard bb-layout="layout" bb-tiles="tiles"' + 
                (addAllCollapsed ? ' bb-tile-dashboard-all-collapsed="allCollapsed"' : '') + 
                '></bb-tile-dashboard>'
            )($scope);
            
            fakeBreakpoint[breakpoint] = true;
            
            return {
                el: el,
                update: function () {
                    updateCallback();
                }
            };
        }
        
        it('should put the tile in the expected column for each breakpoint', function () {
            validateTileColumn('lg', 2, true);
            validateTileColumn('md', 2, true);
            validateTileColumn('sm', 1, false);
            validateTileColumn('xs', 1, false);
        });
        
        it('should remove the media breakpoint listener when destroyed', function () {
            var $scope = $rootScope.$new(),
                el,
                registerSpy,
                unregisterSpy;
            
            el = $compile('<bb-tile-dashboard></bb-dashboard>')($scope);
            
            registerSpy = spyOn(bbMediaBreakpoints, 'register').and.callThrough();
            unregisterSpy = spyOn(bbMediaBreakpoints, 'unregister').and.callThrough();
            
            $scope.$digest();
            
            expect(registerSpy).toHaveBeenCalled();
            
            el.remove();
            
            expect(unregisterSpy).toHaveBeenCalled();
        });
        
        it('should parse tile order when tile moves to another column', function () {
            var $scope = $rootScope.$new(),
                dashboard;
            
            dashboard = createTileDashboard($scope, 'lg');
            
            $scope.layout = {
                two_column_layout: [
                    [],
                    [
                        'Tile1'
                    ]
                ]
            };
            
            $scope.tiles = [
                {
                    id: 'Tile1'
                }
            ];
            
            $scope.$digest();
            $timeout.flush();
            
            // Simulate drag-drop of tile from one column to another
            dashboard.el.find('[data-tile-id="Tile1"]').appendTo(dashboard.el.find('[data-dashboard-column="1"]'));
            dashboard.update();
            
            $scope.$digest();
            
            expect($scope.layout.two_column_layout).toEqual([
                [
                    'Tile1'
                ],
                []
            ]);
        });
        
        it('should parse tile order when tile moves within a column', function () {
            var $scope = $rootScope.$new(),
                dashboard;
            
            dashboard = createTileDashboard($scope, 'xs');
            
            $scope.layout = {
                one_column_layout: [
                    'Tile1',
                    'Tile2'
                ]
            };
            
            $scope.tiles = [
                {
                    id: 'Tile1'
                },
                {
                    id: 'Tile2'
                }
            ];
            
            $scope.$digest();
            $timeout.flush();
            
            // Simulate drag-drop of tile to the bottom of the column
            dashboard.el.find('[data-tile-id="Tile1"]').appendTo(dashboard.el.find('[data-dashboard-column="1"]'));
            dashboard.update();
            
            $scope.$digest();
            
            expect($scope.layout.one_column_layout).toEqual([
                'Tile2',
                'Tile1'
            ]);
        });
        
        it('should update the tile collapsed state when the tile is collapsed', function () {
            var $scope = $rootScope.$new(),
                dashboard;
            
            dashboard = createTileDashboard($scope, 'lg');
            
            $scope.layout = {
                two_column_layout: [
                    [
                        'Tile1',
                        'Tile2'
                    ],
                    []
                ]
            };
            
            $scope.tiles = [
                {
                    id: 'Tile1',
                    collapsed: false
                },
                {
                    id: 'Tile2'
                }
            ];
            
            $scope.$digest();
            $timeout.flush();
            
            $rootScope.$broadcast('tileStateChanged', {
                tileId: 'Tile1',
                collapsed: true
            });
            
            expect($scope.tiles[0].collapsed).toBe(true);
            
            $rootScope.$broadcast('tileStateChanged', {
                tileId: 'Tile1'
                // Leaving out the collapsed property should default to false
            });
            
            expect($scope.tiles[0].collapsed).toBe(false);
        });
        
        it('should update the tile collapsed small state when the tile is collapsed on a small screen', function () {
            var $scope = $rootScope.$new(),
                dashboard;
            
            dashboard = createTileDashboard($scope, 'xs');
            
            $scope.layout = {
                two_column_layout: [
                    [
                        'Tile1',
                        'Tile2'
                    ],
                    []
                ]
            };
            
            $scope.tiles = [
                {
                    id: 'Tile1',
                    collapsed_small: false
                },
                {
                    id: 'Tile2'
                }
            ];
            
            $scope.$digest();
            $timeout.flush();
            
            $rootScope.$broadcast('tileStateChanged', {
                tileId: 'Tile1',
                collapsed: true
            });
            
            expect($scope.tiles[0].collapsed_small).toBe(true);
            
            $rootScope.$broadcast('tileStateChanged', {
                tileId: 'Tile1'
                // Leaving out the collapsed property should default to false
            });
            
            expect($scope.tiles[0].collapsed_small).toBe(false);
        });
        
        it('should update the all-collapsed state when a tile\'s collapsed state changes', function () {
            var $scope = $rootScope.$new(),
                dashboard;
            
            dashboard = createTileDashboard($scope, 'lg', true);
            
            $scope.layout = {
                two_column_layout: [
                    [
                        'Tile1',
                        'Tile2'
                    ],
                    []
                ]
            };
            
            $scope.tiles = [
                {
                    id: 'Tile1',
                    collapsed: false
                },
                {
                    id: 'Tile2',
                    collapsed: true
                }
            ];
            
            $scope.$digest();
            $timeout.flush();
            
            $scope.tiles[0].collapsed = true;
            
            $rootScope.$broadcast('tileStateChanged', {
                tileId: 'Tile1',
                collapsed: true
            });
            
            expect($scope.allCollapsed).toBe(true);
            
            $scope.tiles[0].collapsed = false;
            
            $rootScope.$broadcast('tileStateChanged', {
                tileId: 'Tile1',
                collapsed: false
            });
            
            expect($scope.allCollapsed).toBe(null);
            
            $scope.tiles[1].collapsed = false;
            
            $rootScope.$broadcast('tileStateChanged', {
                tileId: 'Tile2',
                collapsed: false
            });
            
            expect($scope.allCollapsed).toBe(false);
        });
        
        it('should update the tile collapsed state when the tile all-collapsed attribute changes', function () {
            var $scope = $rootScope.$new(),
                dashboard,
                tile1,
                tile2;
            
            dashboard = createTileDashboard($scope, 'lg', true);
            
            $scope.layout = {
                two_column_layout: [
                    [
                        'Tile1',
                        'Tile2'
                    ],
                    []
                ]
            };
            
            tile1 = {
                id: 'Tile1',
                collapsed: true,
                collapsed_small: false
            };
            
            tile2 = {
                id: 'Tile2',
                collapsed: false,
                collapsed_small: true
            };
            
            $scope.tiles = [tile1, tile2];
            
            $scope.allCollapsed = true;
            
            $scope.$digest();
            
            expect(tile1.collapsed).toBe(true);
            expect(tile1.collapsed_small).toBe(false);
            
            expect(tile2.collapsed).toBe(true);
            expect(tile2.collapsed_small).toBe(true);
            
            $scope.allCollapsed = false;
            
            $scope.$digest();
            
            expect(tile1.collapsed).toBe(false);
            expect(tile1.collapsed_small).toBe(false);
            
            expect(tile2.collapsed).toBe(false);
            expect(tile2.collapsed_small).toBe(true);
        });
        
        it('should update the tile collapsed small state when the tile all-collapsed attribute changes', function () {
            var $scope = $rootScope.$new(),
                dashboard,
                tile1,
                tile2;
            
            dashboard = createTileDashboard($scope, 'xs', true);
            
            $scope.layout = {
                two_column_layout: [
                    [
                        'Tile1',
                        'Tile2'
                    ],
                    []
                ]
            };
            
            tile1 = {
                id: 'Tile1',
                collapsed: true,
                collapsed_small: false
            };
            
            tile2 = {
                id: 'Tile2',
                collapsed: false,
                collapsed_small: true
            };
            
            $scope.tiles = [tile1, tile2];
            
            $scope.allCollapsed = true;
            
            $scope.$digest();
            
            expect(tile1.collapsed).toBe(true);
            expect(tile1.collapsed_small).toBe(true);
            
            expect(tile2.collapsed).toBe(false);
            expect(tile2.collapsed_small).toBe(true);
            
            $scope.allCollapsed = false;
            
            $scope.$digest();
            
            expect(tile1.collapsed).toBe(true);
            expect(tile1.collapsed_small).toBe(false);
            
            expect(tile2.collapsed).toBe(false);
            expect(tile2.collapsed_small).toBe(false);
        });
    });
});