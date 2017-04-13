'use strict';

var ddxApp = angular.module('ddxApp', ['ngRoute', 'ngMaterial', 'ngResource', 
    'ngMessages', 'LocalStorageModule']);

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
                controller: 'ProposalsController'
            }).
            when('/proposals/discussion/:proposalId', {
                templateUrl: 'components/proposals/proposal-discussion/proposal-discussionTemplate.html',
                controller: 'ProposalDiscussionController'
            }).                        
            when('/login-register', {
                templateUrl: 'components/login-register/login-registerTemplate.html',
                controller: 'LoginRegisterController'
            }).    
            otherwise({
                redirectTo: '#'
            });
    }]);

ddxApp.config(function($mdThemingProvider) {

  $mdThemingProvider.theme('modal')
    .primaryPalette('grey')
    .accentPalette('orange');
});

ddxApp.config(['localStorageServiceProvider', function(localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('ddx');
}]);


ddxApp.controller('MainController', ['$scope', '$rootScope', '$location', 
    '$http', '$resource', '$mdDialog', 'localStorageService',
      function ($scope, $rootScope, $location, $http, $resource, $mdDialog, localStorageService) {
        $scope.main = {};
        $scope.main.noOneIsLoggedIn = true;
        $scope.main.registerView = false;
        $scope.main.session = {};
        $scope.main.active_user = [];

        /* This listener will execute the associated function when the user has 
         * successfully logged on––it will update the display values. */
        $scope.$on("Logged In", function () {
            $scope.main.noOneIsLoggedIn = false;
            // Save the current session in local storage
            var session_resource = $resource('/get-current-session');
            var current_session = session_resource.get({}, function () {
                console.log("setting current_session to ", current_session);
                localStorageService.set('session', current_session);
            }, function errorHandling(err) {
                console.log(err);
            });
            $location.path("/proposals");
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
            //localStorageService.clearAll();
            console.log("rootScope called");
          if ($scope.main.noOneIsLoggedIn) {
            // If session saved in local storage, restore session and direct to /proposals
            if (localStorageService.get('session')) {
                console.log("Session saved in localStorageService");
                var session_resource = $resource('/restore-session');
                var saved_session = localStorageService.get('session');
                var restore_session_data = {email_address: saved_session.email_address};
                console.log("restore_session_data", restore_session_data);
                $scope.main.active_user = session_resource.save(restore_session_data, function () {
                    // Broadcast that the user is logged in
                    $rootScope.$broadcast("Logged In");
                    }, function errorHandling(err) {
                     console.log(err);
                });                
            }
            // If no logged-in user or saved session, redirect to /login-register unless already there
            else if (next.templateUrl !== "components/login-register/login-registerTemplate.html") {
                $location.path("/login-register"); // TODO: Change this back
                //$location.path("/proposals");
            }
          }
        }); 
    }]);
