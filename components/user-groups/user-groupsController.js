'use strict';

/* Copyright © 2017 Kevin O'Connell. All rights reserved. */

/*
 * Manages the display of groups, viewing information about groups, and creating new groups
 */
ddxApp.controller('UserGroupsController', ['$scope', '$rootScope', '$routeParams', '$resource', '$location', '$mdDialog',
  function ($scope, $rootScope, $routeParams, $resource, $location, $mdDialog) {

  $scope.UserGroupsController = {};


  /********************
   * Groups Retrieval *
   ********************/

  $scope.UserGroupsController.groups = [];

  $scope.UserGroupsController.loadGroups = function() {
    var groups_resource = $resource('/groups/retrieve');
    $scope.UserGroupsController.groups = groups_resource.query({}, function() {
		// TODO: Consider implementing sorting algorithm to arrange groups
		// $scope.UserGroupsController.groups.sort(function(a, b) {   	
		// });
    }, function errorHandling(err) {
        console.log(err);
    });
  };

  $scope.UserGroupsController.loadGroups();   


  /**********************
   * New Group Creation *
   **********************/

  $scope.UserGroupsController.newGroup = {};
  $scope.UserGroupsController.newGroupName = "";
  $scope.UserGroupsController.newGroupDescription = "";
  $scope.UserGroupsController.newGroupMembers = [];

  /* When the user clicks on the "Submit New Proposal" button, create a dialog
   * that enables the user to draft and submit a new proposal */
  $scope.UserGroupsController.showGroupModal = function(ev) {
    console.log("showGroupModal() called");
    $mdDialog.show({
      scope: $scope.$new(),
      templateUrl: 'components/user-groups/create-group/create-group-modalTemplate.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:false,
    });
  };

  $scope.UserGroupsController.cancel = function() {
      console.log("cancel() called");
      $mdDialog.cancel();
  };

  $scope.UserGroupsController.createNewGroup = function() {
    console.log("submitNewGroup() called");

    var group_resource = $resource('/groups/new');
    var group_data = {
      name: $scope.UserGroupsController.newGroupName,
      description: $scope.UserGroupsController.newGroupDescription,
      members: $scope.UserGroupsController.newGroupMembers
    };

    var newGroup = group_resource.save(group_data, function () {
        console.log("group_resource.save callback()");

        $mdDialog.cancel();
        $scope.UserGroupsController.loadGroups();        
    }, function errorHandling(err) {
        console.log(err);
    });
    console.log("Submitting create group request");      
  };


}]);

