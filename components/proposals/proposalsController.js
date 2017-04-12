'use strict';

/*
 * Returns an array with user objects, one for each of the users of the app
 */
ddxApp.controller('ProposalsController', ['$scope', '$rootScope', '$routeParams', '$resource', '$location', '$mdDialog',
  function ($scope, $rootScope, $routeParams, $resource, $location, $mdDialog) {

  $scope.ProposalsController = {};


  /**********************
   * Proposal Retrieval *
   **********************/

  $scope.ProposalsController.proposals = [];
  // TODO: Switch this to retrieve proposals based on the group ID
  var proposals_resource = $resource('/proposals/retrieve');

  $scope.ProposalsController.proposals = proposals_resource.query({}, function() {
    // TODO: Sort by upvotes/downvotes
    // $scope.ProposalsController.proposals.sort(function(a, b) { 
    //   if (a !== b) {
    //     return b.users_who_liked.length-a.users_who_liked.length;
    //   } else {
    //     return a.date_time-b.date_time;
    //   }
    // });
  }, function errorHandling(err) {
      console.log(err);
  });



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
    }, function errorHandling(err) {
        console.log(err);
    });
    console.log("Submitting upload proposal request");      
  };
}]);

