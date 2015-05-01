angular.module('KitchenSink')
    .controller('ChecklistTestController', ['$scope', function ($scope) {
        var locals,
            items;

        function loadItems(searchText) {
            var filteredItems = [],
                i;

            for (i = 0; i < items.length; i++) {
                if (!searchText || items[i].column.toLowerCase().indexOf(searchText.toLowerCase()) >= 0 || items[i].description.toLowerCase().indexOf(searchText.toLowerCase()) >= 0) {
                    filteredItems.push({ column: items[i].column, description: items[i].description });
                }
            }

            locals.items = filteredItems;
        }

        items = [
            { column: 'Constituent summary', description: 'Summary information about the constituent who gave the gift' },
            { column: 'Soft credits', description: 'Soft credits for the gift' },
            { column: 'Amount', description: 'Amount of the gift' }
        ];

        $scope.locals = locals = {
            selectedItems: [],
            includeSearch: true,
            onSearch: function (args) {
                loadItems(args.searchText);
            }
        };

        loadItems();
    }]);