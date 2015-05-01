/*jslint browser: true, plusplus: true */
/*global angular */

/** @module Tabs
 @description ### *Deprecated* ###

This directive is no longer being maintained.  For creating tabs, see the [Angular UI Bootstrap](https://angular-ui.github.io/bootstrap/) tabs directive and use it in conjunction with the [Tabscroll](#tabscroll) and [Tabsref](#tabsref) components if needed.

<s>
### Additional Dependencies ###

 - **[jQuery Responsive Tabs](https://github.com/jellekralt/Responsive-Tabs) (1.4.2 or higher)**
 - **[Angular UI Router](https://github.com/angular-ui/ui-router) (0.2.13 or higher)**

---

The Tabs directive allows for content to be organized into a set of tabs.  The tabs can be grouped together across the tab bar in a `bb-tab-group`.  Within the group,  `bb-tab-group-item` specifies the tab components that can be opened.

### Tab Group Item Settings ###

 - `bb-tab-item-header` The name of the tab
 - `bb-tab-item-count` Optional.  The number of items in the tab.
 - `bb-tab-item-header-function` Optional.  A function which can calculate the tab header and item count.
 - `bbTabItemSref` Optional.  Defines the state reference (?) for the tab.
 </s>
 */

(function () {
    'use strict';

    var elIdSuffix = 0;

    function createListAnchorItem(id, automationId) {
        var automationAttribute;
        if (automationId) {
            automationAttribute = ' data-bbauto-field="' + automationId + '"';
        }
        return '<li><a href="#' + id + '"' + automationAttribute + '></a></li>';
    }

    function createGroupHeaderDiv() {
        return '<div class="rt-tab-accordion-header"></div>';
    }

    function createTabContentDiv(content, id) {
        var tabContentEl = angular.element(content).wrap('<div id="' + id + '"></div>');
        tabContentEl.append('<div class="clearfix"></div>');

        return angular.element("#" + id);
    }

    function getResponsiveTabHeader(headerCount, headerTitle) {
        var header =
            '<div>' +
            '<span class="bb-tab-header-title-responsive">' + (headerTitle || '') + '</span>' +
            '<span class="bb-tab-header-count-responsive">' + (headerCount >= 0 ? headerCount : '') + '</span>' +
            '<div class="bb-tab-header-chervon-responsive glyphicon glyphicon-chevron-down"></div>' +
            '<div class="bb-tab-header-chervon-responsive glyphicon glyphicon-chevron-up"></div>' +
            '</div>';
        return header;
    }

    function getTabHeader(headerCount, headerTitle) {
        var header =
            '<div>' +
            '<span class="bb-tab-header-title">' + (headerTitle || '') + '</span>' +
            '<span class="bb-tab-header-count">' + (headerCount >= 0 ? headerCount : '') + '</span>' +
            '</div>';
        return header;
    }

    angular.module('sky.tabs', [])
        .directive('bbTab', ['$state', '$rootScope', '$timeout',
            function ($state, $rootScope, $timeout) {
                return {
                    replace: true,
                    transclude: true,
                    restrict: 'E',
                    templateUrl: 'sky/templates/tabs/tab.html',
                    scope: {
                        bbTabAutomationId: '=',
                        bbTabOptions: '='
                    },
                    controller: ['$scope', function ($scope) {
                        $scope.tabGroups = [];
                        $scope.tabsInitialized = false;

                        this.addTabGroup = function (group) {
                            $scope.tabGroups.push(group);
                        };

                        this.updateTabItemHeader = function (item) {
                            $scope.updateTabItemHeader(item);
                        };
                    }],
                    link: function ($scope, element) {
                        var activeTab = null,
                            nextTabIndexToUse = 0,
                            stateChangeDeregistration;

                        function getActiveTabIndexFromCurrentState() {
                            var i,
                                j,
                                tabGroup,
                                tabGroupItem,
                                tabGroups = $scope.tabGroups;

                            for (i = 0; i < tabGroups.length; i++) {
                                tabGroup = tabGroups[i];
                                for (j = 0; j < tabGroup.tabs.length; j++) {
                                    tabGroupItem = tabGroup.tabs[j];
                                    if (tabGroupItem.sref && $state.is(tabGroupItem.sref)) {
                                        return tabGroupItem.index - 1;
                                    }
                                }
                            }
                        }

                        function buildTabs() {
                            var contentEls,
                                contentIndex = 0,
                                i,
                                j,
                                tabGroups = $scope.tabGroups,
                                tabGroup,
                                tabGroupItem,
                                unorderedListEl = element.find('ul:first');

                            contentEls = element.find('bb-tab-group-item > div');

                            //take div with ids of each tab and move them outside the ul
                            for (i = 0; i < tabGroups.length; i++) {
                                tabGroup = tabGroups[i];
                                element.append(createGroupHeaderDiv());
                                for (j = 0; j < tabGroup.tabs.length; j++) {
                                    tabGroupItem = tabGroup.tabs[j];
                                    tabGroupItem.index = (++nextTabIndexToUse);
                                    tabGroupItem.id = 'bb-tab-id-' + (++elIdSuffix);

                                    unorderedListEl.append(createListAnchorItem(tabGroupItem.id, tabGroupItem.automationId));
                                    element.append(createTabContentDiv(contentEls[contentIndex], tabGroupItem.id));

                                    contentIndex = contentIndex + 1;
                                }
                                unorderedListEl.append('<li class="rt-tab-spacer"></li>');
                                element.append('<div class="rt-tab-accordion-spacer"></div>');
                            }
                            element.find('bb-tab-group').remove();
                        }

                        function activateActiveTabModel() {
                            if (activeTab) {
                                var activeTabModel,
                                    activeTabId = activeTab.selector.substring(1),
                                    i,
                                    j,
                                    sref,
                                    tabGroup,
                                    tabGroupItem,
                                    tabGroups = $scope.tabGroups;

                                for (i = 0; i < tabGroups.length; i++) {
                                    tabGroup = tabGroups[i];
                                    for (j = 0; j < tabGroup.tabs.length; j++) {
                                        tabGroupItem = tabGroup.tabs[j];
                                        if (tabGroupItem.id === activeTabId) {
                                            activeTabModel = tabGroupItem;
                                        }
                                    }
                                }

                                if (activeTabModel) {
                                    sref = activeTabModel.sref;
                                    if (sref) {
                                        if (!$state.is(sref)) {
                                            // JPB - Delay calling state.go because the state change will fail
                                            // if it is triggered while in the middle of processing of another state change.
                                            // This can happen if you browse to the page without specifying the state of a particular tab
                                            // and then this code tries to switch you over to the state of the first tab.
                                            $timeout(function () {
                                                $state.go(sref);
                                            }, 0);
                                        }
                                    }
                                }
                                //this is where lazy loading/responsive logic would go, fire an event
                            }
                        }

                        function handleTabActivate(event, tab) {
                            /*jslint unparam: true */
                            activeTab = tab;
                            activateActiveTabModel();
                        }

                        function handleTabsActivateState(event, state) {
                            /*jslint unparam: true */
                            if (state.oldState !== state.newState) {
                                activateActiveTabModel();
                            }
                        }

                        //https://github.com/jellekralt/Responsive-Tabs
                        function addResponsiveTabs() {
                            var defaults,
                                fixed,
                                options;

                            defaults = {
                                active: getActiveTabIndexFromCurrentState() || 0,
                                collapsible: 'accordion',
                                rotate: false,
                                startCollapsed: false
                            };

                            options = $scope.bbTabOptions || defaults;

                            fixed = {
                                activate: handleTabActivate,
                                activateState: handleTabsActivateState
                                //Needs implementation with routes
                                //setHash: false
                            };

                            options = angular.extend({}, options, fixed);

                            element.responsiveTabs(options);
                        }

                        function headersExistForAllTabs() {
                            var i,
                                j,
                                tabGroup,
                                tabGroupItem;
                            for (i = 0; i < $scope.tabGroups.length; i++) {
                                tabGroup = $scope.tabGroups[i];
                                for (j = 0; j < tabGroup.tabs.length; j++) {
                                    tabGroupItem = tabGroup.tabs[j];
                                    if (!angular.isDefined(tabGroupItem.header) || tabGroupItem.header === null) {
                                        return false;
                                    }
                                }
                            }
                            return true;
                        }

                        function headerCallBack(data, args) {
                            var tabHeaderInfo = data,
                                tabElements;
                            if (tabHeaderInfo) {
                                tabElements = angular.element('a[href=#' + args.id + ']');
                                if (tabElements[0]) {
                                    angular.element(tabElements[0]).html(getTabHeader(tabHeaderInfo.headerCount, tabHeaderInfo.headerTitle));
                                }
                                if (tabElements[1]) {
                                    angular.element(tabElements[1]).html(getResponsiveTabHeader(tabHeaderInfo.headerCount, tabHeaderInfo.headerTitle));
                                }
                            }

                            $scope.tabsInitialized = headersExistForAllTabs();
                        }

                        function initializeTabHeaders() {
                            var headerCallBackArgs,
                                i,
                                j,
                                tabGroup,
                                tabGroupItem;
                            for (i = 0; i < $scope.tabGroups.length; i++) {
                                tabGroup = $scope.tabGroups[i];
                                for (j = 0; j < tabGroup.tabs.length; j++) {
                                    tabGroupItem = tabGroup.tabs[j];

                                    headerCallBackArgs = { id: tabGroupItem.id };
                                    if (angular.isDefined(tabGroupItem.header) && tabGroupItem.header !== null) {
                                        if (angular.isString(tabGroupItem.header)) {
                                            headerCallBack({ headerTitle: tabGroupItem.header }, headerCallBackArgs);
                                        } else {
                                            headerCallBack({ headerTitle: tabGroupItem.header.headerTitle, headerCount: tabGroupItem.header.headerCount }, headerCallBackArgs);
                                        }
                                    }
                                }
                            }
                        }

                        function afterContentRender() {
                            addResponsiveTabs(element[0], $scope.bbTabOptions);
                            initializeTabHeaders();
                        }

                        buildTabs();

                        afterContentRender();

                        stateChangeDeregistration = $rootScope.$on('$stateChangeSuccess', function () {
                            var tabId = getActiveTabIndexFromCurrentState();

                            if (tabId >= 0 && activeTab && tabId !== activeTab.id) {
                                //The state has changed and the new state matches a different tab
                                //than is current active.  Activate that tab.
                                element.responsiveTabs('activate', tabId);
                            }
                        });

                        $scope.updateTabItemHeader = function (item) {
                            var headerObject;
                            if (angular.isString(item.header)) {
                                headerObject = {
                                    headerTitle: item.header
                                };
                            } else {
                                headerObject = {
                                    headerTitle: item.header.headerTitle,
                                    headerCount: item.header.headerCount
                                };
                            }
                            headerCallBack(
                                headerObject,
                                {
                                    id: item.id
                                }
                            );
                        };

                        $scope.$on('$destroy', function () {
                            stateChangeDeregistration();
                            element.responsiveTabs('destroy');
                        });
                    }
                };
            }])
        .directive('bbTabGroup', function () {
            return {
                require: '^bbTab',
                restrict: 'E',
                scope: {
                },
                controller: ['$scope', function ($scope) {
                    $scope.tabGroupItems = [];

                    this.addTabGroupItem = function (item) {
                        $scope.tabGroupItems.push(item);
                    };

                    this.updateTabItemHeader = function (item) {
                        $scope.tabCtrl.updateTabItemHeader(item);
                    };
                }],
                link: function ($scope, element, attrs, tabCtrl) {
                    /*jslint unparam: true */
                    $scope.tabCtrl = tabCtrl;
                    tabCtrl.addTabGroup({ tabs: $scope.tabGroupItems });
                }
            };
        })
        .directive('bbTabGroupItem', function () {
            return {
                require: '^bbTabGroup',
                restrict: 'E',
                transclude: true,
                scope: {
                    bbTabItemHeaderFunction: '&',
                    bbTabItemHeader: '=',
                    bbTabItemCount: '=',
                    bbTabItemSref: '=',
                    bbTabItemAutomationId: '='
                },
                link: function ($scope, element, attrs, tabGroupCtrl) {
                    /*jslint unparam: true */
                    var item = {
                        header: $scope.bbTabItemHeader,
                        sref: $scope.bbTabItemSref,
                        automationId: $scope.bbTabItemAutomationId,
                        id: null
                    };
                    tabGroupCtrl.addTabGroupItem(item);

                    // Watching the header and its child properties so that changes to counts, etc will update the UI.
                    $scope.$watch('bbTabItemHeader', function (newValue) {
                        if (angular.isDefined(newValue) && newValue !== null) {
                            item.header = newValue;
                            tabGroupCtrl.updateTabItemHeader(item);
                        }
                    }, true);
                },
                template: '<div ng-transclude></div>'
            };
        });
}());
