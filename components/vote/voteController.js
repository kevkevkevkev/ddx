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
    $scope.VoteController.proposals = proposals_resource.query({}, function() {
      $scope.VoteController.proposals.sort(function(a, b) { 
          return a.date_time-b.date_time;
      });
    }, function errorHandling(err) {
        console.log(err);
    });
  };

  $scope.VoteController.loadProposals();
}]);

