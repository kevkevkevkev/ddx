(function() {
'use strict';

ddxApp.controller('OptionsMenuCtrl', OptionsMenuCtrl)


function OptionsMenuCtrl($mdPanel, $scope, $rootScope) {
  this._mdPanel = $mdPanel;
  this.$scope = $scope;

  this.options = [
    'My Profile',
    'Proposal Drafts',
    'My Groups',
    'Logout',
  ];

  this.selected = {selectedOption: 'My Profile'};
  this.disableParentScroll = false;
}

OptionsMenuCtrl.prototype.showMenu = function(ev) { 
  var position = this._mdPanel.newPanelPosition()
      .relativeTo('.menu-open-button')
      .addPanelPosition(this._mdPanel.xPosition.ALIGN_START, this._mdPanel.yPosition.BELOW);

  var config = {
    attachTo: angular.element(document.body),
    controller: PanelMenuCtrl,
    controllerAs: 'ctrl',
    template:
        '<div class="options-menu" ' +
        '     aria-label="Select a menu option." ' +
        '     role="listbox">' +
        '  <div class="options-menu-item" ' +
        '       ng-class="{selected : option == ctrl.selectedOption}" ' +
        '       aria-selected="{{option == ctrl.selectedOption}}" ' +
        '       tabindex="-1" ' +
        '       role="option" ' +
        '       ng-repeat="option in ctrl.options" ' +
        '       ng-click="ctrl.selectOption(option)"' +
        '       ng-keydown="ctrl.onKeydown($event, option)">' +
        '    {{ option }} ' +
        '  </div>' +
        '</div>',
    panelClass: 'options-menu',
    position: position,
    locals: {
      'selected': this.selected,
      'options': this.options
    },
    openFrom: ev,
    clickOutsideToClose: true,
    escapeToClose: true,
    focusOnOpen: false,
    zIndex: 2
  };

  this._mdPanel.open(config);
};

function PanelMenuCtrl(mdPanelRef, $timeout, $rootScope, $location) {
  this._mdPanelRef = mdPanelRef;
  this.selectedOption = this.selected.selectedOption;
  this.$location = $location;
  this.$rootScope = $rootScope;
  $timeout(function() {
    var selected = document.querySelector('.options-menu-item.selected');
    if (selected) {
      angular.element(selected).focus();
    } else {
      angular.element(document.querySelectorAll('.options-menu-item')[0]).focus();
    }
  });
}


PanelMenuCtrl.prototype.selectOption = function(option) {
  this.selected.selectedOption = option;
  this._mdPanelRef && this._mdPanelRef.close().then(function() {
    angular.element(document.querySelector('.options-menu-open-button')).focus();
  });

  switch(option) {
  case "My Profile":
    console.log("User clicked My Profile");
    this.$location.path("/user-profile");
    break;
  case "My Groups":
    console.log("User clicked My Groups");
    this.$location.path("/user-groups");
    break;
  case "Proposal Drafts":
    console.log("User clicked Proposal Drafts");
    this.$location.path("/proposal-drafts");
    break;
  case "Logout":
    console.log("User clicked Logout");
    this.$rootScope.$broadcast("Logout");            
}
};


PanelMenuCtrl.prototype.onKeydown = function($event, option) {
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

})();