/*global angular */
//A comment
angular.module('KitchenSink').controller('GridTestController', ['$scope', function ($scope) {
    'use strict';
    var action1,
        action2,
        dataSet1 = [
            {
                name: 'Patrick',
                skills: 'Karate, Kung Fu, Italian cooking, Ditch digging'
            },
            {
                name: 'Paul',
                skills: 'Arguing',
                cats: '13'
            },
            {
                name: 'George',
                skills: 'Curiousity',
                cats: '1'
            },
            {
                name: 'Ringo',
                skills: 'Slow typing'
            },
            {
                name: 'Samwise',
                skills: 'Loyalty, Gardening'
            }
        ],
        dataSet2 = [
            {
                name: 'Corey',
                skills: 'Vegetables',
                cats: 'Threve'
            },
            {
                name: 'Daniel',
                skills: 'Arguing, spelunking',
                cats: '1'
            },
            {
                name: 'Rick',
                skills: 'Leadership, Zombie slaying'
            },
            {
                name: 'Jermey',
                skills: 'Knowledge, Speling',
                cats: 'EleventySeven'
            },
            {
                name: 'Frodo',
                skills: 'Walking, Carrying'
            }
        ],
        dataSet3 = [
            {
                name: 'Gollum',
                skills: 'Precious, Filthy hobbitses, *gollum*'
            },
            {
                name: 'Franklin',
                skills: 'Turtles',
                cats: '13'
            },
            {
                name: 'Tater',
                skills: 'Salad',
                cats: '6'
            },
            {
                name: 'Bev',
                skills: 'Growling'
            },
            {
                name: 'Sean',
                skills: 'Method acting, Drama, Villiany',
                cats: '9'
            }
        ],
        dataSetBand = [
            {
                name: 'John',
                instrument: 'Rhythm guitar'
            },
            {
                name: 'Paul',
                instrument: 'Bass',
                bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus in purus odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec consequat ante et felis accumsan volutpat. Nulla leo leo, lacinia nec felis sit amet, tristique feugiat ipsum. Mauris ac velit in mi aliquam auctor vel ac leo. Nullam vehicula congue risus, vitae congue turpis iaculis at. Vestibulum imperdiet tellus erat, sit amet rhoncus neque fringilla vitae.'
            },
            {
                name: 'George',
                instrument: 'Lead guitar'
            },
            {
                name: 'Ringo',
                instrument: 'Drums'
            }
        ];
    
    function applyFilters() {
        $scope.locals.appliedFilters.instruments = [];
        if ($scope.locals.guitarFilter) {
            $scope.locals.appliedFilters.instruments.push({name: 'guitars'});
        }
        if ($scope.locals.drumsFilter) {
            $scope.locals.appliedFilters.instruments.push({name: 'drums'});
        }
    }
    
    function updateActions(selections) {
        var i,
            selection;

        action1.selections = [];
        action2.selections = [];

        for (i = 0; i < selections.length; i++) {
            selection = selections[i];
            if (selection.instrument.indexOf('guitar') > -1) {
                action1.selections.push(selection);
            } else if (selection.instrument.indexOf('Drum') > -1) {
                action2.selections.push(selection);
            }
        }
    }
    
    function action1Clicked() {
        var i,
            message = 'The selected guitar players are ';
        if (action1.selections && action1.selections.length > 0) {
            for (i = 0; i < action1.selections.length; i = i + 1) {
                message += action1.selections[i].name;
                if (i !== (action1.selections.length - 1)) {
                    message += ', ';
                }
            }
            alert(message);
        }
    }
    
    function action2Clicked() {
        var message = 'Drum Drum Drum!';
        
        alert(message);
    }
    
    action1 = {
        actionCallback: action1Clicked,
        automationId: 'Action1Button',
        isPrimary: true,
        selections: [],
        title: 'Guitar Action'
    };
    
    action2 = {
        actionCallback: action2Clicked,
        automationId: 'Action2Button',
        isPrimary: false,
        selections: [],
        title: 'Drum Action'
    };
    
    $scope.locals = {
        appliedFilters: {
            instruments: []
        },
        filterOptions: {
            applyFilters: function (args) {
                applyFilters();
                args.filters = angular.copy($scope.locals.appliedFilters);
            },
            clearFilters: function (args) {
                $scope.locals.guitarFilter = false;
                $scope.locals.drumsFilter = false;
                applyFilters();
                args.filters = angular.copy($scope.locals.appliedFilters);
            }
        },
        gridActions: [
            action1,
            action2
        ],
        gridOptions: {
            columns: [
                {
                    caption: 'Name',
                    jsonmap: 'name',
                    id: 1,
                    name: 'name',
                    right_align: true,
                    category: 'My category',
                    description: 'Column description',
                    width_all: 300,
                    width_xs: 100
                },
                {
                    caption: 'Instrument',
                    jsonmap: 'instrument',
                    id: 2,
                    name: 'instrument',
                    width_all: 300,
                    width_xs: 100
                },
                {
                    caption: 'Biography',
                    jsonmap: 'bio',
                    id: 3,
                    name: 'bio',
                    allow_see_more: true,
                    center_align: true,
                    width_all: 400,
                    width_xs: 100
                }
            ],
            data: dataSetBand,
            getContextMenuItems: function (rowid, rowObject) {
                if (rowid === '1' || rowObject.name === 'Ringo') {
                    return [
                        {
                            id: 'menu', 
                            title: 'Option1', 
                            cmd: function () {
                                alert('Context menu option chosen!');
                                return false;
                            }
                        }
                    ];
                }
            },
            multiselect: true,
            
            sortOptions: {
                excludedColumns: ['bio']
            },
            selectedColumnIds: [1, 2, 3],
            columnPickerHelpKey: 'bb-security-users.html'
        },
        gridOptions2: {
            columns: [
                {
                    caption: 'Name',
                    jsonmap: 'name',
                    id: 1,
                    name: 'name',
                    width_xs: 100,
                    width_all: 300
                },
                {
                    caption: 'Skills',
                    jsonmap: 'skills',
                    id: 2,
                    name: 'skills',
                    allow_see_more: true,
                    width_all: 100
                },
                {
                    caption: 'Number of cats',
                    jsonmap: 'cats',
                    id: 3,
                    name: 'cats'
                }
            ],
            data: dataSet1,
            hideFilters: true,
            onAddClick: function () {
                alert('Add button clicked!!');
            },
            selectedColumnIds: [1, 2, 3],
            columnPickerHelpKey: 'bb-security-users.html',
            sortOptions: {
                descending: true
            }
        },
        paginationOptions: {
            recordCount: 30
        },
        guitarFilter: false,
        drumsFilter: false,
        updateActions: updateActions
    };

    function getDataSet(top, skip) {
        if (skip === 0 || skip === 15) {
            return dataSet1;
        } else if (skip === 5 || skip === 20) {
            return dataSet2;
        } else {
            return dataSet3;
        }
    }

    $scope.$watch('locals.gridOptions.sortOptions', function () {
        $scope.locals.gridOptions.data.sort(function (a, b) {
            var descending = $scope.locals.gridOptions.sortOptions.descending ? 1 : -1,
                sortProperty = $scope.locals.gridOptions.sortOptions.column;
            if (a[sortProperty] > b[sortProperty]) {
                return (descending);
            } else if (a[sortProperty] < b[sortProperty]) {
                return (-1 * descending);
            } else {
                return 0;
            }
        });
    }, true);
    
    $scope.$watch('locals.gridOptions.searchText', function () {
        if (angular.isDefined($scope.locals.gridOptions.searchText) && $scope.locals.gridOptions.searchText !== '') {
            $scope.locals.gridOptions.data = [dataSetBand[0]];
        } else {
            $scope.locals.gridOptions.data = dataSetBand;
        }
    });
    
    $scope.$watch('locals.gridOptions.filters', function () {
        var i,
            item,
            newData = [];
        if (angular.isDefined($scope.locals.gridOptions.filters) && $scope.locals.gridOptions.filters.instruments && $scope.locals.gridOptions.filters.instruments.length > 0) {
            for (i = 0; i < $scope.locals.gridOptions.filters.instruments.length; i++) {
                item = $scope.locals.gridOptions.filters.instruments[i];
                if (item.name === 'guitars') {
                    newData.push.apply(newData, [dataSetBand[0], dataSetBand[1], dataSetBand[2]]);
                }
                if (item.name === 'drums') {
                    newData.push(dataSetBand[3]);
                }
            }
            $scope.locals.gridOptions.data = newData;
        } else {
            $scope.locals.gridOptions.data = dataSetBand;
        }
    });
    
    $scope.$on('loadMoreRows', function (event, data) {
        $scope.locals.gridOptions2.data = getDataSet(data.top, data.skip);
    });
    
    $scope.$on('includedColumnsChanged', function (event, data) {
        // Optionally set the data's willResetData property to true if the controller will handle reloading the results
        // after the user has changed the selected grid columns.
    });
}]);