
//Controller setup
var appControllers = angular.module('appCtrls', []);

appControllers.controller('ListCtrl', function ($scope, $http, $location, LazyList) {
    $scope.name = 'listview';
    $scope.lazyList = new LazyList();
    $scope.itemId = function($index) {
        $location.path('detail/' + $index);
    };
    $scope.navigate = function() {
        $location.path('about');
    };
    getJSObject('main');
});

appControllers.controller('DetailCtrl', function ($scope, $location, $routeParams, DetailItem) {
    var index = $routeParams.index;
    $scope.detailId = new DetailItem(index);
    $scope.navigate = function () {
        $location.path('about');
    };
    getJSObject('detail');
});

appControllers.controller('AboutCtrl', function($scope, AboutView) {
    $scope.about = new AboutView();
    getJSObject('about');
});