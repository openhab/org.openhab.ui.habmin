/**
 * DynamicForms - Build Forms in AngularJS From Nothing But JSON
 * @version v0.0.2 - 2014-04-29
 * @link http://bitbucket.org/danhunsaker/angular-dynamic-forms
 * @license MIT, http://opensource.org/licenses/MIT
 */

/**
 * Dynamically build an HTML form using a JSON object as a template.
 *
 * @param {Object} [template] - The form template itself, as an object.
 * @param {string} [templateUrl] - The URL to retrieve the form template from; template overrides.
 * @param {mixed} ngModel - An object in the current scope where the form data should be stored.
 * @example <dynamic-form template-url="form-template.js" ng-model="formData"></dynamic-form>
 */
angular.module('Binding.config', [
])
    .directive('bindingConfig',
    function ($q, $parse, $compile, $document, $timeout) {
        return {
            restrict: 'E', // supports using directive as element only
            scope: {
                template: "@"
            },
            link: function ($scope, element, attrs) {
                //  Basic initialization
                var newElement = null,
                    newChild = null,
                    newInput = null,
                    newOption = null,
                    model = null;

                //  Check that the required attributes are in place
                if (angular.isDefined(attrs.ngModel) &&
                    angular.isDefined(attrs.template) && !element.hasClass('dynamic-form')) {
                    model = $parse(attrs.ngModel)($scope);

                    var buildFields = function (field, id) {
                        newElement = angular.element('<div></div>');
                        newElement.attr('class', 'form-group');

                        newChild = angular.element('<label></label>');
                        angular.element(newChild).html(field.label);
                        newChild.attr('for', field.name);
                        newChild.attr('class', 'control-label');
                        newElement.append(newChild);

                        newChild = angular.element('<div></div>');
                        if(field.pending === true) {
                            newChild.attr('class', 'has-warning has-feedback');
                        }
                        newChild.attr('class', 'has-feedback');

                        switch(field.type) {
                            case "BYTE":
                            case "SHORT":
                                newInput = angular.element('<input>');
                                newInput.attr('id', field.name);
                                newInput.attr('type', 'number');
                                newInput.attr('class', 'form-control');
                                newInput.attr('value', field.value);
                                break;
                            case "LIST":
                                newInput = angular.element('<select></select>');
                                newInput.attr('id', field.name);
                                newInput.attr('class', 'form-control');
                                if(field.value === undefined) {
                                    newOption = angular.element('<option></option>');
                                    newOption.attr('value', "");
                                    newOption.attr('selected');
                                    newOption.attr('disabled');
                                    newOption.attr('hidden');
                                    newInput.append(newOption);
                                }
                                angular.forEach(field.valuelist.entry, function(value){
                                    newOption = angular.element('<option></option>');
                                    newOption.attr('value', value.key);
                                    angular.element(newOption).html(value.value);
                                    if(field.value == value.key) {
                                        newOption.attr('selected');
                                    }
                                    newInput.append(newOption);
                                });
                                break;
                            default:
                                newInput = angular.element('<input>');
                                newInput.attr('id', field.name);
                                newInput.attr('type', 'text');
                                newInput.attr('class', 'form-control');
                                newInput.attr('value', field.value);
                                break;
                        }
                        if(newInput !== null) {
                            if(field.readonly == "true") {
                                newInput.attr('readonly', 'true');
                            }

                            // Add a feedback box.
                            // We'll use this for pending attributes
                            newChild.append(newInput);
                            newInput = angular.element('<span></span>');
                            newInput.attr('class', 'fa form-control-feedback');
//                            newInput.attr('class', 'fa fa-question-circle form-control-feedback');
                            newChild.append(newInput);

                            newElement.append(newChild);
                        }
                        this.append(newElement);
                    };

                    $scope.$watch("template", function (template) {
                        element.empty();

                        var jsonTemplate = angular.fromJson(template);
                        angular.forEach(jsonTemplate, buildFields, element);

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
            }
        };
    })
;
