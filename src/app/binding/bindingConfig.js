/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copyright of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('Binding.config', [
    'angular-bootstrap-select'
])
    .directive('bindingConfig',
    function ($q, $parse, $compile, $document, $timeout) {
        return {
            restrict: 'E', // supports using directive as element only
            scope: {
                template: "@",
                bindingChange: "="//,
//                models: "&"
            },
            link: function ($scope, element, attrs) {
                // Basic initialization
                var newElement = null,
                    newChild = null,
                    newInput = null,
                    newOption = null;

                var buildFields = function (field, id) {
                    newElement = angular.element('<div></div>');
                    newElement.attr('class', 'form-group');

                    newChild = angular.element('<label></label>');
                    newChild.attr('for', field.name);
                    newChild.attr('class', 'control-label');
                    angular.element(newChild).html(field.label);
                    newElement.append(newChild);

/*                    newChild = angular.element('<span></span>');
                    newChild.attr('class', 'pull-right label label-warning status_pending');
//                    newChild.attr('ng-show', 'models.' + field.name + '_pending==true');
                    angular.element(newChild).html("");
                    newElement.append(newChild);*/

                    newChild = angular.element('<span></span>');
                    newChild.attr('class', 'pull-right label label-warning status_pending');
//                    newChild.attr('ng-show', 'models.' + field.name + '_pending==true');
                    angular.element(newChild).html("update pending...");
                    newElement.append(newChild);

                    newChild = angular.element('<div></div>');

                    switch (field.type) {
                        case "BYTE":
                        case "SHORT":
                            newInput = angular.element('<input>');
                            newInput.attr('id', field.name);
                            newInput.attr('type', 'number');
                            newInput.attr('class', 'form-control');
                            if (field.value !== undefined) {
                                field.value = parseInt(field.value, 10);
                            }
                            else {
                                field.value = "";
                            }
                            break;
                        case "LIST":
                            newInput = angular.element('<select></select>');
                            newInput.attr('id', field.name);
                            newInput.attr('selectpicker', "");
                            newInput.attr('class', 'form-control');
                            if (field.value === undefined) {
                                newOption = angular.element('<option></option>');
                                newOption.attr('value', "");
                                newOption.attr('selected');
                                newOption.attr('disabled');
                                newOption.attr('hidden');
                                newInput.append(newOption);
                            }
                            angular.forEach(field.valuelist.entry, function (value) {
                                newOption = angular.element('<option></option>');
                                newOption.attr('value', value.key);
                                angular.element(newOption).html(value.value);
                                //        if(field.value == value.key) {
                                //          newOption.attr('selected');
                                //    }
                                newInput.append(newOption);
                            });
                            break;
                        default:
                            newInput = angular.element('<input>');
                            newInput.attr('id', field.name);
                            newInput.attr('type', 'text');
                            newInput.attr('class', 'form-control');
                            break;
                    }
                    if (newInput !== null) {
                        if (field.readonly == "true") {
                            newInput.attr('readonly', 'true');
                        }

                        $scope.models[field.name] = field.value;

                        newInput.attr('ng-model', 'models.' + field.name);

                        if(attrs.bindingChange !== undefined) {
//                            newInput.attr('ng-change', attrs.bindingChange);
                        }
                        newInput.attr('ng-change', 'changeHandler("'+ field.domain + '")');

                        // Add a feedback box.
                        // We'll use this for pending attributes
                        newChild.append(newInput);
                        newElement.append(newChild);
                    }
                    this.append(newElement);
                };

                $scope.changeHandler = function (domain) {
                    console.log("changeHandler", domain);
                    if($scope.bindingChange !== undefined) {
                        $scope.bindingChange(domain);
                    }
                };

                $scope.$watch("template", function (template) {
                    element.empty();
                    if(template == null || template.length === 0) {
                        return;
                    }
                    console.log("New template:", template);

                    $scope.models = {};
                    try {
                        var jsonTemplate = [].concat(angular.fromJson(template));
                        console.log("Update template", jsonTemplate);
                        angular.forEach(jsonTemplate, buildFields, element);
                    }
                    catch (err) {
                        console.log("Error parsing JSON", template, err);
                        element.empty();
                        return;
                    }

                    newElement = angular.element("<form></form>");
                    newElement.attr('class', "panel-form form-horizontal");
                    newElement.attr('role', "form");
                    newElement.attr('model', attrs.ngModel);
                    newElement.removeAttr('ng-model');

                    angular.forEach(element[0].classList, function (clsName) {
                        newElement[0].classList.add(clsName);
                    });
                    newElement.addClass('dynamic-form');
                    newElement.append(element.contents());

                    // Compile and update DOM
                    element.empty();
                    $compile(newElement)($scope).appendTo(element);
                });
            }
        };
    })
;
