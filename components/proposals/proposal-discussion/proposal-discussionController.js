'use strict';

/* Copyright © 2017 Kevin O'Connell. All rights reserved. */

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
ddxApp.controller('ProposalDiscussionController', ['$scope', '$rootScope', '$routeParams', '$resource', '$location', '$mdDialog', '$mdToast',
  function ($scope, $rootScope, $routeParams, $resource, $location, $mdDialog, $mdToast) {

  $scope.main.active_tab = "proposals";
  var proposalId = $routeParams.proposalId;
  $scope.ProposalDiscussionController = {};
  $scope.ProposalDiscussionController.amendment = {};

  /***********************************
   * Proposal and Comments Retrieval *
   ***********************************/

  $scope.ProposalDiscussionController.proposal = {};

  $scope.ProposalDiscussionController.loadProposal = function() {
    // TODO: Switch this to retrieve proposals based on the group ID
    var proposal_resource = $resource('/proposals/discussion/get/:proposal_id');
    $scope.ProposalDiscussionController.proposal = proposal_resource.get({proposal_id: proposalId}, function() {
    $scope.ProposalDiscussionController.amendment.text = $scope.ProposalDiscussionController.proposal.text;
    }, function errorHandling(err) {
        console.log(err);
    });
  };

  $scope.ProposalDiscussionController.loadProposal();

  // NOTE: Commented this out to use combined handling of comments and amendments instead.
  // Keep this code in case we decide to present comments and amendments separately.
  // $scope.ProposalDiscussionController.comments = {};

  // $scope.ProposalDiscussionController.loadComments = function () {
  //   var comments_resource = $resource('/proposals/discussion/get_comments/:proposal_id');
  //   $scope.ProposalDiscussionController.comments = comments_resource.query({proposal_id: proposalId}, function() {
  //     console.log("Retreived comments: ", $scope.ProposalDiscussionController.comments);
  //     // Sort comments by upvotes
  //     $scope.ProposalDiscussionController.comments.sort(function(a, b) { 
  //       if (a !== b) {
  //         return (b.users_who_upvoted.length-b.users_who_downvoted.length)-(a.users_who_upvoted.length-a.users_who_downvoted.length);
  //       } else {
  //         return a.date_time-b.date_time;
  //       }
  //     });      
  //   }, function errorHandling(err) {
  //     console.log(err);
  //   });
  // };

  // $scope.ProposalDiscussionController.loadComments();

  // Retrieve a combined array containing both comments and amendment
  $scope.ProposalDiscussionController.combined = {};

  $scope.ProposalDiscussionController.loadCombined = function () {
    var combined_resource = $resource('/proposals/discussion/get_comments_and_amendments/:proposal_id');
    $scope.ProposalDiscussionController.combined = combined_resource.query({proposal_id: proposalId}, function() {
      console.log("Retreived comments and amendments: ", $scope.ProposalDiscussionController.combined);
      // Sort comments and amendments by upvotes
      $scope.ProposalDiscussionController.combined.sort(function(a, b) { 
        if (a !== b) {
          return (b.users_who_upvoted.length-b.users_who_downvoted.length)-(a.users_who_upvoted.length-a.users_who_downvoted.length);
        } else {
          return b.date_time-a.date_time;
        }
      });      
    }, function errorHandling(err) {
      console.log(err);
    });
  };

  $scope.ProposalDiscussionController.loadCombined();    


  /*****************************************
   * Proposal Upvote and Downvote Handling *
   *****************************************/  

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

  /***********************************************************
   * Drafting and Submitting Comments on a Proposal Handling *
   ***********************************************************/

  $scope.ProposalDiscussionController.newCommentText = "";

  $scope.ProposalDiscussionController.submitComment = function() {
    console.log("submitComment() called");

    var comment_resource = $resource('/comments/new');
    var comment_data = {
      text: $scope.ProposalDiscussionController.newCommentText,
      proposal_id: proposalId
    };

    var newComment = comment_resource.save(comment_data, function () {
        console.log("comment_resource.save callback()");
        $scope.ProposalDiscussionController.loadCombined();
        $scope.ProposalDiscussionController.newCommentText = "";
    }, function errorHandling(err) {
        console.log(err);
    });
    console.log("Submitted upload comment request");      
  };


  /****************************************
   * Comment Upvote and Downvote Handling *
   ****************************************/  

  // Executes an upvote request
  $scope.ProposalDiscussionController.upvoteComment = function(comment, commentIndex) {
    console.log("upvote() called on comment ", comment);
    var upvote_resource = $resource('/comments/upvote/:comment_id', {comment_id: comment._id});
    comment = upvote_resource.save({}, function () {
        $scope.ProposalDiscussionController.combined[commentIndex].users_who_upvoted = comment.users_who_upvoted;
        $scope.ProposalDiscussionController.combined[commentIndex].users_who_downvoted = comment.users_who_downvoted;        
    }, function errorHandling(err) {
          console.log(err);
    });
  };

  // Executes a downvote request
  $scope.ProposalDiscussionController.downvoteComment = function(comment, commentIndex) {
    console.log("downvote() called on comment ", comment);
    var downvote_resource = $resource('/comments/downvote/:comment_id', {comment_id: comment._id});
    comment = downvote_resource.save({}, function () {
        $scope.ProposalDiscussionController.combined[commentIndex].users_who_upvoted = comment.users_who_upvoted;      
        $scope.ProposalDiscussionController.combined[commentIndex].users_who_downvoted = comment.users_who_downvoted;
    }, function errorHandling(err) {
          console.log(err);
    });
  };  

  /************************************************************
   * Drafting and Proposing Amendments on a Proposal Handling *
   ************************************************************/

  $scope.ProposalDiscussionController.submitAmendment = function() {
    console.log("submitAmendment() called");

    var amendment_resource = $resource('/amendments/new');
    var amendment_data = {
      text: $scope.ProposalDiscussionController.amendment.text,
      description: $scope.ProposalDiscussionController.amendment.description,
      proposal_id: proposalId,
      original_proposal_text: $scope.ProposalDiscussionController.proposal.text,
    };

    var newAmendment = amendment_resource.save(amendment_data, function () {
        console.log("amendment_resource.save callback()");
        $scope.ProposalDiscussionController.loadCombined();
        $scope.ProposalDiscussionController.amendment.description = "";
        $scope.ProposalDiscussionController.amendment.text = $scope.ProposalDiscussionController.proposal.text;
    }, function errorHandling(err) {
        console.log(err);
    });
    console.log("Submitted upload comment request");      
  };

  /******************************************
   * Amendment Upvote and Downvote Handling *
   ******************************************/  

  // Executes an upvote request
  $scope.ProposalDiscussionController.upvoteAmendment = function(amendment, amendmentIndex, ev) {
    console.log("upvote() called on amendment ", amendment);
    var upvote_resource = $resource('/amendments/upvote/:amendment_id', {amendment_id: amendment._id});
    amendment = upvote_resource.save({}, function () {
        $scope.ProposalDiscussionController.combined[amendmentIndex].users_who_upvoted = amendment.users_who_upvoted;
        $scope.ProposalDiscussionController.combined[amendmentIndex].users_who_downvoted = amendment.users_who_downvoted; 
        // TODO: Implement functionality to replace original proposal with amendment if threshold reached
        if (amendment.is_enacted === true) {
          console.log("amendment is_enacted, reloading proposal");
            $scope.ProposalDiscussionController.loadProposal();
            $scope.ProposalDiscussionController.showSimpleToast(ev);
        }               
    }, function errorHandling(err) {
          console.log(err);
    });
  };

  // Executes a downvote request
  $scope.ProposalDiscussionController.downvoteAmendment = function(amendment, amendmentIndex) {
    console.log("downvote() called on amendment ", amendment);
    var downvote_resource = $resource('/amendments/downvote/:amendment_id', {amendment_id: amendment._id});
    amendment = downvote_resource.save({}, function () {
        $scope.ProposalDiscussionController.combined[amendmentIndex].users_who_upvoted = amendment.users_who_upvoted;      
        $scope.ProposalDiscussionController.combined[amendmentIndex].users_who_downvoted = amendment.users_who_downvoted;
    }, function errorHandling(err) {
          console.log(err);
    });
  };

  /******************
   * Toast Handling *
   ******************/

  var last = {
    bottom: false,
    top: false,
    left: false,
    right: true
  };

  $scope.ProposalDiscussionController.toastPosition = angular.extend({},last);

  $scope.ProposalDiscussionController.getToastPosition = function() {
    sanitizePosition();

    return Object.keys($scope.ProposalDiscussionController.toastPosition)
      .filter(function(pos) { return $scope.ProposalDiscussionController.toastPosition[pos]; })
      .join(' ');
  };

  function sanitizePosition() {
    var current = $scope.ProposalDiscussionController.toastPosition;

    if ( current.bottom && last.top ) current.top = false;
    if ( current.top && last.bottom ) current.bottom = false;
    if ( current.right && last.left ) current.left = false;
    if ( current.left && last.right ) current.right = false;

    last = angular.extend({},current);
  }

  $scope.ProposalDiscussionController.showSimpleToast = function(ev) {
    var pinTo = $scope.ProposalDiscussionController.getToastPosition();

    $mdToast.show(
      $mdToast.simple()
        .textContent('Amendment Enacted!')
        .position(pinTo )
        .hideDelay(10000)
    );
  };   

}]);

