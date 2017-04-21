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


  /**********************
   * Proposal Retrieval *
   **********************/

  $scope.VoteController.proposals = [];

  $scope.VoteController.loadProposals = function() {
    // TODO: Switch this to retrieve proposals based on the group ID
    var proposals_resource = $resource('/proposals/retrieve');
    // TODO: Add selection criteria to retrieve only proposals up for vote
    $scope.VoteController.proposals = proposals_resource.query({}, function() {
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

  /* When the user clicks on a proposal, create a dialogue with three tabs: 
   * 1) View the proposal text and vote on it
   * 2) View the proposal discussion
   * 3) View the proposal amendment history */
  $scope.VoteController.showProposalModal = function(ev, proposal) {
    console.log("showProposalModal() called");
    $mdDialog.show({
      scope: $scope.$new(),
      templateUrl: 'components/vote/vote-proposal/vote-proposal-modalTemplate.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
    });
    $scope.VoteController.voteProposal = proposal;
    $scope.VoteController.loadComments();
    console.log("$scope.VoteController.voteProposal._id = ", $scope.VoteController.voteProposal._id);
  };

  $scope.VoteController.cancel = function() {
      console.log("cancel() called");
      $mdDialog.cancel();
  };

  $scope.VoteController.submitNewProposal = function() {
    console.log("submitProposal() called");

    var proposal_resource = $resource('/proposals/new');
    var proposal_data = {
      title: $scope.VoteController.newProposalTitle,
      text: $scope.VoteController.newProposalText,
      description: $scope.VoteController.newProposalDescription,
    };

    var newProposal = proposal_resource.save(proposal_data, function () {
        console.log("proposal_resource.save callback()");
        $mdDialog.cancel();
        $scope.VoteController.loadProposals();        
    }, function errorHandling(err) {
        console.log(err);
    });
    console.log("Submitting upload proposal request");      
  };

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
}]);

