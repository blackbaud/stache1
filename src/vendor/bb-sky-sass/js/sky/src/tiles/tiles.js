/*jslint browser: true, plusplus: true */
/*global angular */

/** @module Tiles
 @description The `bb-tile` directive creates a collapsible container and is the bulding block for pages and forms in a Sky application.  The `bb-tile-section` directive is used to create padded sections inside a `bb-tile` element.

When used on forms, it automatically adjusts the background color on the form and shrinks the tile header.

### Tile Settings ###

 - `bb-tile-header` The header text for the tile.
 */

(function () {
    'use strict';

    //Removes the specified tiles from the source container and appends them
    //in the specified order to the target container.
    function moveTilesToContainer(sourceContainer, targetContainer, tiles) {
        angular.forEach(tiles, function (tileId) {
            var tile = sourceContainer.find('[data-tile-id="' + tileId + '"]');
            targetContainer.append(tile);
        });
    }

    //Returns an array of tile names in the order they appear in the specified container.
    function parseTileOrder(container) {
        var tiles = [];
        container.find('[data-tile-id]').each(function () {
            tiles.push(angular.element(this).data('tile-id'));
        });
        return tiles;
    }

    angular.module('sky.tiles', ['sky.mediabreakpoints'])
        .directive('bbTile', ['$timeout', function ($timeout) {
            return {
                link: function (scope, el, attrs) {
                    var displayModeChanging = false,
                        tileInitialized = false,
                        parentModal;

                    //determines whether or not a tile is collapsed
                    function tileIsCollapsed(tileId, tiles) {
                        var i,
                            len = tiles.length,
                            tile;

                        for (i = 0; i < len; i++) {
                            tile = tiles[i];

                            if (tile.id === tileId) {
                                return scope.smallTileDisplayMode ? tile.collapsed_small : tile.collapsed;
                            }
                        }

                        return !!scope.smallTileDisplayMode;
                    }

                    //sets the collapsed state of the tile based on the tile settings and the display mode
                    function updateTileState(tiles) {
                        var collapsed;

                        tiles = tiles || /*istanbul ignore next: default value */ [];

                        collapsed = tileIsCollapsed(scope.tileId, tiles);
                        scope.isCollapsed = collapsed;

                        if (collapsed && !tileInitialized) {
                            //in some cases the tile-content div is left in a partially collapsed state. 
                            //   this will ensure that the tile is styled corretly and the tile is completely collapsed
                            $timeout(function () {
                                var contentEl;
                                contentEl = el.find('.tile-content');
                                contentEl.removeClass('collapsing').addClass('collapse');
                            }, 1);
                        }
                    }
                    
                    scope.isCollapsed = scope.bbTileCollapsed || false;
                    scope.smallTileDisplayMode = false;
                    scope.tileId = '';

                    //If the tile is inside a modal form, then add a class to modify the form background color.
                    parentModal = el.parents('div.modal-body');
                    if (parentModal && parentModal.length > 0) {
                        parentModal.addClass('modal-body-tiled');
                    }


                    scope.titleClick = function () {
                        scope.isCollapsed = !scope.isCollapsed;
                        scope.scrollIntoView = !scope.isCollapsed;
                    };

                    //listens for the tileModeChanged event from the tileDashboard and updates the collapsed state of the tiles based on whether or not the tiles are in small display mode
                    scope.$on('tileDisplayModeChanged', function (event, data) {
                        /*jslint unparam: true */
                        scope.smallTileDisplayMode = data.smallTileDisplayMode || false;

                        if (tileInitialized) {
                            displayModeChanging = true;
                            updateTileState(data.tiles);
                        }
                    });

                    //listens for the tilesInitialized event from the tileDashboard and updates the initial collapsed state of the tiles
                    scope.$on('tilesInitialized', function (event, data) {
                        /*jslint unparam: true */
                        var tiles = data.tiles || /*istanbul ignore next: default value */ [];

                        if (!tileInitialized) {
                            //retrieve the tile id from the parent container
                            scope.tileId = el.parent().attr('data-tile-id') || /*istanbul ignore next: default value */ '';
                            scope.smallTileDisplayMode = data.smallTileDisplayMode || false;
                        }

                        updateTileState(tiles);

                        tileInitialized = true;
                    });

                    //if the collapsed state changes, notify the tileDashboard
                    scope.$watch('isCollapsed', function () {
                        if (tileInitialized && !displayModeChanging) {
                            $timeout(function () {
                                scope.$emit('tileStateChanged', {
                                    tileId: scope.tileId,
                                    collapsed: scope.isCollapsed
                                });
                            });
                        }
                        displayModeChanging = false;

                        if (!scope.isCollapsed) {
                            $timeout(function () {
                                scope.$broadcast('tileRepaint');
                            });
                        }
                        
                        scope.bbTileCollapsed = scope.isCollapsed;
                    });

                    if (attrs.bbTileCollapsed) {
                        scope.$watch('bbTileCollapsed', function (newValue) {
                            scope.isCollapsed = newValue;
                        });
                    }
                },
                replace: true,
                restrict: 'E',
                scope: {
                    bbTileCollapsed: '=?',
                    tileHeader: '=bbTileHeader'
                },
                controller: angular.noop,
                templateUrl: 'sky/templates/tiles/tile.html',
                transclude: true
            };
        }])
        .directive('bbTileSection', function () {
            return {
                restrict: 'A',
                template: function (el) {
                    el.addClass('tile-content-section');
                }
            };
        })
        .directive('bbTileDashboard', ['$timeout', 'bbMediaBreakpoints', function ($timeout, bbMediaBreakpoints) {
            return {
                replace: true,
                restrict: 'E',
                scope: {
                    tiles: '=bbTiles',
                    layout: '=bbLayout',
                    allCollapsed: '=bbTileDashboardAllCollapsed'
                },
                link: function (scope, element, attrs) {
                    var column1 = element.find('[data-dashboard-column="1"]'),
                        column2 = element.find('[data-dashboard-column="2"]'),
                        singleColumnMode = false,
                        smallTileDisplayMode = false,
                        sortableOptions;

                    //Inspects the tiles in each column and updates model accordingly.
                    function parseColumnTiles() {
                        scope.$apply(function () {
                            var layout = scope.layout;

                            if (singleColumnMode) {
                                layout.one_column_layout = parseTileOrder(column1);
                            } else {
                                layout.two_column_layout[0] = parseTileOrder(column1);
                                layout.two_column_layout[1] = parseTileOrder(column2);
                            }
                        });
                    }

                    //Layouts out the tiles based on the current one column or two column configuration
                    function layoutTiles() {
                        var layout = scope.layout;

                        if (layout) {
                            if (singleColumnMode) {
                                moveTilesToContainer(element, column1, layout.one_column_layout);
                            } else {
                                moveTilesToContainer(element, column1, layout.two_column_layout[0]);
                                moveTilesToContainer(element, column2, layout.two_column_layout[1]);
                            }
                        }
                    }
                    
                    function fireDisplayModeChanged() {
                        scope.$broadcast('tileDisplayModeChanged', {
                            smallTileDisplayMode: smallTileDisplayMode,
                            tiles: scope.tiles
                        });
                    }

                    function mediabreakpointChangeHandler(breakPoints) {
                        singleColumnMode = (breakPoints.xs || breakPoints.sm);
                        layoutTiles();

                        if (singleColumnMode) {
                            element.removeClass('page-content-multicolumn');
                            column2.hide();
                        } else {
                            element.addClass('page-content-multicolumn');
                            column2.show();
                        }

                        smallTileDisplayMode = breakPoints.xs;
                        
                        fireDisplayModeChanged();
                    }

                    //Setup jQuery sortable (drag and drop) options for the dashboard columns
                    sortableOptions = {
                        connectWith: '[data-dashboard-column]',
                        update: parseColumnTiles,
                        opacity: 0.8,
                        handle: '.tile-grab-handle',
                        placeholder: 'placeholder ibox',
                        forcePlaceholderSize: true,
                        revert: 250
                    };

                    //Setup jQuery sortable drag/drop for the columns
                    column1.sortable(sortableOptions);
                    column2.sortable(sortableOptions);

                    bbMediaBreakpoints.register(mediabreakpointChangeHandler);

                    element.on('$destroy', function () {
                        bbMediaBreakpoints.unregister(mediabreakpointChangeHandler);
                    });

                    scope.$watch('tiles', function () {
                        $timeout(function () {
                            layoutTiles();
                            scope.$broadcast('tilesInitialized', {
                                smallTileDisplayMode: smallTileDisplayMode,
                                tiles: scope.tiles
                            });
                        });
                    });
                    
                    scope.$watch('allCollapsed', function (newValue) {
                        var i,
                            n,
                            tiles = scope.tiles;
                        
                        // Check for an explicit true/false here since null/undefined is the
                        // indeterminate state.
                        if (newValue === true || newValue === false) {
                            for (i = 0, n = tiles.length; i < n; i++) {
                                if (smallTileDisplayMode) {
                                    tiles[i].collapsed_small = newValue;
                                } else {
                                    tiles[i].collapsed = newValue;
                                }
                            }
                        
                            fireDisplayModeChanged();
                        }
                    });
                    
                    scope.$on('tileStateChanged', function (event, data) {
                        /*jslint unparam: true */
                        scope.$apply(function () {
                            var allCollapsed = null,
                                collapsed,
                                collapsedProp,
                                i,
                                n,
                                tile,
                                tileId = data.tileId || /*istanbul ignore next: default value */ '',
                                tiles = scope.tiles;

                            collapsed = data.collapsed || false;
                            collapsedProp = smallTileDisplayMode ? 'collapsed_small' : 'collapsed';
                            
                            for (i = 0, n = tiles.length; i < n; i++) {
                                tile = tiles[i];
                                
                                if (tile.id === tileId) {
                                    tile[collapsedProp] = collapsed;
                                }
                                
                                if (i > 0 && tile[collapsedProp] !== allCollapsed) {
                                    allCollapsed = null;
                                } else {
                                    allCollapsed = tile[collapsedProp];
                                }
                            }
                            
                            if (attrs.bbTileDashboardAllCollapsed) {
                                scope.allCollapsed = allCollapsed;
                            }
                        });
                    });
                },
                controller: angular.noop,
                templateUrl: 'sky/templates/tiles/tiledashboard.html'
            };
        }]);
}());