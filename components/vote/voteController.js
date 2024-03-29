'use strict';

/* Copyright © 2017 Kevin O'Connell. All rights reserved. */

/*
 * Manages the display of proposals up for vote. Controls a modal view to read a proposal,
 * review the discussion on that proposal, view the amendment history, and to vote yes
 * or no on the proposal.
 */
ddxApp.controller('VoteController', ['$scope', '$rootScope', '$routeParams', '$resource', '$location', '$mdDialog',
  function ($scope, $rootScope, $routeParams, $resource, $location, $mdDialog) {

  $scope.VoteController = {};
  $scope.main.active_tab = "floor";

  // When the user changes group, reload the proposals
  $scope.$on("Reload Floor Proposals", function () {
    console.log("Reload Floor Proposals broadcast received, $scope.main.current_group_id = ", $scope.main.current_group_id);
    $scope.VoteController.loadProposals();
  });


  /**********************
   * Proposal Retrieval *
   **********************/

  $scope.VoteController.proposals = [];

  $scope.VoteController.loadProposals = function() {
    
    console.log("$scope.VoteController.loadProposals() called");
    var proposals_resource = $resource('/proposals/retrieve/:group_id/:status');
    var group_id = $scope.main.current_group_id;
    // TODO: This is hacky. Fix this.
    if (typeof group_id === undefined || $scope.main.current_group_id === "" || $scope.main.current_group_id === "All Groups") {
      group_id = "all";
    }

    // TODO: Add selection criteria to retrieve only proposals up for vote
    $scope.VoteController.proposals = proposals_resource.query({group_id: group_id, status: 1}, function() {
      $scope.VoteController.proposals.sort(function(a, b) { 
          return a.date_time-b.date_time;
      });
    }, function errorHandling(err) {
        console.log(err);
    });
  };

  $scope.VoteController.loadProposals();


  /********************************
   * View Proposal and Vote Modal *
   ********************************/

  $scope.VoteController.voteProposal = {};
  $scope.VoteController.voteProposalIndex = -1;

  /* When the user clicks on a proposal, create a dialogue with three tabs: 
   * 1) View the proposal text and vote on it
   * 2) View the proposal discussion
   * 3) View the proposal amendment history */
  $scope.VoteController.showProposalModal = function(ev, proposal, proposal_index) {
    console.log("showProposalModal() called");
    $mdDialog.show({
      scope: $scope.$new(),
      templateUrl: 'components/vote/vote-proposal/vote-proposal-modalTemplate.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
    });
    $scope.VoteController.voteProposal = proposal;
    $scope.VoteController.voteProposalIndex = proposal_index;
    $scope.VoteController.loadComments();
    $scope.VoteController.loadAmendments();
    console.log("$scope.VoteController.voteProposal._id = ", $scope.VoteController.voteProposal._id);
  };

  $scope.VoteController.cancel = function() {
      console.log("cancel() called");
      $mdDialog.cancel();
  };

  // Load comments for the discussion history of the proposal being considered

  $scope.VoteController.comments = {};

  $scope.VoteController.loadComments = function () {
    var comments_resource = $resource('/proposals/discussion/get_comments/:proposal_id');
    $scope.VoteController.comments = comments_resource.query({proposal_id: $scope.VoteController.voteProposal._id}, function() {
      console.log("Retreived comments: ", $scope.VoteController.comments);
      // Sort comments by upvotes
      $scope.VoteController.comments.sort(function(a, b) { 
        if (a !== b) {
          return (b.users_who_upvoted.length-b.users_who_downvoted.length)-(a.users_who_upvoted.length-a.users_who_downvoted.length);
        } else {
          return a.date_time-b.date_time;
        }
      });      
    }, function errorHandling(err) {
      console.log(err);
    });
  };

  // Load amendments for the amendment history of the proposal being considered

  $scope.VoteController.amendments = {};

  $scope.VoteController.loadAmendments = function () {
    var amendments_resource = $resource('/proposals/discussion/get_amendments/:proposal_id');
    $scope.VoteController.amendments = amendments_resource.query({proposal_id: $scope.VoteController.voteProposal._id}, function() {
      console.log("Retreived amendments: ", $scope.VoteController.amendments);
      // Sort amendments by upvotes
      $scope.VoteController.amendments.sort(function(a, b) { 
        if (a !== b) {
          return (b.users_who_upvoted.length-b.users_who_downvoted.length)-(a.users_who_upvoted.length-a.users_who_downvoted.length);
        } else {
          return a.date_time-b.date_time;
        }
      });      
    }, function errorHandling(err) {
      console.log(err);
    });
  };

  // Vote Handling

  $scope.VoteController.voteYes = function(proposal) {
    console.log("voteYes() called");
    var vote_yes_resource = $resource('/proposals/vote/yes/:proposal_id', {proposal_id: $scope.VoteController.voteProposal._id});
    proposal = vote_yes_resource.save({}, function() {
      console.log("Voting yes on proposal: ", $scope.VoteController.voteProposal._id);
      // Update local UI here
      $scope.VoteController.loadProposals();
      $scope.VoteController.cancel();            
    }, function errorHandling(err) {
      console.log(err);
    });
  };

  $scope.VoteController.voteNo = function(proposal) {
    console.log("voteNo() called");
    var vote_no_resource = $resource('/proposals/vote/no/:proposal_id', {proposal_id: $scope.VoteController.voteProposal._id});
    proposal = vote_no_resource.save({}, function() {
      console.log("Voting no on proposal: ", $scope.VoteController.voteProposal._id);
      // Update local UI here
      $scope.VoteController.loadProposals();
      $scope.VoteController.cancel();
    }, function errorHandling(err) {
      console.log(err);
    });
  };      
}]);

