'use strict';

/* Copyright © 2017 Kevin O'Connell. All rights reserved. */

/*
 * Manages the display of the active user's profile, and functionality for the user
 * to edit their profile.
 */
ddxApp.controller('UserProfileController', ['$scope', '$rootScope', '$routeParams', '$resource', '$location', '$mdDialog',
  function ($scope, $rootScope, $routeParams, $resource, $location, $mdDialog) {

  $scope.UserProfileController = {};
  $scope.main.active_tab = "none"; // De-activate the tabs
  console.log("UserProfileController activated");


  /*********************
   * Profile Retrieval *
   *********************/

}]);

