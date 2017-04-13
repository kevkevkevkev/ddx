'use strict';

/*
 * Manages the discussion of a proposal, which includes:
 * 1) Display of the initial proposal
 * 2) Upvoting and downvoting of proposal
 * 3) Drafting and submitting comments on a proposal
 * 4) Drafting and submitting amendments to a proposal
 * 5) Display of the proposal comments and amendments
 * 6) Upvoting and downvoting proposal comments and amendments
 * 7) Submitting comments to comments of proposals
 * 8) Upvoting and downvoting comments to comments (which does not affect their display)
 */
ddxApp.controller('ProposalDiscussionController', ['$scope', '$rootScope', '$routeParams', '$resource', '$location', '$mdDialog',
  function ($scope, $rootScope, $routeParams, $resource, $location, $mdDialog) {

  var proposalId = $routeParams.proposalId;
  $scope.ProposalDiscussionController = {};

  /**********************
   * Proposal Retrieval *
   **********************/

  $scope.ProposalDiscussionController.proposal = {};

  $scope.ProposalDiscussionController.loadProposal = function() {
    // TODO: Switch this to retrieve proposals based on the group ID
    var proposal_resource = $resource('/proposals/discussion/get/:proposal_id');
    $scope.ProposalDiscussionController.proposal = proposal_resource.get({proposal_id: proposalId}, function() {
      // TODO: Perhaps use this to sort comments
      // $scope.ProposalDiscussionController.proposal.sort(function(a, b) { 
      //   if (a !== b) {
      //     return (b.users_who_upvoted.length-b.users_who_downvoted.length)-(a.users_who_upvoted.length-a.users_who_downvoted.length);
      //   } else {
      //     return a.date_time-b.date_time;
      //   }
      // });
    }, function errorHandling(err) {
        console.log(err);
    });
  };

  $scope.ProposalDiscussionController.loadProposal();

  /********************************
   * Upvote and Downvote Handling *
   ********************************/  

  // Executes an upvote request
  $scope.ProposalDiscussionController.upvote = function() {
    console.log("upvote() called on proposal ", $scope.ProposalDiscussionController.proposal);
    var upvote_resource = $resource('/proposals/upvote/:proposal_id', {proposal_id: proposalId});
    $scope.ProposalDiscussionController.proposal = upvote_resource.save({}, function () {        
    }, function errorHandling(err) {
          console.log(err);
    });
  };

  // Executes a downvote request
  $scope.ProposalDiscussionController.downvote = function() {
    console.log("downvote() called on proposal ", $scope.ProposalDiscussionController.proposal);
    var downvote_resource = $resource('/proposals/downvote/:proposal_id', {proposal_id: proposalId});
    $scope.ProposalDiscussionController.proposal = downvote_resource.save({}, function () {
    }, function errorHandling(err) {
          console.log(err);
    });
  };

  // /***************************
  //  * New Proposal Submission *
  //  ***************************/

  // $scope.ProposalsController.newProposal = [];
  // $scope.ProposalsController.newProposalTitle = "";
  // $scope.ProposalsController.newProposalText = "";
  // $scope.ProposalsController.newProposalDescription = "";

  // /* When the user clicks on the "Upload Photos" button, create a dialog
  //  * that enables the user to upload a photo */
  // $scope.ProposalsController.showProposalModal = function(ev) {
  //   console.log("showProposalModal() called");
  //   $mdDialog.show({
  //     scope: $scope.$new(),
  //     templateUrl: 'components/proposals/write-proposal/write-proposal-modalTemplate.html',
  //     parent: angular.element(document.body),
  //     targetEvent: ev,
  //     clickOutsideToClose:false,
  //   });
  // };

  // $scope.ProposalsController.cancel = function() {
  //     console.log("cancel() called");
  //     $mdDialog.cancel();
  // };

  // $scope.ProposalsController.submitNewProposal = function() {
  //   console.log("submitProposal() called");

  //   var proposal_resource = $resource('/proposals/new');
  //   var proposal_data = {
  //     title: $scope.ProposalsController.newProposalTitle,
  //     text: $scope.ProposalsController.newProposalText,
  //     description: $scope.ProposalsController.newProposalDescription,
  //   };

  //   var newProposal = proposal_resource.save(proposal_data, function () {
  //       console.log("proposal_resource.save callback()");
  //       $mdDialog.cancel();
  //       $scope.ProposalsController.loadProposals();        
  //   }, function errorHandling(err) {
  //       console.log(err);
  //   });
  //   console.log("Submitting upload proposal request");      
  // };


  // /*****************
  //  * Open Proposal *
  //  *****************/

  //  $scope.ProposalsController.openProposal = function(proposal) {

  //     $location.path("/proposals/discussion/" + proposal._id);
  //  };

}]);

