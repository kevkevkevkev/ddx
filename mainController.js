'use strict';

var ddxApp = angular.module('ddxApp', ['ngRoute', 'ngMaterial', 'ngResource', 
    'ngMessages']);

ddxApp.config(['$locationProvider', function($locationProvider) {
  $locationProvider.hashPrefix('');
}]);

ddxApp.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/users/:userId', {
                templateUrl: 'components/user-detail/user-detailTemplate.html',
                controller: 'UserDetailController'
            }).
            when('/proposals', {
                templateUrl: 'components/proposals/proposalsTemplate.html',
                controller: 'proposalsController'
            }).            
            when('/login-register', {
                templateUrl: 'components/login-register/login-registerTemplate.html',
                controller: 'LoginRegisterController'
            }).    
            otherwise({
                redirectTo: '#'
            });
    }]);


ddxApp.controller('MainController', ['$scope', '$rootScope', '$location', 
    '$http', '$resource', '$mdDialog',
      function ($scope, $rootScope, $location, $http, $resource, $mdDialog) {
        $scope.main = {};
        $scope.main.noOneIsLoggedIn = true;
        $scope.main.registerView = false;
        $scope.main.session = {};
        $scope.main.active_user = [];

        /* This listener will execute the associated function when the user has 
         * successfully logged on––it will update the display values. */
        $scope.$on("Logged In", function () {
            $scope.main.noOneIsLoggedIn = false;
            $location.path("/proposals" + $scope.main.active_user._id);
        });

        /* When the user has logged out, this listener will return the user to
         * the login page. */ 
        $scope.$on("Logged Out", function () {
            $scope.main.noOneIsLoggedIn = true;
            $scope.main.active_user_name = "Welcome to PhotoShare";
            $location.path("/login-register" + $scope.main.active_user._id);
        });

        /* When the user first loads the webpage, if there is no session saved,
         * this listener will direct the user to the login page */
        $rootScope.$on( "$routeChangeStart", function(event, next, current) {
          if ($scope.main.noOneIsLoggedIn) {
             // no logged user, redirect to /login-register unless already there
            if (next.templateUrl !== "components/login-register/login-registerTemplate.html") {
                $location.path("/login-register");
            }
          }
        }); 
    }]);
