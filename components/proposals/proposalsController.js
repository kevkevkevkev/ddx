'use strict';

/*
 * Returns an array with user objects, one for each of the users of the app
 */
ddxApp.controller('ProposalsController', ['$scope','$resource',
    function ($scope, $resource) {

	$scope.ProposalsController = {};

	$scope.$on("Logged In", function () {
        $scope.main.title = 'Users';
        $scope.UserListController.heading = "Users:";

        console.log('window.cs142models.userListModel()', window.cs142models.userListModel());

        var users = $resource('/user/list', {}, {query: {method: 'get', isArray: true}});
        $scope.UserListController.userList = users.query();
    });

    $scope.$on("Logged Out", function () {
        $scope.main.title = '';
        $scope.UserListController.heading = "";
    	$scope.UserListController.userList = [];
    });    
}]);

