'use strict';

/*
 * Manages the display of proosals, upvoting and downvoting proposals, navigating to proposal
 * discussions, and submitting new proposals.
 */
ddxApp.controller('ProposalsController', ['$scope', '$rootScope', '$routeParams', '$resource', '$location', '$mdDialog',
  function ($scope, $rootScope, $routeParams, $resource, $location, $mdDialog) {

  $scope.ProposalsController = {};


  /**********************
   * Proposal Retrieval *
   **********************/

  $scope.ProposalsController.proposals = [];

  $scope.ProposalsController.loadProposals = function() {
    // TODO: Switch this to retrieve proposals based on the group ID
    var proposals_resource = $resource('/proposals/retrieve');
    $scope.ProposalsController.proposals = proposals_resource.query({}, function() {
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
  $scope.ProposalsController.newProposalTitle = "";
  $scope.ProposalsController.newProposalText = "";
  $scope.ProposalsController.newProposalDescription = "";

  /* When the user clicks on the "Upload Photos" button, create a dialog
   * that enables the user to upload a photo */
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
      $mdDialog.cancel();
  };

  $scope.ProposalsController.submitNewProposal = function() {
    console.log("submitProposal() called");

    var proposal_resource = $resource('/proposals/new');
    var proposal_data = {
      title: $scope.ProposalsController.newProposalTitle,
      text: $scope.ProposalsController.newProposalText,
      description: $scope.ProposalsController.newProposalDescription,
    };

    var newProposal = proposal_resource.save(proposal_data, function () {
        console.log("proposal_resource.save callback()");
        $mdDialog.cancel();
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

