/*! angular-breadcrumb - v0.1.0 - 2014-02-19
 * https://github.com/ncuillery/angular-breadcrumb
 * Copyright (c) 2014 Nicolas Cuillery; Licensed MIT
 *
 * Enhancement By Sujay Bhowmick:
 * Converted breadcrumb to anchor links allowing navigation through pages.
 * */


 angular.module('ncy-angular-breadcrumb', ['ui.router'])
    .provider('$breadcrumb', function() {

        var options = {};

        this.setPrefixState = function(prefixStateName) {
            options.prefixStateName = prefixStateName;
        };

        var _pushNonexistentState = function(array, state) {
            var stateAlreadyInArray = false;
            angular.forEach(array, function(value) {
                if(!stateAlreadyInArray && angular.equals(value, state)) {
                    stateAlreadyInArray = true;
                }
            });
            if(!stateAlreadyInArray) {
                array.push(state);
            }
            return stateAlreadyInArray;
        };

        this.$get = ['$state', function($state) {

            return {
                getStatesChain : function() {
                    var chain = [];

                    // Prefix state
                    if(options.prefixStateName) {
                        var prefixState = $state.get(options.prefixStateName);
                        if(prefixState) {
                            _pushNonexistentState(chain, prefixState);
                        } else {
                            throw 'Bad configuration : prefixState "' + options.prefixStateName + '" unknown';
                        }
                    }

                    angular.forEach($state.$current.path, function(value) {
                        _pushNonexistentState(chain, value.self);
                    });

                    return chain;
                },
                convertStateToUrl: function(stateName){
                    return stateName.replace(".", "/");
                },
                buildBreadCrumbMarkUp: function(stateObject){
                    var  breadCrumb = '',
                        openLi = '<li>',
                        closeLi = '</li>',
                        openAnchor = '<a href="#',
                        partialCloseAnchor = '">',
                        closeAnchor = '</a>';
                    for (var key in stateObject) {
                        if (stateObject.hasOwnProperty(key)) {
                            breadCrumb += openLi;
                            if(stateObject[key].abstract){
                                breadCrumb += key;
                            }else {
                                breadCrumb += openAnchor;
                                breadCrumb += this.convertStateToUrl(stateObject[key].name);
                                breadCrumb += partialCloseAnchor;
                                breadCrumb += key;
                                breadCrumb += closeAnchor
                            }
                            breadCrumb += closeLi;
                        }
                    }
                    return breadCrumb;
                }

            };

        }];

    })
    .directive('ncyBreadcrumb', function($state, $breadcrumb) {

        return function(scope, element) {

            scope.$watch(function() { return $state.current; }, function() {
                var chain = $breadcrumb.getStatesChain(),
                    stateObject = {};

                angular.forEach(chain, function(value) {
                    if(value.data && value.data.ncyBreadcrumbLabel) {
                        stateObject[value.data.ncyBreadcrumbLabel] = value;
                    } else {
                        stateObject[value.name] = value;
                    }
                });
                element.html($breadcrumb.buildBreadCrumbMarkUp(stateObject));
            }, true);

        };
    });
