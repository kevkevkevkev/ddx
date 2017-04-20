'use strict';

/* Copyright © 2017 Kevin O'Connell. All rights reserved. */

/*
 * Manages the display of proposals, upvoting and downvoting proposals, navigating to proposal
 * discussions, and submitting new proposals.
 */
ddxApp.controller('OptionsMenuController', ['$scope', '$rootScope', '$routeParams', '$resource', '$location', '$mdDialog', '$mdPanel', '$timeout',
  function ($scope, $rootScope, $routeParams, $resource, $location, $mdDialog, $mdPanel, $timeout, mdPanelRef) {

  $scope.OptionsMenuController = {};
  $scope.OptionsMenuController._mdPanel = $mdPanel;

  var options = [
    'My Profile',
    'My Groups',
    'Proposal Drafts',
    'Logout',
  ];

  $scope.OptionsMenuController.selected = {selectedOption: 'My Profile'};
  $scope.OptionsMenuController.disableParentScroll = false;


  $scope.OptionsMenuController.showMenu = function(ev) { 
    console.log("showMenu() clicked");
    var position = $scope.OptionsMenuController._mdPanel.newPanelPosition()
        .relativeTo('.menu-open-button')
        .addPanelPosition($scope.OptionsMenuController._mdPanel.xPosition.ALIGN_START, $scope.OptionsMenuController._mdPanel.yPosition.BELOW);

      console.log("options = ", options);

    var config = {
      attachTo: angular.element(document.body),
      controller: $scope.OptionsMenuController.PanelDialogCtrl,
      //controllerAs: 'ctrl',
      template:
          '<div class="options-menu" ' +
          '     aria-label="Select a menu option." ' +
          '     role="listbox">' +
          '  <div class="options-menu-item" ' +
          '       ng-class="{selected : option == OptionsMenuController.selectedOption}" ' +
          '       aria-selected="{{option == OptionsMenuController.selectedOption}}" ' +
          '       tabindex="-1" ' +
          '       role="option" ' +
          '       ng-repeat="option in options" ' +
          '       ng-click="OptionsMenuController.PanelMenuCtrl.selectOption(option)"' +
          '       ng-keydown="OptionsMenuController.PanelMenuCtrl.onKeydown($event, option)">' +
          '    {{ option }} ' +
          '  </div>' +
          '</div>',
      panelClass: 'options-menu',
      position: position,
      locals: {
        'selected': $scope.OptionsMenuController.selected,
        'options': $scope.OptionsMenuController.options
      },
      openFrom: ev,
      clickOutsideToClose: true,
      escapeToClose: true,
      focusOnOpen: false,
      zIndex: 2
    };

    $scope.OptionsMenuController._mdPanel.open(config);
  };

  $scope.OptionsMenuController._mdPanelRef = mdPanelRef;
  $scope.OptionsMenuController.selectedOption = $scope.OptionsMenuController.selected.selectedOption;
  //console.log("$scope test, ", this.$scope.main.test_string);

  $timeout(function() {
    var selected = document.querySelector('.options-menu-item.selected');
    if (selected) {
      angular.element(selected).focus();
    } else {
      angular.element(document.querySelectorAll('.options-menu-item')[0]).focus();
    }
  });

  $scope.OptionsMenuController.PanelMenuCtrl = function(mdPanelRef, $timeout) {
    this._mdPanelRef = mdPanelRef;
    this.selectedOption = this.selected.selectedOption;
    $timeout(function() {
      var selected = document.querySelector('.options-menu-item.selected');
      if (selected) {
        angular.element(selected).focus();
      } else {
        angular.element(document.querySelectorAll('.options-menu-item')[0]).focus();
      }
    });
  }


  $scope.OptionsMenuController.PanelMenuCtrl.prototype.selectOption = function(option) {
    console.log("selectOption(), option = ", option);
    this.selected.selectedOption = option;
    this._mdPanelRef && this._mdPanelRef.close().then(function() {
      angular.element(document.querySelector('.options-menu-open-button')).focus();
    });

    switch(option) {
      case "My Profile":
        console.log("User clicked My Profile");
        $location.path("/user-profile");
        break;
      case "My Groups":
        console.log("User clicked My Groups");
        $location.path("/user-groups");
        break;
      case "Proposal Drafts":
        console.log("User clicked Proposal Drafts");
        this.$location.path("/proposal-drafts");
        break;
      case "Logout":
        console.log("User clicked Logout");
        $rootScope.$broadcast("Logout");            
    }
  };


  $scope.OptionsMenuController.PanelMenuCtrl.prototype.onKeydown = function($event, option) {
    console.log("User pressed key");
    var handled, els, index, prevIndex, nextIndex;
    switch ($event.which) {
      case 38: // Up Arrow.
        els = document.querySelectorAll('.options-menu-item');
        index = indexOf(els, document.activeElement);
        prevIndex = (index + els.length - 1) % els.length;
        els[prevIndex].focus();
        handled = true;
        break;

      case 40: // Down Arrow.
        els = document.querySelectorAll('.options-menu-item');
        index = indexOf(els, document.activeElement);
        nextIndex = (index + 1) % els.length;
        els[nextIndex].focus();
        handled = true;
        break;

      case 13: // Enter.
      case 32: // Space.
        this.selectOption(option);
        handled = true;
        break;

      case 9: // Tab.
        this._mdPanelRef && this._mdPanelRef.close();
    }

    if (handled) {
      $event.preventDefault();
      $event.stopImmediatePropagation();
    }

    function indexOf(nodeList, element) {
      for (var item, i = 0; item = nodeList[i]; i++) {
        if (item === element) {
          return i;
        }
      }
      return -1;
    }
  };

}]);



