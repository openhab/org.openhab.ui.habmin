/*!
 * ui-select
 * http://github.com/angular-ui/ui-select
 * Version: 0.12.1 - 2015-08-02T20:56:31.504Z
 * License: MIT
 */


(function () { 
"use strict";

var KEY = {
    TAB: 9,
    ENTER: 13,
    ESC: 27,
    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    HOME: 36,
    END: 35,
    BACKSPACE: 8,
    DELETE: 46,
    COMMAND: 91,

    MAP: { 91 : "COMMAND", 8 : "BACKSPACE" , 9 : "TAB" , 13 : "ENTER" , 16 : "SHIFT" , 17 : "CTRL" , 18 : "ALT" , 19 : "PAUSEBREAK" , 20 : "CAPSLOCK" , 27 : "ESC" , 32 : "SPACE" , 33 : "PAGE_UP", 34 : "PAGE_DOWN" , 35 : "END" , 36 : "HOME" , 37 : "LEFT" , 38 : "UP" , 39 : "RIGHT" , 40 : "DOWN" , 43 : "+" , 44 : "PRINTSCREEN" , 45 : "INSERT" , 46 : "DELETE", 48 : "0" , 49 : "1" , 50 : "2" , 51 : "3" , 52 : "4" , 53 : "5" , 54 : "6" , 55 : "7" , 56 : "8" , 57 : "9" , 59 : ";", 61 : "=" , 65 : "A" , 66 : "B" , 67 : "C" , 68 : "D" , 69 : "E" , 70 : "F" , 71 : "G" , 72 : "H" , 73 : "I" , 74 : "J" , 75 : "K" , 76 : "L", 77 : "M" , 78 : "N" , 79 : "O" , 80 : "P" , 81 : "Q" , 82 : "R" , 83 : "S" , 84 : "T" , 85 : "U" , 86 : "V" , 87 : "W" , 88 : "X" , 89 : "Y" , 90 : "Z", 96 : "0" , 97 : "1" , 98 : "2" , 99 : "3" , 100 : "4" , 101 : "5" , 102 : "6" , 103 : "7" , 104 : "8" , 105 : "9", 106 : "*" , 107 : "+" , 109 : "-" , 110 : "." , 111 : "/", 112 : "F1" , 113 : "F2" , 114 : "F3" , 115 : "F4" , 116 : "F5" , 117 : "F6" , 118 : "F7" , 119 : "F8" , 120 : "F9" , 121 : "F10" , 122 : "F11" , 123 : "F12", 144 : "NUMLOCK" , 145 : "SCROLLLOCK" , 186 : ";" , 187 : "=" , 188 : "," , 189 : "-" , 190 : "." , 191 : "/" , 192 : "`" , 219 : "[" , 220 : "\\" , 221 : "]" , 222 : "'"
    },

    isControl: function (e) {
        var k = e.which;
        switch (k) {
        case KEY.COMMAND:
        case KEY.SHIFT:
        case KEY.CTRL:
        case KEY.ALT:
            return true;
        }

        if (e.metaKey) return true;

        return false;
    },
    isFunctionKey: function (k) {
        k = k.which ? k.which : k;
        return k >= 112 && k <= 123;
    },
    isVerticalMovement: function (k){
      return ~[KEY.UP, KEY.DOWN].indexOf(k);
    },
    isHorizontalMovement: function (k){
      return ~[KEY.LEFT,KEY.RIGHT,KEY.BACKSPACE,KEY.DELETE].indexOf(k);
    }
  };

/**
 * Add querySelectorAll() to jqLite.
 *
 * jqLite find() is limited to lookups by tag name.
 * TODO This will change with future versions of AngularJS, to be removed when this happens
 *
 * See jqLite.find - why not use querySelectorAll? https://github.com/angular/angular.js/issues/3586
 * See feat(jqLite): use querySelectorAll instead of getElementsByTagName in jqLite.find https://github.com/angular/angular.js/pull/3598
 */
if (angular.element.prototype.querySelectorAll === undefined) {
  angular.element.prototype.querySelectorAll = function(selector) {
    return angular.element(this[0].querySelectorAll(selector));
  };
}

/**
 * Add closest() to jqLite.
 */
if (angular.element.prototype.closest === undefined) {
  angular.element.prototype.closest = function( selector) {
    var elem = this[0];
    var matchesSelector = elem.matches || elem.webkitMatchesSelector || elem.mozMatchesSelector || elem.msMatchesSelector;

    while (elem) {
      if (matchesSelector.bind(elem)(selector)) {
        return elem;
      } else {
        elem = elem.parentElement;
      }
    }
    return false;
  };
}

var latestId = 0;

var uis = angular.module('ui.select', [])

.constant('uiSelectConfig', {
  theme: 'bootstrap',
  searchEnabled: true,
  sortable: false,
  placeholder: '', // Empty by default, like HTML tag <select>
  refreshDelay: 1000, // In milliseconds
  closeOnSelect: true,
  generateId: function() {
    return latestId++;
  },
  appendToBody: false
})

// See Rename minErr and make it accessible from outside https://github.com/angular/angular.js/issues/6913
.service('uiSelectMinErr', function() {
  var minErr = angular.$$minErr('ui.select');
  return function() {
    var error = minErr.apply(this, arguments);
    var message = error.message.replace(new RegExp('\nhttp://errors.angularjs.org/.*'), '');
    return new Error(message);
  };
})

// Recreates old behavior of ng-transclude. Used internally.
.directive('uisTranscludeAppend', function () {
  return {
    link: function (scope, element, attrs, ctrl, transclude) {
        transclude(scope, function (clone) {
          element.append(clone);
        });
      }
    };
})

/**
 * Highlights text that matches $select.search.
 *
 * Taken from AngularUI Bootstrap Typeahead
 * See https://github.com/angular-ui/bootstrap/blob/0.10.0/src/typeahead/typeahead.js#L340
 */
.filter('highlight', function() {
  function escapeRegexp(queryToEscape) {
    return queryToEscape.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
  }

  return function(matchItem, query) {
    return query && matchItem ? matchItem.replace(new RegExp(escapeRegexp(query), 'gi'), '<span class="ui-select-highlight">$&</span>') : matchItem;
  };
})

/**
 * A read-only equivalent of jQuery's offset function: http://api.jquery.com/offset/
 *
 * Taken from AngularUI Bootstrap Position:
 * See https://github.com/angular-ui/bootstrap/blob/master/src/position/position.js#L70
 */
.factory('uisOffset',
  ['$document', '$window',
  function ($document, $window) {

  return function(element) {
    var boundingClientRect = element[0].getBoundingClientRect();
    return {
      width: boundingClientRect.width || element.prop('offsetWidth'),
      height: boundingClientRect.height || element.prop('offsetHeight'),
      top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
      left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
    };
  };
}]);

uis.directive('uiSelectChoices',
  ['uiSelectConfig', 'uisRepeatParser', 'uiSelectMinErr', '$compile',
  function(uiSelectConfig, RepeatParser, uiSelectMinErr, $compile) {

  return {
    restrict: 'EA',
    require: '^uiSelect',
    replace: true,
    transclude: true,
    templateUrl: function(tElement) {
      // Gets theme attribute from parent (ui-select)
      var theme = tElement.parent().attr('theme') || uiSelectConfig.theme;
      return theme + '/choices.tpl.html';
    },

    compile: function(tElement, tAttrs) {

      if (!tAttrs.repeat) throw uiSelectMinErr('repeat', "Expected 'repeat' expression.");

      return function link(scope, element, attrs, $select, transcludeFn) {

        // var repeat = RepeatParser.parse(attrs.repeat);
        var groupByExp = attrs.groupBy;
        var groupFilterExp = attrs.groupFilter;

        $select.parseRepeatAttr(attrs.repeat, groupByExp, groupFilterExp); //Result ready at $select.parserResult

        $select.disableChoiceExpression = attrs.uiDisableChoice;
        $select.onHighlightCallback = attrs.onHighlight;

        $select.refreshOnActive = scope.$eval(attrs.refreshOnActive);

        if(groupByExp) {
          var groups = element.querySelectorAll('.ui-select-choices-group');
          if (groups.length !== 1) throw uiSelectMinErr('rows', "Expected 1 .ui-select-choices-group but got '{0}'.", groups.length);
          groups.attr('ng-repeat', RepeatParser.getGroupNgRepeatExpression());
        }

        var choices = element.querySelectorAll('.ui-select-choices-row');
        if (choices.length !== 1) {
          throw uiSelectMinErr('rows', "Expected 1 .ui-select-choices-row but got '{0}'.", choices.length);
        }

        choices.attr('ng-repeat', RepeatParser.getNgRepeatExpression($select.parserResult.itemName, '$select.items', $select.parserResult.trackByExp, groupByExp))
            .attr('ng-if', '$select.open') //Prevent unnecessary watches when dropdown is closed
            .attr('ng-mouseenter', '$select.setActiveItem('+$select.parserResult.itemName +')')
            .attr('ng-click', '$select.select(' + $select.parserResult.itemName + ',false,$event)');

        var rowsInner = element.querySelectorAll('.ui-select-choices-row-inner');
        if (rowsInner.length !== 1) throw uiSelectMinErr('rows', "Expected 1 .ui-select-choices-row-inner but got '{0}'.", rowsInner.length);
        rowsInner.attr('uis-transclude-append', ''); //Adding uisTranscludeAppend directive to row element after choices element has ngRepeat

        $compile(element, transcludeFn)(scope); //Passing current transcludeFn to be able to append elements correctly from uisTranscludeAppend

        scope.$watch('$select.search', function(newValue) {
          if(newValue && !$select.open && $select.multiple) $select.activate(false, true);
          $select.activeIndex = 0;
          if(!$select.refreshOnActive || ($select.refreshOnActive && $select.refreshIsActive)) {
            $select.refresh(attrs.refresh);
          }
        });

        scope.$watch('$select.refreshIsActive', function(newValue, oldValue){
          if(angular.isUndefined(oldValue) && newValue){
            $select.refresh(attrs.refresh);
          }
        });

        // $eval() is needed otherwise we get a string instead of a number
        var refreshDelay = scope.$eval(attrs.refreshDelay);
        $select.refreshDelay = refreshDelay !== undefined ? refreshDelay : uiSelectConfig.refreshDelay;
      };
    }
  };
}]);

/**
 * Contains ui-select "intelligence".
 *
 * The goal is to limit dependency on the DOM whenever possible and
 * put as much logic in the controller (instead of the link functions) as possible so it can be easily tested.
 */
uis.controller('uiSelectCtrl',
    ['$scope', '$element', '$timeout', '$filter', '$q', 'uisRepeatParser', 'uiSelectMinErr', 'uiSelectConfig',
        function ($scope, $element, $timeout, $filter, $q, RepeatParser, uiSelectMinErr, uiSelectConfig) {

            var ctrl = this;

            var EMPTY_SEARCH = '';

            ctrl.placeholder = uiSelectConfig.placeholder;
            ctrl.searchEnabled = uiSelectConfig.searchEnabled;
            ctrl.sortable = uiSelectConfig.sortable;
            ctrl.refreshDelay = uiSelectConfig.refreshDelay;

            ctrl.removeSelected = false; //If selected item(s) should be removed from dropdown list
            ctrl.closeOnSelect = true; //Initialized inside uiSelect directive link function
            ctrl.search = EMPTY_SEARCH;

            ctrl.activeIndex = 0; //Dropdown of choices
            ctrl.items = []; //All available choices

            ctrl.open = false;
            ctrl.focus = false;
            ctrl.disabled = false;
            ctrl.selected = undefined;

            ctrl.focusser = undefined; //Reference to input element used to handle focus events
            ctrl.resetSearchInput = true;
            ctrl.multiple = undefined; // Initialized inside uiSelect directive link function
            ctrl.disableChoiceExpression = undefined; // Initialized inside uiSelectChoices directive link function
            ctrl.lockChoiceExpression = undefined; // Initialized inside uiSelectMatch directive link function
            ctrl.clickTriggeredSelect = false;
            ctrl.$filter = $filter;
            ctrl.refreshOnActive = undefined;
            ctrl.refreshIsActive = undefined;

            ctrl.searchInput = $element.querySelectorAll('input.ui-select-search');
            if (ctrl.searchInput.length !== 1) {
                throw uiSelectMinErr('searchInput', "Expected 1 input.ui-select-search but got '{0}'.",
                    ctrl.searchInput.length);
            }

            ctrl.isEmpty = function () {
                return angular.isUndefined(ctrl.selected) || ctrl.selected === null || ctrl.selected === '';
            };

            // Most of the time the user does not want to empty the search input when in typeahead mode
            function _resetSearchInput() {
                if (ctrl.resetSearchInput || (ctrl.resetSearchInput === undefined && uiSelectConfig.resetSearchInput)) {
                    ctrl.search = EMPTY_SEARCH;
                    //reset activeIndex
                    if (ctrl.selected && ctrl.items.length && !ctrl.multiple) {
                        ctrl.activeIndex = ctrl.items.indexOf(ctrl.selected);
                    }
                }
            }

            function _groupsFilter(groups, groupNames) {
                var i, j, result = [];
                for (i = 0; i < groupNames.length; i++) {
                    for (j = 0; j < groups.length; j++) {
                        if (groups[j].name == [groupNames[i]]) {
                            result.push(groups[j]);
                        }
                    }
                }
                return result;
            }

            // When the user clicks on ui-select, displays the dropdown list
            ctrl.activate = function (initSearchValue, avoidReset) {
                if (!ctrl.disabled && !ctrl.open) {
                    if (!avoidReset) _resetSearchInput();

                    $scope.$broadcast('uis:activate');

                    ctrl.open = true;
                    if (!ctrl.searchEnabled) {
                        angular.element(ctrl.searchInput[0]).addClass('ui-select-offscreen');
                    }

                    ctrl.activeIndex = ctrl.activeIndex >= ctrl.items.length ? 0 : ctrl.activeIndex;
                    ctrl.refreshIsActive = true;

                    // Give it time to appear before focus
                    $timeout(function () {
                        ctrl.search = initSearchValue || ctrl.search;
                        ctrl.searchInput[0].focus();
                    });
                }
                else if (ctrl.open && !ctrl.searchEnabled) {
                    // Close the selection if we don't have search enabled, and we click on the select again
                    ctrl.close();
                }
            };

            ctrl.findGroupByName = function (name) {
                return ctrl.groups && ctrl.groups.filter(function (group) {
                        return group.name === name;
                    })[0];
            };

            ctrl.parseRepeatAttr = function (repeatAttr, groupByExp, groupFilterExp) {
                function updateGroups(items) {
                    var groupFn = $scope.$eval(groupByExp);
                    ctrl.groups = [];
                    angular.forEach(items, function (item) {
                        var groupName = angular.isFunction(groupFn) ? groupFn(item) : item[groupFn];
                        var group = ctrl.findGroupByName(groupName);
                        if (group) {
                            group.items.push(item);
                        }
                        else {
                            ctrl.groups.push({name: groupName, items: [item]});
                        }
                    });
                    if (groupFilterExp) {
                        var groupFilterFn = $scope.$eval(groupFilterExp);
                        if (angular.isFunction(groupFilterFn)) {
                            ctrl.groups = groupFilterFn(ctrl.groups);
                        } else if (angular.isArray(groupFilterFn)) {
                            ctrl.groups = _groupsFilter(ctrl.groups, groupFilterFn);
                        }
                    }
                    ctrl.items = [];
                    ctrl.groups.forEach(function (group) {
                        ctrl.items = ctrl.items.concat(group.items);
                    });
                }

                function setPlainItems(items) {
                    ctrl.items = items;
                }

                ctrl.setItemsFn = groupByExp ? updateGroups : setPlainItems;

                ctrl.parserResult = RepeatParser.parse(repeatAttr);

                ctrl.isGrouped = !!groupByExp;
                ctrl.itemProperty = ctrl.parserResult.itemName;

                ctrl.refreshItems = function (data) {
                    data = data || ctrl.parserResult.source($scope);
                    var selectedItems = ctrl.selected;
                    //TODO should implement for single mode removeSelected
                    if (ctrl.isEmpty() || (angular.isArray(selectedItems) && !selectedItems.length) ||
                        !ctrl.removeSelected) {
                        ctrl.setItemsFn(data);
                    } else {
                        if (data !== undefined) {
                            var filteredItems = data.filter(function (i) {
                                return selectedItems.indexOf(i) < 0;
                            });
                            ctrl.setItemsFn(filteredItems);
                        }
                    }
                };

                // See https://github.com/angular/angular.js/blob/v1.2.15/src/ng/directive/ngRepeat.js#L259
                $scope.$watchCollection(ctrl.parserResult.source, function (items) {
                    if (items === undefined || items === null) {
                        // If the user specifies undefined or null => reset the collection
                        // Special case: items can be undefined if the user did not initialized the collection on the scope
                        // i.e $scope.addresses = [] is missing
                        ctrl.items = [];
                    } else {
                        if (!angular.isArray(items)) {
                            throw uiSelectMinErr('items', "Expected an array but got '{0}'.", items);
                        } else {
                            //Remove already selected items (ex: while searching)
                            //TODO Should add a test
                            ctrl.refreshItems(items);
                            ctrl.ngModel.$modelValue = null; //Force scope model value and ngModel value to be out of sync to re-run formatters
                        }
                    }
                });

            };

            var _refreshDelayPromise;

            /**
             * Typeahead mode: lets the user refresh the collection using his own function.
             *
             * See Expose $select.search for external / remote filtering https://github.com/angular-ui/ui-select/pull/31
             */
            ctrl.refresh = function (refreshAttr) {
                if (refreshAttr !== undefined) {

                    // Debounce
                    // See https://github.com/angular-ui/bootstrap/blob/0.10.0/src/typeahead/typeahead.js#L155
                    // FYI AngularStrap typeahead does not have debouncing: https://github.com/mgcrea/angular-strap/blob/v2.0.0-rc.4/src/typeahead/typeahead.js#L177
                    if (_refreshDelayPromise) {
                        $timeout.cancel(_refreshDelayPromise);
                    }
                    _refreshDelayPromise = $timeout(function () {
                        $scope.$eval(refreshAttr);
                    }, ctrl.refreshDelay);
                }
            };

            ctrl.setActiveItem = function (item) {
                ctrl.activeIndex = ctrl.items.indexOf(item);
            };

            ctrl.isActive = function (itemScope) {
                if (!ctrl.open) {
                    return false;
                }
                var itemIndex = ctrl.items.indexOf(itemScope[ctrl.itemProperty]);
                var isActive = itemIndex === ctrl.activeIndex;

                if (isActive && !angular.isUndefined(ctrl.onHighlightCallback)) {
                    itemScope.$eval(ctrl.onHighlightCallback);
                }

                return isActive;
            };

            /**
             * Checks if the item is disabled
             * @return boolean true if the item is disabled
             */
            ctrl.isDisabled = function (itemScope) {

                if (!ctrl.open) return false;

                var itemIndex = ctrl.items.indexOf(itemScope[ctrl.itemProperty]);
                var isDisabled = false;
                var item;

                if (itemIndex >= 0 && !angular.isUndefined(ctrl.disableChoiceExpression)) {
                    item = ctrl.items[itemIndex];
                    isDisabled = !!(itemScope.$eval(ctrl.disableChoiceExpression)); // force the boolean value
                    item._uiSelectChoiceDisabled = isDisabled; // store this for later reference
                }

                return isDisabled;
            };


            /**
             * Called when the user selects an item with ENTER or clicks the dropdown
             */
            ctrl.select = function (item, skipFocusser, $event) {
                if (item === undefined || !item._uiSelectChoiceDisabled) {

                    if (!ctrl.items && !ctrl.search){
                        return;
                    }

                    if (!item || !item._uiSelectChoiceDisabled) {

                        var completeSelection = function () {
                            $scope.$broadcast('uis:select', item);

                            $timeout(function () {
                                ctrl.onSelectCallback($scope, callbackContext);
                            });

                            if (ctrl.closeOnSelect) {
                                ctrl.close(skipFocusser);
                            }
                            if ($event && $event.type === 'click') {
                                ctrl.clickTriggeredSelect = true;
                            }
                        };

                        var locals = {};
                        locals[ctrl.parserResult.itemName] = item;

                        var callbackContext = {
                            $item: item,
                            $model: ctrl.parserResult.modelMapper($scope, locals)
                        };

                        // Call the onBeforeSelect callback
                        // Allowable responses are -:
                        // falsy: Abort the selection
                        // promise: Wait for response
                        // true: Complete selection
                        // object: Add the returned object
                        var onBeforeSelectResult = ctrl.onBeforeSelectCallback($scope, callbackContext);
                        if (angular.isDefined(onBeforeSelectResult)) {
                            if (!onBeforeSelectResult) {
                                return;  // abort the selection in case of deliberate falsey result
                            } else if (angular.isFunction(onBeforeSelectResult.then)) {
                                onBeforeSelectResult.then(function (result) {
                                    if (!result) {
                                        return;
                                    }
                                    completeSelection(result);
                                });
                            } else if (onBeforeSelectResult === true) {
                                completeSelection(item);
                            } else {
                                completeSelection(onBeforeSelectResult);
                            }
                        } else {
                            completeSelection(item);
                        }
                    }
                }
            };

            // Closes the dropdown
            ctrl.close = function (skipFocusser) {
                if (!ctrl.open) {
                    return;
                }
                if (ctrl.ngModel && ctrl.ngModel.$setTouched) ctrl.ngModel.$setTouched();
                _resetSearchInput();
                ctrl.open = false;
                if (!ctrl.searchEnabled) {
                    angular.element(ctrl.searchInput[0]).removeClass('ui-select-offscreen');
                }

                $scope.$broadcast('uis:close', skipFocusser);
            };

            ctrl.setFocus = function () {
                if (!ctrl.focus) {
                    ctrl.focusInput[0].focus();
                }
            };

            ctrl.clear = function ($event) {
                ctrl.select(undefined);
                $event.stopPropagation();
                $timeout(function () {
                    ctrl.focusser[0].focus();
                }, 0, false);
            };

            // Toggle dropdown
            ctrl.toggle = function (e) {
                if (ctrl.open) {
                    ctrl.close();
                    e.preventDefault();
                    e.stopPropagation();
                } else {
                    ctrl.activate();
                }
            };

            ctrl.isLocked = function (itemScope, itemIndex) {
                var isLocked, item = ctrl.selected[itemIndex];

                if (item && !angular.isUndefined(ctrl.lockChoiceExpression)) {
                    isLocked = !!(itemScope.$eval(ctrl.lockChoiceExpression)); // force the boolean value
                    item._uiSelectChoiceLocked = isLocked; // store this for later reference
                }

                return isLocked;
            };

            var sizeWatch = null;
            ctrl.sizeSearchInput = function () {

                var input = ctrl.searchInput[0],
                    container = ctrl.searchInput.parent().parent()[0],
                    calculateContainerWidth = function () {
                        // Return the container width only if the search input is visible
                        return container.clientWidth * !!input.offsetParent;
                    },
                    updateIfVisible = function (containerWidth) {
                        if (containerWidth === 0) {
                            return false;
                        }
                        var inputWidth = containerWidth - input.offsetLeft - ctrl.searchInput.parent()[0].offsetLeft -
                            5;
                        if (inputWidth < 50) {
                            inputWidth = containerWidth;
                        }
                        ctrl.searchInput.css('width', inputWidth + 'px');
                        return true;
                    };

                ctrl.searchInput.css('width', '10px');
                $timeout(function () { //Give time to render correctly
                    if (sizeWatch === null && !updateIfVisible(calculateContainerWidth())) {
                        sizeWatch = $scope.$watch(calculateContainerWidth, function (containerWidth) {
                            if (updateIfVisible(containerWidth)) {
                                sizeWatch();
                                sizeWatch = null;
                            }
                        });
                    }
                });
            };

            function _handleDropDownSelection(key) {
                var processed = true;
                switch (key) {
                    case KEY.DOWN:
                        if (!ctrl.open && ctrl.multiple) {
                            ctrl.activate(false, true); //In case its the search input in 'multiple' mode
                        }
                        else if (ctrl.activeIndex < ctrl.items.length - 1) {
                            ctrl.activeIndex++;
                        }
                        break;
                    case KEY.UP:
                        if (!ctrl.open && ctrl.multiple) {
                            ctrl.activate(false, true);
                        } //In case its the search input in 'multiple' mode
                        else if (ctrl.activeIndex > 0) {
                            ctrl.activeIndex--;
                        }
                        break;
                    case KEY.TAB:
                        if (!ctrl.multiple || ctrl.open) ctrl.select(ctrl.items[ctrl.activeIndex], true);
                        break;
                    case KEY.ENTER:
                        if (ctrl.open) {
                            // Make sure at least one dropdown item is highlighted before adding
                            ctrl.select(ctrl.items[ctrl.activeIndex]);
                        } else {
                            // In case its the search input in 'multiple' mode
                            ctrl.activate(false, true);
                        }
                        break;
                    case KEY.ESC:
                        ctrl.close();
                        break;
                    default:
                        processed = false;
                }
                return processed;
            }

            // Bind to keyboard shortcuts
            ctrl.searchInput.on('keydown', function (e) {

                var key = e.which;

                // if(~[KEY.ESC,KEY.TAB].indexOf(key)){
                //   //TODO: SEGURO?
                //   ctrl.close();
                // }

                $scope.$apply(function () {
                    _handleDropDownSelection(key);
                });

                if (KEY.isVerticalMovement(key) && ctrl.items.length > 0) {
                    _ensureHighlightVisible();
                }

                if (key === KEY.ENTER || key === KEY.ESC) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });

            // If tagging try to split by tokens and add items
      /*      ctrl.searchInput.on('paste', function (e) {
                var data = e.originalEvent.clipboardData.getData('text/plain');
                if (data && data.length > 0 && ctrl.taggingTokens.isActivated && ctrl.tagging.fct) {
                    var items = data.split(ctrl.taggingTokens.tokens[0]); // split by first token only
                    if (items && items.length > 0) {
                        angular.forEach(items, function (item) {
                            var newItem = ctrl.tagging.fct(item);
                            if (newItem) {
                                ctrl.select(newItem, true);
                            }
                        });
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
            });*/

            ctrl.searchInput.on('keyup', function (e) {
                // return early with these keys
                if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e) || e.which === KEY.ESC ||
                    KEY.isVerticalMovement(e.which)) {
                    return;
                }

                if (ctrl.onKeypressCallback === undefined) {
                    return;
                }
                ctrl.onKeypressCallback($scope, {event: e});
            });


            // See https://github.com/ivaynberg/select2/blob/3.4.6/select2.js#L1431
            function _ensureHighlightVisible() {
                var container = $element.querySelectorAll('.ui-select-choices-content');
                var choices = container.querySelectorAll('.ui-select-choices-row');
                if (choices.length < 1) {
                    throw uiSelectMinErr('choices', "Expected multiple .ui-select-choices-row but got '{0}'.",
                        choices.length);
                }

                if (ctrl.activeIndex < 0) {
                    return;
                }

                var highlighted = choices[ctrl.activeIndex];
                var posY = highlighted.offsetTop + highlighted.clientHeight - container[0].scrollTop;
                var height = container[0].offsetHeight;

                if (posY > height) {
                    container[0].scrollTop += posY - height;
                } else if (posY < highlighted.clientHeight) {
                    if (ctrl.isGrouped && ctrl.activeIndex === 0)
                        container[0].scrollTop = 0; //To make group header visible when going all the way up
                    else
                        container[0].scrollTop -= highlighted.clientHeight - posY;
                }
            }

            $scope.$on('$destroy', function () {
                ctrl.searchInput.off('keyup keydown blur paste');
            });

        }]);

uis.directive('uiSelect',
    ['$document', 'uiSelectConfig', 'uiSelectMinErr', 'uisOffset', '$compile', '$parse', '$timeout',
        function ($document, uiSelectConfig, uiSelectMinErr, uisOffset, $compile, $parse, $timeout) {

            return {
                restrict: 'EA',
                templateUrl: function (tElement, tAttrs) {
                    var theme = tAttrs.theme || uiSelectConfig.theme;
                    return theme +
                        (angular.isDefined(tAttrs.multiple) ? '/select-multiple.tpl.html' : '/select.tpl.html');
                },
                replace: true,
                transclude: true,
                require: ['uiSelect', '^ngModel'],
                scope: true,
                controller: 'uiSelectCtrl',
                controllerAs: '$select',
                compile: function (tElement, tAttrs) {

                    //Multiple or Single depending if multiple attribute presence
                    if (angular.isDefined(tAttrs.multiple))
                        tElement.append("<ui-select-multiple/>").removeAttr('multiple');
                    else
                        tElement.append("<ui-select-single/>");

                    return function (scope, element, attrs, ctrls, transcludeFn) {

                        var $select = ctrls[0];
                        var ngModel = ctrls[1];

                        $select.generatedId = uiSelectConfig.generateId();
                        $select.baseTitle = attrs.title || 'Select box';
                        $select.focusserTitle = $select.baseTitle + ' focus';
                        $select.focusserId = 'focusser-' + $select.generatedId;

                        $select.closeOnSelect = function () {
                            if (angular.isDefined(attrs.closeOnSelect)) {
                                return $parse(attrs.closeOnSelect)();
                            } else {
                                return uiSelectConfig.closeOnSelect;
                            }
                        }();

                        $select.onBeforeSelectCallback = $parse(attrs.onBeforeSelect);
                        $select.onSelectCallback = $parse(attrs.onSelect);
                        $select.onRemoveCallback = $parse(attrs.onRemove);
                        $select.onKeypressCallback = $parse(attrs.onKeypress);

                        //Limit the number of selections allowed
                        $select.limit = (angular.isDefined(attrs.limit)) ? parseInt(attrs.limit, 10) : undefined;

                        //Set reference to ngModel from uiSelectCtrl
                        $select.ngModel = ngModel;

                        $select.choiceGrouped = function (group) {
                            return $select.isGrouped && group && group.name;
                        };

                        if (attrs.tabindex) {
                            attrs.$observe('tabindex', function (value) {
                                $select.focusInput.attr("tabindex", value);
                                element.removeAttr("tabindex");
                            });
                        }

                        var searchEnabled = scope.$eval(attrs.searchEnabled);
                        $select.searchEnabled =
                            searchEnabled !== undefined ? searchEnabled : uiSelectConfig.searchEnabled;

                        var sortable = scope.$eval(attrs.sortable);
                        $select.sortable = sortable !== undefined ? sortable : uiSelectConfig.sortable;

                        attrs.$observe('disabled', function () {
                            // No need to use $eval() (thanks to ng-disabled) since we already get a boolean instead of a string
                            $select.disabled = attrs.disabled !== undefined ? attrs.disabled : false;
                        });

                        attrs.$observe('resetSearchInput', function () {
                            // $eval() is needed otherwise we get a string instead of a boolean
                            var resetSearchInput = scope.$eval(attrs.resetSearchInput);
                            $select.resetSearchInput = resetSearchInput !== undefined ? resetSearchInput : true;
                        });

                        //Automatically gets focus when loaded
                        if (angular.isDefined(attrs.autofocus)) {
                            $timeout(function () {
                                $select.setFocus();
                            });
                        }

                        //Gets focus based on scope event name (e.g. focus-on='SomeEventName')
                        if (angular.isDefined(attrs.focusOn)) {
                            scope.$on(attrs.focusOn, function () {
                                $timeout(function () {
                                    $select.setFocus();
                                });
                            });
                        }

                        function onDocumentClick(e) {
                            if (!$select.open) return; //Skip it if dropdown is close

                            var contains = false;

                            if (window.jQuery) {
                                // Firefox 3.6 does not support element.contains()
                                // See Node.contains https://developer.mozilla.org/en-US/docs/Web/API/Node.contains
                                contains = window.jQuery.contains(element[0], e.target);
                            } else {
                                contains = element[0].contains(e.target);
                            }

                            if (!contains && !$select.clickTriggeredSelect) {
                                //Will lose focus only with certain targets
                                var focusableControls = ['input', 'button', 'textarea'];
                                //To check if target is other ui-select
                                var targetScope = angular.element(e.target).scope();
                                //To check if target is other ui-select
                                var skipFocusser = targetScope && targetScope.$select &&
                                    targetScope.$select !== $select;
                                //Check if target is input, button or textarea
                                if (!skipFocusser) {
                                    skipFocusser = ~focusableControls.indexOf(e.target.tagName.toLowerCase());
                                }
                                $select.close(skipFocusser);
                                scope.$digest();
                            }
                            $select.clickTriggeredSelect = false;
                        }

                        // See Click everywhere but here event http://stackoverflow.com/questions/12931369
                        $document.on('click', onDocumentClick);

                        scope.$on('$destroy', function () {
                            $document.off('click', onDocumentClick);
                        });

                        // Move transcluded elements to their correct position in main template
                        transcludeFn(scope, function (clone) {
                            // See Transclude in AngularJS http://blog.omkarpatil.com/2012/11/transclude-in-angularjs.html

                            // One day jqLite will be replaced by jQuery and we will be able to write:
                            // var transcludedElement = clone.filter('.my-class')
                            // instead of creating a hackish DOM element:
                            var transcluded = angular.element('<div>').append(clone);

                            var transcludedMatch = transcluded.querySelectorAll('.ui-select-match');
                            transcludedMatch.removeAttr('ui-select-match'); //To avoid loop in case directive as attr
                            transcludedMatch.removeAttr('data-ui-select-match'); // Properly handle HTML5 data-attributes
                            if (transcludedMatch.length !== 1) {
                                throw uiSelectMinErr('transcluded', "Expected 1 .ui-select-match but got '{0}'.",
                                    transcludedMatch.length);
                            }
                            element.querySelectorAll('.ui-select-match').replaceWith(transcludedMatch);

                            var transcludedChoices = transcluded.querySelectorAll('.ui-select-choices');
                            transcludedChoices.removeAttr('ui-select-choices'); //To avoid loop in case directive as attr
                            transcludedChoices.removeAttr('data-ui-select-choices'); // Properly handle HTML5 data-attributes
                            if (transcludedChoices.length !== 1) {
                                throw uiSelectMinErr('transcluded', "Expected 1 .ui-select-choices but got '{0}'.",
                                    transcludedChoices.length);
                            }
                            element.querySelectorAll('.ui-select-choices').replaceWith(transcludedChoices);
                        });

                        // Support for appending the select field to the body when its open
                        var appendToBody = scope.$eval(attrs.appendToBody);
                        if (appendToBody !== undefined ? appendToBody : uiSelectConfig.appendToBody) {
                            scope.$watch('$select.open', function (isOpen) {
                                if (isOpen) {
                                    positionDropdown();
                                } else {
                                    resetDropdown();
                                }
                            });

                            // Move the dropdown back to its original location when the scope is destroyed. Otherwise
                            // it might stick around when the user routes away or the select field is otherwise removed
                            scope.$on('$destroy', function () {
                                resetDropdown();
                            });
                        }

                        // Hold on to a reference to the .ui-select-container element for appendToBody support
                        var placeholder = null,
                            originalWidth = '';

                        function positionDropdown() {
                            // Remember the absolute position of the element
                            var offset = uisOffset(element);

                            // Clone the element into a placeholder element to take its original place in the DOM
                            placeholder = angular.element('<div class="ui-select-placeholder"></div>');
                            placeholder[0].style.width = offset.width + 'px';
                            placeholder[0].style.height = offset.height + 'px';
                            element.after(placeholder);

                            // Remember the original value of the element width inline style, so it can be restored
                            // when the dropdown is closed
                            originalWidth = element[0].style.width;

                            // Now move the actual dropdown element to the end of the body
                            $document.find('body').append(element);

                            element[0].style.position = 'absolute';
                            element[0].style.left = offset.left + 'px';
                            element[0].style.top = offset.top + 'px';
                            element[0].style.width = offset.width + 'px';
                        }

                        function resetDropdown() {
                            if (placeholder === null) {
                                // The dropdown has not actually been display yet, so there's nothing to reset
                                return;
                            }

                            // Move the dropdown element back to its original location in the DOM
                            placeholder.replaceWith(element);
                            placeholder = null;

                            element[0].style.position = '';
                            element[0].style.left = '';
                            element[0].style.top = '';
                            element[0].style.width = originalWidth;
                        }

                        // Hold on to a reference to the .ui-select-dropdown element for direction support.
                        var dropdown = null,
                            directionUpClassName = 'direction-up';

                        // Support changing the direction of the dropdown if there isn't enough space to render it.
                        scope.$watch('$select.open', function (isOpen) {
                            if (isOpen) {
                                dropdown = angular.element(element).querySelectorAll('.ui-select-dropdown');
                                if (dropdown === null) {
                                    return;
                                }

                                // Hide the dropdown so there is no flicker until $timeout is done executing.
                                dropdown[0].style.opacity = 0;

                                // Delay positioning the dropdown until all choices have been added so its height is correct.
                                $timeout(function () {
                                    var offset = uisOffset(element);
                                    var offsetDropdown = uisOffset(dropdown);

                                    // Determine if the direction of the dropdown needs to be changed.
                                    if (offset.top + offset.height + offsetDropdown.height >
                                        $document[0].documentElement.scrollTop +
                                        $document[0].documentElement.clientHeight) {
                                        dropdown[0].style.position = 'absolute';
                                        dropdown[0].style.top = (offsetDropdown.height * -1) + 'px';
                                        element.addClass(directionUpClassName);
                                    }

                                    // Display the dropdown once it has been positioned.
                                    dropdown[0].style.opacity = 1;
                                });
                            } else {
                                if (dropdown === null) {
                                    return;
                                }

                                // Reset the position of the dropdown.
                                dropdown[0].style.position = '';
                                dropdown[0].style.top = '';
                                element.removeClass(directionUpClassName);
                            }
                        });
                    };
                }
            };
        }]);

uis.directive('uiSelectMatch', ['uiSelectConfig', function(uiSelectConfig) {
  return {
    restrict: 'EA',
    require: '^uiSelect',
    replace: true,
    transclude: true,
    templateUrl: function(tElement) {
      // Gets theme attribute from parent (ui-select)
      var theme = tElement.parent().attr('theme') || uiSelectConfig.theme;
      var multi = tElement.parent().attr('multiple');
      return theme + (multi ? '/match-multiple.tpl.html' : '/match.tpl.html');
    },
    link: function(scope, element, attrs, $select) {
      $select.lockChoiceExpression = attrs.uiLockChoice;
      attrs.$observe('placeholder', function(placeholder) {
        $select.placeholder = placeholder !== undefined ? placeholder : uiSelectConfig.placeholder;
      });

      function setAllowClear(allow) {
        $select.allowClear = (angular.isDefined(allow)) ? (allow === '') ? true : (allow.toLowerCase() === 'true') : false;
      }

      attrs.$observe('allowClear', setAllowClear);
      setAllowClear(attrs.allowClear);

      if($select.multiple){
        $select.sizeSearchInput();
      }

    }
  };
}]);

uis.directive('uiSelectMultiple', ['uiSelectMinErr','$timeout', function(uiSelectMinErr, $timeout) {
  return {
    restrict: 'EA',
    require: ['^uiSelect', '^ngModel'],

    controller: ['$scope','$timeout', function($scope, $timeout){

      var ctrl = this,
          $select = $scope.$select,
          ngModel;

      //Wait for link fn to inject it 
      $scope.$evalAsync(function(){ ngModel = $scope.ngModel; });

      ctrl.activeMatchIndex = -1;

      ctrl.updateModel = function(){
        ngModel.$setViewValue(Date.now()); //Set timestamp as a unique string to force changes
        ctrl.refreshComponent();
      };

      ctrl.refreshComponent = function(){
        //Remove already selected items
        //e.g. When user clicks on a selection, the selected array changes and 
        //the dropdown should remove that item
        $select.refreshItems();
        $select.sizeSearchInput();
      };

      // Remove item from multiple select
      ctrl.removeChoice = function(index){

        var removedChoice = $select.selected[index];

        // if the choice is locked, can't remove it
        if(removedChoice._uiSelectChoiceLocked) return;

        var locals = {};
        locals[$select.parserResult.itemName] = removedChoice;

        $select.selected.splice(index, 1);
        ctrl.activeMatchIndex = -1;
        $select.sizeSearchInput();

        // Give some time for scope propagation.
        $timeout(function(){
          $select.onRemoveCallback($scope, {
            $item: removedChoice,
            $model: $select.parserResult.modelMapper($scope, locals)
          });
        });

        ctrl.updateModel();

      };

      ctrl.getPlaceholder = function(){
        //Refactor single?
        if($select.selected && $select.selected.length) return;
        return $select.placeholder;
      };


    }],
    controllerAs: '$selectMultiple',

    link: function(scope, element, attrs, ctrls) {

      var $select = ctrls[0];
      var ngModel = scope.ngModel = ctrls[1];
      var $selectMultiple = scope.$selectMultiple;

      //$select.selected = raw selected objects (ignoring any property binding)

      $select.multiple = true;
      $select.removeSelected = true;

      //Input that will handle focus
      $select.focusInput = $select.searchInput;

      //From view --> model
      ngModel.$parsers.unshift(function () {
        var locals = {},
            result,
            resultMultiple = [];
        for (var j = $select.selected.length - 1; j >= 0; j--) {
          locals = {};
          locals[$select.parserResult.itemName] = $select.selected[j];
          result = $select.parserResult.modelMapper(scope, locals);
          resultMultiple.unshift(result);
        }
        return resultMultiple;
      });

      // From model --> view
      ngModel.$formatters.unshift(function (inputValue) {
        var data = $select.parserResult.source (scope, { $select : {search:''}}), //Overwrite $search
            locals = {},
            result;
        if (!data) return inputValue;
        var resultMultiple = [];
        var checkFnMultiple = function(list, value){
          if (!list || !list.length) return;
          for (var p = list.length - 1; p >= 0; p--) {
            locals[$select.parserResult.itemName] = list[p];
            result = $select.parserResult.modelMapper(scope, locals);
            if($select.parserResult.trackByExp){
                var matches = /\.(.+)/.exec($select.parserResult.trackByExp);
                if(matches.length>0 && result[matches[1]] == value[matches[1]]){
                    resultMultiple.unshift(list[p]);
                    return true;
                }
            }
            if (angular.equals(result,value)){
              resultMultiple.unshift(list[p]);
              return true;
            }
          }
          return false;
        };
        if (!inputValue) return resultMultiple; //If ngModel was undefined
        for (var k = inputValue.length - 1; k >= 0; k--) {
          //Check model array of currently selected items 
          if (!checkFnMultiple($select.selected, inputValue[k])){
            //Check model array of all items available
            if (!checkFnMultiple(data, inputValue[k])){
              //If not found on previous lists, just add it directly to resultMultiple
              resultMultiple.unshift(inputValue[k]);
            }
          }
        }
        return resultMultiple;
      });
      
      //Watch for external model changes 
      scope.$watchCollection(function(){ return ngModel.$modelValue; }, function(newValue, oldValue) {
        if (oldValue != newValue){
          ngModel.$modelValue = null; //Force scope model value and ngModel value to be out of sync to re-run formatters
          $selectMultiple.refreshComponent();
        }
      });

      ngModel.$render = function() {
        // Make sure that model value is array
        if(!angular.isArray(ngModel.$viewValue)){
          // Have tolerance for null or undefined values
          if(angular.isUndefined(ngModel.$viewValue) || ngModel.$viewValue === null){
            $select.selected = [];
          } else {
            throw uiSelectMinErr('multiarr', "Expected model value to be array but got '{0}'", ngModel.$viewValue);
          }
        }
        $select.selected = ngModel.$viewValue;
        scope.$evalAsync(); //To force $digest
      };

      scope.$on('uis:select', function (event, item) {
        if($select.selected.length >= $select.limit) {
          return;
        }
        $select.selected.push(item);
        $selectMultiple.updateModel();
      });

      scope.$on('uis:activate', function () {
        $selectMultiple.activeMatchIndex = -1;
      });

      scope.$watch('$select.disabled', function(newValue, oldValue) {
        // As the search input field may now become visible, it may be necessary to recompute its size
        if (oldValue && !newValue) $select.sizeSearchInput();
      });

      $select.searchInput.on('keydown', function(e) {
        var key = e.which;
        scope.$apply(function() {
          var processed = false;
          if(KEY.isHorizontalMovement(key)){
            processed = _handleMatchSelection(key);
          }
          if (processed  && key != KEY.TAB) {
            //TODO Check si el tab selecciona aun correctamente
            //Crear test
//            e.preventDefault();
  //          e.stopPropagation();
          }
        });
      });
      function _getCaretPosition(el) {
        if(angular.isNumber(el.selectionStart)) return el.selectionStart;
        // selectionStart is not supported in IE8 and we don't want hacky workarounds so we compromise
        else return el.value.length;
      }
      // Handles selected options in "multiple" mode
      function _handleMatchSelection(key){
        var caretPosition = _getCaretPosition($select.searchInput[0]),
            length = $select.selected.length,
            // none  = -1,
            first = 0,
            last  = length-1,
            curr  = $selectMultiple.activeMatchIndex,
            next  = $selectMultiple.activeMatchIndex+1,
            prev  = $selectMultiple.activeMatchIndex-1,
            newIndex = curr;

        if(caretPosition > 0 || ($select.search.length && key == KEY.RIGHT)) return false;

        $select.close();

        function getNewActiveMatchIndex(){
          switch(key){
            case KEY.LEFT:
              // Select previous/first item
              if(~$selectMultiple.activeMatchIndex) return prev;
              // Select last item
              else return last;
              break;
            case KEY.RIGHT:
              // Open drop-down
              if(!~$selectMultiple.activeMatchIndex || curr === last){
                $select.activate();
                return false;
              }
              // Select next/last item
              else return next;
              break;
            case KEY.BACKSPACE:
              // Remove selected item and select previous/first
              if(~$selectMultiple.activeMatchIndex){
                $selectMultiple.removeChoice(curr);
                return prev;
              }
              // Select last item
              else return last;
              break;
            case KEY.DELETE:
              // Remove selected item and select next item
              if(~$selectMultiple.activeMatchIndex){
                $selectMultiple.removeChoice($selectMultiple.activeMatchIndex);
                return curr;
              }
              else return false;
          }
        }

        newIndex = getNewActiveMatchIndex();

        if(!$select.selected.length || newIndex === false) $selectMultiple.activeMatchIndex = -1;
        else $selectMultiple.activeMatchIndex = Math.min(last,Math.max(first,newIndex));

        return true;
      }

      $select.searchInput.on('blur', function() {
        $timeout(function() {
          $selectMultiple.activeMatchIndex = -1;
        });
      });

    }
  };
}]);

uis.directive('uiSelectSingle', ['$timeout','$compile', function($timeout, $compile) {
  return {
    restrict: 'EA',
    require: ['^uiSelect', '^ngModel'],
    link: function(scope, element, attrs, ctrls) {

      var $select = ctrls[0];
      var ngModel = ctrls[1];

      //From view --> model
      ngModel.$parsers.unshift(function (inputValue) {
        var locals = {},
            result;
        locals[$select.parserResult.itemName] = inputValue;
        result = $select.parserResult.modelMapper(scope, locals);
        return result;
      });

      //From model --> view
      ngModel.$formatters.unshift(function (inputValue) {
        var data = $select.parserResult.source (scope, { $select : {search:''}}), //Overwrite $search
            locals = {},
            result;
        if (data){
          var checkFnSingle = function(d){
            locals[$select.parserResult.itemName] = d;
            result = $select.parserResult.modelMapper(scope, locals);
            return result == inputValue;
          };
          //If possible pass same object stored in $select.selected
          if ($select.selected && checkFnSingle($select.selected)) {
            return $select.selected;
          }
          for (var i = data.length - 1; i >= 0; i--) {
            if (checkFnSingle(data[i])) return data[i];
          }
        }
        return inputValue;
      });

      //Update viewValue if model change
      scope.$watch('$select.selected', function(newValue) {
        if (ngModel.$viewValue !== newValue) {
          ngModel.$setViewValue(newValue);
        }
      });

      ngModel.$render = function() {
        $select.selected = ngModel.$viewValue;
      };

      scope.$on('uis:select', function (event, item) {
        $select.selected = item;
      });

      scope.$on('uis:close', function (event, skipFocusser) {
        $timeout(function(){
          $select.focusser.prop('disabled', false);
          if (!skipFocusser) $select.focusser[0].focus();
        },0,false);
      });

      scope.$on('uis:activate', function () {
        focusser.prop('disabled', true); //Will reactivate it on .close()
      });

      //Idea from: https://github.com/ivaynberg/select2/blob/79b5bf6db918d7560bdd959109b7bcfb47edaf43/select2.js#L1954
      var focusser = angular.element("<input ng-disabled='$select.disabled' class='ui-select-focusser ui-select-offscreen' type='text' id='{{ $select.focusserId }}' aria-label='{{ $select.focusserTitle }}' aria-haspopup='true' role='button' />");
      $compile(focusser)(scope);
      $select.focusser = focusser;

      //Input that will handle focus
      $select.focusInput = focusser;

      element.parent().append(focusser);
      focusser.bind("focus", function(){
        scope.$evalAsync(function(){
          $select.focus = true;
        });
      });
      focusser.bind("blur", function(){
        scope.$evalAsync(function(){
          $select.focus = false;
        });
      });
      focusser.bind("keydown", function(e){

        if (e.which === KEY.BACKSPACE) {
          e.preventDefault();
          e.stopPropagation();
          $select.select(undefined);
          scope.$apply();
          return;
        }

        if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e) || e.which === KEY.ESC) {
          return;
        }

        if (e.which == KEY.DOWN  || e.which == KEY.UP || e.which == KEY.ENTER || e.which == KEY.SPACE){
          e.preventDefault();
          e.stopPropagation();
          $select.activate();
        }

        scope.$digest();
      });

      focusser.bind("keyup input", function(e){

        if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e) || e.which === KEY.ESC || e.which == KEY.ENTER || e.which === KEY.BACKSPACE) {
          return;
        }

        $select.activate(focusser.val()); //User pressed some regular key, so we pass it to the search input
        focusser.val('');
        scope.$digest();

      });


    }
  };
}]);
/**
 * Parses "repeat" attribute.
 *
 * Taken from AngularJS ngRepeat source code
 * See https://github.com/angular/angular.js/blob/v1.2.15/src/ng/directive/ngRepeat.js#L211
 *
 * Original discussion about parsing "repeat" attribute instead of fully relying on ng-repeat:
 * https://github.com/angular-ui/ui-select/commit/5dd63ad#commitcomment-5504697
 */

uis.service('uisRepeatParser', ['uiSelectMinErr','$parse', function(uiSelectMinErr, $parse) {
  var self = this;

  /**
   * Example:
   * expression = "address in addresses | filter: {street: $select.search} track by $index"
   * itemName = "address",
   * source = "addresses | filter: {street: $select.search}",
   * trackByExp = "$index",
   */
  self.parse = function(expression) {

    var match = expression.match(/^\s*(?:([\s\S]+?)\s+as\s+)?([\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);

    if (!match) {
      throw uiSelectMinErr('iexp', "Expected expression in form of '_item_ in _collection_[ track by _id_]' but got '{0}'.",
              expression);
    }

    return {
      itemName: match[2], // (lhs) Left-hand side,
      source: $parse(match[3]),
      trackByExp: match[4],
      modelMapper: $parse(match[1] || match[2])
    };

  };

  self.getGroupNgRepeatExpression = function() {
    return '$group in $select.groups';
  };

  self.getNgRepeatExpression = function(itemName, source, trackByExp, grouped) {
    var expression = itemName + ' in ' + (grouped ? '$group.items' : source);
    if (trackByExp) {
      expression += ' track by ' + trackByExp;
    }
    return expression;
  };
}]);

}());
angular.module("ui.select").run(["$templateCache", function($templateCache) {$templateCache.put("bootstrap/choices.tpl.html","<ul class=\"ui-select-choices ui-select-choices-content ui-select-dropdown dropdown-menu\" role=\"listbox\" ng-show=\"$select.items.length > 0\"><li class=\"ui-select-choices-group\" id=\"ui-select-choices-{{ $select.generatedId }}\"><div class=\"divider\" ng-show=\"$select.isGrouped && $index > 0\"></div><div ng-show=\"$select.isGrouped\" class=\"ui-select-choices-group-label dropdown-header\" ng-bind=\"$group.name\"></div><div id=\"ui-select-choices-row-{{ $select.generatedId }}-{{$index}}\" class=\"ui-select-choices-row\" ng-class=\"{active: $select.isActive(this), disabled: $select.isDisabled(this)}\" role=\"option\"><a href=\"javascript:void(0)\" class=\"ui-select-choices-row-inner\"></a></div></li></ul>");
$templateCache.put("bootstrap/match-multiple.tpl.html","<span class=\"ui-select-match\"><span ng-repeat=\"$item in $select.selected\"><span class=\"ui-select-match-item btn btn-default btn-xs\" tabindex=\"-1\" type=\"button\" ng-disabled=\"$select.disabled\" ng-click=\"$selectMultiple.activeMatchIndex = $index;\" ng-class=\"{\'btn-primary\':$selectMultiple.activeMatchIndex === $index, \'select-locked\':$select.isLocked(this, $index)}\" ui-select-sort=\"$select.selected\"><span class=\"close ui-select-match-close\" ng-hide=\"$select.disabled\" ng-click=\"$selectMultiple.removeChoice($index)\">&nbsp;&times;</span> <span uis-transclude-append=\"\"></span></span></span></span>");
$templateCache.put("bootstrap/match.tpl.html","<div class=\"ui-select-match\" ng-hide=\"$select.searchEnabled && $select.open\" ng-disabled=\"$select.disabled\" ng-class=\"{\'btn-default-focus\':$select.focus}\"><span tabindex=\"-1\" class=\"form-control ui-select-toggle\" aria-label=\"{{ $select.baseTitle }} activate\" ng-disabled=\"$select.disabled\" ng-click=\"$select.activate()\" style=\"outline: 0;\"><span ng-show=\"$select.isEmpty()\" class=\"ui-select-placeholder\">{{$select.placeholder}}</span> <span ng-hide=\"$select.isEmpty()\" class=\"ui-select-match-text pull-left\" ng-class=\"{\'ui-select-allow-clear\': $select.allowClear && !$select.isEmpty()}\" ng-transclude=\"\"></span> <i class=\"caret pull-right\" ng-click=\"$select.toggle($event)\"></i> <a ng-show=\"$select.allowClear && !$select.isEmpty()\" aria-label=\"{{ $select.baseTitle }} clear\" style=\"margin-right: 10px\" ng-click=\"$select.clear($event)\" class=\"btn btn-xs btn-link pull-right\"><i class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></i></a></span></div>");
$templateCache.put("bootstrap/select-multiple.tpl.html","<div class=\"ui-select-container ui-select-multiple ui-select-bootstrap dropdown form-control\" ng-class=\"{open: $select.open}\"><div><div class=\"ui-select-match\"></div><input type=\"text\" autocomplete=\"off\" autocorrect=\"off\" autocapitalize=\"off\" spellcheck=\"false\" class=\"ui-select-search input-xs\" placeholder=\"{{$selectMultiple.getPlaceholder()}}\" ng-disabled=\"$select.disabled\" ng-hide=\"$select.disabled\" ng-click=\"$select.activate()\" ng-model=\"$select.search\" role=\"combobox\" aria-label=\"{{ $select.baseTitle }}\" ondrop=\"return false;\"></div><div class=\"ui-select-choices\"></div></div>");
$templateCache.put("bootstrap/select.tpl.html","<div class=\"ui-select-container ui-select-bootstrap dropdown\" ng-class=\"{open: $select.open}\"><div class=\"ui-select-match\"></div><input type=\"text\" autocomplete=\"off\" tabindex=\"-1\" aria-expanded=\"true\" aria-label=\"{{ $select.baseTitle }}\" aria-owns=\"ui-select-choices-{{ $select.generatedId }}\" aria-activedescendant=\"ui-select-choices-row-{{ $select.generatedId }}-{{ $select.activeIndex }}\" class=\"form-control ui-select-search\" placeholder=\"{{$select.placeholder}}\" ng-model=\"$select.search\" ng-show=\"$select.open\"><div class=\"ui-select-choices\"></div></div>");}]);