'use strict';

/* Copyright © 2017 Kevin O'Connell. All rights reserved. */

/*
 * Manages the display of proposals, upvoting and downvoting proposals, navigating to proposal
 * discussions, and submitting new proposals.
 */
ddxApp.controller('ProposalsController', ['$scope', '$rootScope', '$routeParams', '$resource', '$location', '$mdDialog',
  function ($scope, $rootScope, $routeParams, $resource, $location, $mdDialog) {

  $scope.ProposalsController = {};
  $scope.main.active_tab = "proposals";

  // When the user changes group, reload the proposals
  $scope.$on("Reload Proposals", function () {
    console.log("Reload Proposals broadcast received, $scope.main.current_group_id = ", $scope.main.current_group_id);
    $scope.ProposalsController.loadProposals();
  });


  /**********************
   * Proposal Retrieval *
   **********************/

  $scope.ProposalsController.proposals = [];

  $scope.ProposalsController.loadProposals = function() {
    console.log("loadProposals() called");
    var proposals_resource = $resource('/proposals/retrieve/:group_id/:status');
    var group_id = $scope.main.current_group_id;
    // TODO: This is hacky. Fix this.
    if (typeof group_id === undefined || $scope.main.current_group_id === "" || $scope.main.current_group_id === "All Groups") {
      group_id = "all";
    }
    $scope.ProposalsController.proposals = proposals_resource.query({group_id: group_id, status: 0}, function() {
      $scope.ProposalsController.proposals.sort(function(a, b) { 
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

  $scope.ProposalsController.loadProposals();

  $scope.ProposalsController.getVotingMembers = function(proposal) {
   console.log("getVotingMembers() called");
    var proposals_resource = $resource('/groups/retrieve/members-count/:group_id');
    var group_id = proposal.group;

    var votingMembers = proposals_resource.query({group_id: group_id}, function() {

    }, function errorHandling(err) {
        console.log(err);
    });

    return votingMembers.length;
  };

  /********************************
   * Upvote and Downvote Handling *
   ********************************/  

  // Executes an upvote request
  $scope.ProposalsController.upvote = function(proposal, proposalIndex) {
    console.log("upvote() called on proposal ", proposal);
    var upvote_resource = $resource('/proposals/upvote/:proposal_id', {proposal_id: proposal._id});
    proposal = upvote_resource.save({}, function () {
        $scope.ProposalsController.proposals[proposalIndex].users_who_upvoted = proposal.users_who_upvoted;
        $scope.ProposalsController.proposals[proposalIndex].users_who_downvoted = proposal.users_who_downvoted;        
    }, function errorHandling(err) {
          console.log(err);
    });
  };

  // Executes a downvote request
  $scope.ProposalsController.downvote = function(proposal, proposalIndex) {
    console.log("downvote() called on proposal ", proposal);
    var downvote_resource = $resource('/proposals/downvote/:proposal_id', {proposal_id: proposal._id});
    proposal = downvote_resource.save({}, function () {
        $scope.ProposalsController.proposals[proposalIndex].users_who_upvoted = proposal.users_who_upvoted;      
        $scope.ProposalsController.proposals[proposalIndex].users_who_downvoted = proposal.users_who_downvoted;
    }, function errorHandling(err) {
          console.log(err);
    });
  };

  /***************************
   * New Proposal Submission *
   ***************************/

  $scope.ProposalsController.newProposal = [];
  $scope.ProposalsController.newProposalGroupID = "";
  $scope.ProposalsController.newProposalTitle = "";
  $scope.ProposalsController.newProposalText = "";
  $scope.ProposalsController.newProposalDescription = "";

  /* When the user clicks on the "Submit New Proposal" button, create a dialog
   * that enables the user to draft and submit a new proposal */
  $scope.ProposalsController.showProposalModal = function(ev) {
    console.log("showProposalModal() called");
    $mdDialog.show({
      scope: $scope.$new(),
      templateUrl: 'components/proposals/write-proposal/write-proposal-modalTemplate.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:false,
    });
  };

  $scope.ProposalsController.cancel = function() {
      console.log("cancel() called");
      $scope.main.active_tab = "proposals";
      $mdDialog.cancel();
  };

  $scope.ProposalsController.submitNewProposal = function() {
    console.log("submitProposal() called");

    var proposal_resource = $resource('/proposals/new');
    var proposal_data = {
      group: $scope.ProposalsController.newProposalGroupID,
      title: $scope.ProposalsController.newProposalTitle,
      text: $scope.ProposalsController.newProposalText,
      description: $scope.ProposalsController.newProposalDescription,
    };

    var newProposal = proposal_resource.save(proposal_data, function () {
        console.log("proposal_resource.save callback()");
        $mdDialog.cancel();
        $scope.main.active_tab = "proposals";
        $scope.ProposalsController.newProposalTitle = "";
        $scope.ProposalsController.newProposalText = "";
        $scope.ProposalsController.newProposalDescription = "";
        $scope.ProposalsController.loadProposals();        
    }, function errorHandling(err) {
        console.log(err);
    });
    console.log("Submitting upload proposal request");      
  };

  $scope.ProposalsController.saveProposalDraft = function() {
    console.log("saveProposalDraft() called");

    var draft_resource = $resource('/drafts/new');
    var draft_data = {
      group: $scope.ProposalsController.newProposalGroupID,
      title: $scope.ProposalsController.newProposalTitle,
      text: $scope.ProposalsController.newProposalText,
      description: $scope.ProposalsController.newProposalDescription,
    };

    var newDraft = draft_resource.save(draft_data, function () {
        console.log("draft_resource.save callback()");
        $mdDialog.cancel();
        $scope.main.active_tab = "proposals";
        $scope.ProposalsController.newProposalTitle = "";
        $scope.ProposalsController.newProposalText = "";
        $scope.ProposalsController.newProposalDescription = "";
        $scope.ProposalsController.loadProposals();        
    }, function errorHandling(err) {
        console.log(err);
    });
    console.log("Submitting upload proposal request");   
  };


  /*****************
   * Open Proposal *
   *****************/

   $scope.ProposalsController.openProposal = function(proposal) {

      $location.path("/proposals/discussion/" + proposal._id);
   };

}]);

