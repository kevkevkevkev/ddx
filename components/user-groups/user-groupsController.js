'use strict';

/* Copyright © 2017 Kevin O'Connell. All rights reserved. */

/*
 * Manages the display of groups, viewing information about groups, and creating new groups
 */
ddxApp.controller('UserGroupsController', ['$scope', '$rootScope', '$routeParams', '$resource', '$location', '$mdDialog',
  function ($scope, $rootScope, $routeParams, $resource, $location, $mdDialog) {

  $scope.UserGroupsController = {};
  $scope.main.active_tab = "group";


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
    if (!(typeof group_id === undefined || $scope.main.current_group_id === "" || $scope.main.current_group_id === "All Groups")) {
      $scope.UserGroupsController.loadSelectedGroup();   
    }    
    console.log("$scope.UserGroupsController.groups =", $scope.UserGroupsController.groups);
    }, function errorHandling(err) {
        console.log(err);
    });
  };

  $scope.UserGroupsController.loadGroups();

  /***************************
   * Load the Selected Group *
   ***************************/ 

  $scope.UserGroupsController.selectedGroup = {};

  $scope.UserGroupsController.loadSelectedGroup = function() {
    console.log("loadSelectedGroup() called");
    var selectedIndex = 0;
    for (var i = 0; i < $scope.UserGroupsController.groups.length; i++) {
      if ($scope.UserGroupsController.groups[i]._id === $scope.main.current_group_id) {
        selectedIndex = i;
        break;
      }
    }
    $scope.UserGroupsController.selectedGroup = $scope.UserGroupsController.groups[selectedIndex];
  };

  /******************************
   * Group Invitation Retrieval *
   ******************************/  

  $scope.UserGroupsController.group_invitations = [];

  $scope.UserGroupsController.loadInvitations = function() {
    var groups_resource = $resource('/groups/invitations/retrieve');
    $scope.UserGroupsController.group_invitations = groups_resource.query({}, function() {
    // TODO: Consider implementing sorting algorithm to arrange groups
    // $scope.UserGroupsController.groups.sort(function(a, b) {     
    // });
    }, function errorHandling(err) {
        console.log(err);
    });
  };

  $scope.UserGroupsController.loadInvitations();

 /************************************
   * Group Invitation Modal Handling *
   ***********************************/     

  $scope.UserGroupsController.invitation = {};   

  /* When the user clicks on the "Create New Group" button, create a dialog
   * that enables the user to enter a title and description and create a new group */
  $scope.UserGroupsController.showInvitationModal = function(ev, group) {
    $scope.UserGroupsController.invitation = group;
    console.log("showGroupModal() called");
    $mdDialog.show({
      scope: $scope.$new(),
      templateUrl: 'components/user-groups/group-invitation/group-invitation-modalTemplate.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
    });
  };

  $scope.UserGroupsController.acceptInvitation = function() {
    console.log("Accepting invitation for ", $scope.UserGroupsController.invitation._id);
    var invitation_resource = $resource('/groups/invitation/accept/:group_id', {group_id: $scope.UserGroupsController.invitation._id});
    invitation_resource.save({}, function() {
      $scope.main.saveSession();
      $scope.UserGroupsController.loadGroups(); 
      $scope.UserGroupsController.loadInvitations();  
      $mdDialog.cancel();       
    }, function errorHandling(err) {
      console.log(err);
    });
  };


  /**************************
   * Group Member Retrieval *
   **************************/

  $scope.UserGroupsController.members = [];

  $scope.UserGroupsController.getMembers = function()  {
    console.log("getMembers() called");
    var members_resource = $resource('/groups/retrieve/members/:group_id', {group_id: $scope.main.current_group_id});
    $scope.UserGroupsController.members = members_resource.query({}, function() {
      // TODO: Consider implementing sorting algorithm to arrange members
      // $scope.UserGroupsController.groups.sort(function(a, b) {     
      // });
    }, function errorHandling(err) {
        console.log(err);
    });    
  };

  $scope.UserGroupsController.administrators = [];

  $scope.UserGroupsController.getAdministrators = function()  {
    console.log("getMembers() called");
    var administrators_resource = $resource('/groups/retrieve/administrators/:group_id', {group_id: $scope.main.current_group_id});
    $scope.UserGroupsController.administrators = administrators_resource.query({}, function() {
      // TODO: Consider implementing sorting algorithm to arrange members
      // $scope.UserGroupsController.groups.sort(function(a, b) {     
      // });
    }, function errorHandling(err) {
        console.log(err);
    });    
  };  


  /**********************
   * New Group Creation *
   **********************/

  $scope.UserGroupsController.newGroup = {};
  $scope.UserGroupsController.newGroupName = "";
  $scope.UserGroupsController.newGroupDescription = "";
  $scope.UserGroupsController.newGroupMembers = [];

  /* When the user clicks on the "Create New Group" button, create a dialog
   * that enables the user to enter a title and description and create a new group */
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


  /***************************
   * Invite Members to Group *
   ***************************/

  $scope.UserGroupsController.invitedMembers = [];
  $scope.UserGroupsController.newMembersToInvite = "";

  /* When the user clicks on the "Invite Members" button, create a dialog
   * that enables the user to select users to invite to the group */
  $scope.UserGroupsController.showInviteMembersModal = function(ev) {
    console.log("showInviteMembersModal() called");
    $scope.UserGroupsController.loadMembersToInvite();    
    $mdDialog.show({
      scope: $scope.$new(),
      templateUrl: 'components/user-groups/invite-members/invite-members-modalTemplate.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:false,
    });
  };

  $scope.UserGroupsController.inviteMembers = function() {
    console.log("submitNewGroup() called");
    var invited_member_emails = $scope.UserGroupsController.selectedMembers.map(function(a) {return a.email_address;});
    console.log("Requesting to invite $scope.UserGroupsController.invited_member_emails ", invited_member_emails);
    var members_resource = $resource('/groups/invite/members/:group_id', {group_id: $scope.main.current_group_id});
    var member_data = {
      invited_member_emails: invited_member_emails
    };

    members_resource.save(member_data, function () {
        console.log("members_resource.save callback()");
        $mdDialog.cancel();
        $scope.UserGroupsController.loadGroups();        
    }, function errorHandling(err) {
        console.log(err);
    });

    // Invite unregistered members to register for DDX and join the group
    if ($scope.UserGroupsController.newMembersToInvite !== "") {
      $scope.UserGroupsController.inviteNewMembers();
    }
    console.log("Submitting create group request");      
  };

  $scope.UserGroupsController.inviteNewMembers = function() {
    console.log("inviteNewMembers() called");
    var new_members_to_invite_array = $scope.UserGroupsController.newMembersToInvite.split(',');
    var members_resource = $resource('/groups/invite/new-members/:group_id', {group_id: $scope.main.current_group_id});
    var member_data = {
      invited_member_emails: new_members_to_invite_array
    };

    members_resource.save(member_data, function () {
        console.log("members_resource.save callback()");       
    }, function errorHandling(err) {
        console.log(err);
    });

  };

  // Checkbox handling

  $scope.UserGroupsController.membersToInvite = [];
  $scope.UserGroupsController.selectedMembers = [];

  $scope.UserGroupsController.loadMembersToInvite = function()  {
    console.log("loadMembersToInvite() called");
    var members_resource = $resource('/users/retrieve/members');
    // TODO: Add selection criteria to filter users based on active_user's connections
    $scope.UserGroupsController.membersToInvite = members_resource.query({}, function() {
      // TODO: Consider implementing sorting algorithm to arrange members
      // $scope.UserGroupsController.groups.sort(function(a, b) {     
      // });
    }, function errorHandling(err) {
        console.log(err);
    });    
  };

  $scope.UserGroupsController.toggle = function (user, list) {
    var idx = list.indexOf(user);
    if (idx > -1) {
      list.splice(idx, 1);
    }
    else {
      list.push(user);
    }
  };

  $scope.UserGroupsController.exists = function (user, list) {
    return list.indexOf(user) > -1;
  };

  $scope.UserGroupsController.isIndeterminate = function() {
    return ($scope.UserGroupsController.selectedMembers.length !== 0 &&
        $scope.UserGroupsController.selectedMembers.length !== $scope.UserGroupsController.membersToInvite.length);
  };

  $scope.UserGroupsController.isChecked = function() {
    return $scope.UserGroupsController.selectedMembers.length === $scope.UserGroupsController.membersToInvite.length;
  }

  $scope.UserGroupsController.toggleAll = function() {
    if ($scope.UserGroupsController.selectedMembers.length === $scope.UserGroupsController.membersToInvite.length) {
      $scope.UserGroupsController.selectedMembers = [];
    } else if ($scope.UserGroupsController.selectedMembers.length === 0 || $scope.UserGroupsController.selectedMembers.length > 0) {
      $scope.UserGroupsController.selectedMembers = $scope.UserGroupsController.membersToInvite.slice(0);
    }
  };

  /***********************
   * Navigation Handling *
   ***********************/

  $scope.UserGroupsController.openGroup = function(group) {
    $scope.main.current_group_id = group._id;
    $location.path("/group");
  };

  // Sets the group to that selected by the user in the group dropdown menu
  $scope.UserGroupsController.setGroup = function(group) {
    $scope.main.current_group_id = group._id;
    if ($scope.main.active_tab === "proposals") { $rootScope.$broadcast("Reload Proposals"); }
    if ($scope.main.active_tab === "floor") { $rootScope.$broadcast("Reload Floor Proposals"); }
    //if ($scope.main.active_tab === "group") { }
    // If the user is currently on the Group Information tab, change that display to the relevant group
    var url = $location.url();
    if ((url.indexOf('/group') > -1) || (url.indexOf('/user-groups') > -1)) {
      $location.path("/group");
    }   
  };

  // Sets the group to all
  $scope.UserGroupsController.setGroupToAll = function() {
    $scope.main.current_group_id = "";
    if ($scope.main.active_tab === "proposals") { $rootScope.$broadcast("Reload Proposals"); }
    if ($scope.main.active_tab === "floor") { $rootScope.$broadcast("Reload Floor Proposals"); }
    // If the user is currently on the Group Information tab, change that display to the group list
    var url = $location.url();
    if ((url.indexOf('/group') > -1) || (url.indexOf('/user-groups') > -1)) {
      $location.path("/user-groups");
    }   
  };

  /**************************
   * Load Enacted Proposals *
   **************************/

  $scope.UserGroupsController.enactedProposals = [];

  $scope.UserGroupsController.loadEnactedProposals = function() {
    
    console.log("$scope.UserGroupsController.loadEnactedProposals() called");
    var proposals_resource = $resource('/proposals/retrieve/:group_id/:status');
    var group_id = $scope.main.current_group_id;
    // TODO: This is hacky. Fix this.
    if (typeof group_id === undefined || $scope.main.current_group_id === "" || $scope.main.current_group_id === "All Groups") {
      group_id = "all";
    }

    $scope.UserGroupsController.enactedProposals = proposals_resource.query({group_id: group_id, status: 2}, function() {
      $scope.UserGroupsController.enactedProposals.sort(function(a, b) { 
          return a.date_time-b.date_time;
      });
    }, function errorHandling(err) {
        console.log(err);
    });
  };

  if (!(typeof group_id === undefined || $scope.main.current_group_id === "" || $scope.main.current_group_id === "All Groups")) {
    $scope.UserGroupsController.loadEnactedProposals();
  }

  /***************************
   * Load Rejected Proposals *
   ***************************/

  $scope.UserGroupsController.rejectedProposals = [];

  $scope.UserGroupsController.loadRejectedProposals = function() {
    
    console.log("$scope.UserGroupsController.loadRejectedProposals() called");
    var proposals_resource = $resource('/proposals/retrieve/:group_id/:status');
    var group_id = $scope.main.current_group_id;
    // TODO: This is hacky. Fix this.
    if (typeof group_id === undefined || $scope.main.current_group_id === "" || $scope.main.current_group_id === "All Groups") {
      group_id = "all";
    }

    $scope.UserGroupsController.rejectedProposals = proposals_resource.query({group_id: group_id, status: 3}, function() {
      $scope.UserGroupsController.rejectedProposals.sort(function(a, b) { 
          return a.date_time-b.date_time;
      });
    }, function errorHandling(err) {
        console.log(err);
    });
  };

  if (!(typeof group_id === undefined || $scope.main.current_group_id === "" || $scope.main.current_group_id === "All Groups")) {
    $scope.UserGroupsController.loadRejectedProposals();
  }  
}]);

