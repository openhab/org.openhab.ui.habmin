/**
 * angular-localization :: v1.2.0 :: 2015-03-14
 * web: https://github.com/doshprompt/angular-localization
 *
 * Copyright (c) 2015 | Rahul Doshi
 * License: MIT
 */
;(function (angular, window, document, undefined) {
    'use strict';
    angular.module('ngLocalize.Config', [])
        .value('localeConf', {
            basePath: 'languages',
            defaultLocale: 'en-US',
            sharedDictionary: 'common',
            fileExtension: '.lang.json',
            persistSelection: true,
            cookieName: 'COOKIE_LOCALE_LANG',
            observableAttrs: new RegExp('^data-(?!ng-|i18n)'),
            delimiter: '::'
        });
    angular.module('ngLocalize.Events', [])
        .constant('localeEvents', {
            resourceUpdates: 'ngLocalizeResourcesUpdated',
            localeChanges: 'ngLocalizeLocaleChanged'
        });
    angular.module('ngLocalize', ['ngSanitize', 'ngLocalize.Config', 'ngLocalize.Events', 'ngLocalize.InstalledLanguages'])
        .service('locale', ['$injector', '$http', '$q', '$log', '$rootScope', '$window', 'localeConf', 'localeEvents', 'localeSupported', 'localeFallbacks',
            function ($injector, $http, $q, $log, $rootScope, $window, localeConf, localeEvents, localeSupported, localeFallbacks) {
                var TOKEN_REGEX = new RegExp('^[\\w\\.-]+\\.[\\w\\s\\.-]+\\w(:.*)?$'),
                    currentLocale,
                    locales = [],
                    languageBundles,
                    deferrences,
                    bundles,
                    cookieStore;

                if (localeConf.persistSelection && $injector.has('$cookieStore')) {
                    cookieStore = $injector.get('$cookieStore');
                }

                function isToken(str) {
                    return (str && str.length && TOKEN_REGEX.test(str));
                }

                function getPath(tok) {
                    var path = tok ? tok.split('.') : '',
                        result = '';

                    if (path.length > 1) {
                        result = path.slice(0, -1).join('.');
                    }

                    return result;
                }

                function getKey(tok) {
                    var path = tok ? tok.split('.') : [],
                        result = '';

                    if (path.length) {
                        result = path[path.length - 1];
                    }

                    return result;
                }

                function getBundle(tok, lang) {
                    var result = null,
                        path = tok ? tok.split('.') : [],
                        i;

                    if (path.length > 1) {
                        result = languageBundles[lang];

                        for (i = 0; i < path.length - 1; i++) {
                            if (result[path[i]]) {
                                result = result[path[i]];
                            } else {
                                result = null;
                                break;
                            }
                        }
                    }

                    return result;
                }

                function loadBundle(token, lang) {
                    var path = token ? token.split('.') : '',
                        root = languageBundles[lang],
                        url = localeConf.basePath + '/' + lang,
                        i;

                    if (path.length > 1) {
                        for (i = 0; i < path.length - 1; i++) {
                            if (!root[path[i]]) {
                                root[path[i]] = {};
                            }
                            root = root[path[i]];
                            url += "/" + path[i];
                        }

                        if (!root._loading) {
                            root._loading = true;

                            url += localeConf.fileExtension;

                            $http.get(url)
                                .success(function (data) {
                                    var key,
                                        path = getPath(token);
                                    // Merge the contents of the obtained data into the stored bundle.
                                    for (key in data) {
                                        if (data.hasOwnProperty(key)) {
                                            root[key] = data[key];
                                        }
                                    }

                                    // Mark the bundle as having been "loaded".
                                    delete root._loading;

                                    // Notify anyone who cares to know about this event.
                                    $rootScope.$broadcast(localeEvents.resourceUpdates);

                                    // If we issued a Promise for this file, resolve it now.
                                    if (deferrences[path]) {
                                        deferrences[path].resolve(path);
                                    }
                                })
                                .error(function (data) {
                                    $log.error("[localizationService] Failed to load: " + url);

                                    // We can try it again later.
                                    delete root._loading;
                                });
                        }
                    }
                }

                function bundleReady(path, locale) {
                    var bundle,
                        token;

                    path = path || localeConf.langFile;
                    token = path + "._LOOKUP_";

                    bundle = getBundle(token, locale);

                    if (!deferrences[path]) {
                        deferrences[path] = $q.defer();
                    }

                    if (bundle && !bundle._loading) {
                        deferrences[path].resolve(path);
                    } else {
                        if (!bundle) {
                            loadBundle(token, locale);
                        }
                    }

                    return deferrences[path].promise;
                }

                function ready(path) {
                    var paths,
                        deferred,
                        outstanding;

                    if (angular.isString(path)) {
                        paths = path.split(',');
                    } else if (angular.isArray(path)) {
                        paths = path;
                    } else {
                        throw new Error("locale.ready requires either an Array or comma-separated list.");
                    }

                    outstanding = [];
                    if (paths.length > 1) {
                        paths.forEach(function (path) {
                            // Load all bundles that may be required by the fallback hierarchy
                            for (var i = 0; i < locales.length; i++) {
                                outstanding.push(bundleReady(path, locales[i]));
                            }
                        });
                    } else {
                        // Load all bundles that may be required by the fallback hierarchy
                        for (var i = 0; i < locales.length; i++) {
                            outstanding.push(bundleReady(path, locales[i]));
                        }
                    }

                    deferred = $q.all(outstanding);
                    return deferred;
                }

                function applySubstitutions(text, subs) {
                    var res = text,
                        firstOfKind = 0;

                    if (subs) {
                        if (angular.isArray(subs)) {
                            angular.forEach(subs, function (sub, i) {
                                res = res.replace('%' + (i + 1), sub);
                                res = res.replace('{' + (i + 1) + '}', sub);
                            });
                        } else {
                            angular.forEach(subs, function (v, k) {
                                ++firstOfKind;

                                res = res.replace('{' + k + '}', v);
                                res = res.replace('%' + k, v);
                                res = res.replace('%' + (firstOfKind), v);
                                res = res.replace('{' + (firstOfKind) + '}', v);
                            });
                        }
                    }
                    res = res.replace(/\n/g, '<br>');

                    return res;
                }

                function getLocalizedString(txt, subs) {
                    var bundle,
                        key,
                        A,
                        isValidToken = false;

                    for (var i = 0; i < locales.length; i++) {
                        var result = getStringForLocale(txt, subs, locales[i]);
                        if(result != null) {
                            return result;
                        }
                    }

                    $log.info("[localizationService] Key not found: " + txt);
                    return "%%KEY_NOT_FOUND%%";
                }

                function getStringForLocale(txt, subs, locale) {
                    var result = null,
                        bundle,
                        key,
                        A,
                        isValidToken = false;

                    if (angular.isString(txt) && !subs && txt.indexOf(localeConf.delimiter) != -1) {
                        A = txt.split(localeConf.delimiter);
                        txt = A[0];
                        subs = angular.fromJson(A[1]);
                    }

                    // If the token isn't valid, then just return it
                    isValidToken = isToken(txt);
                    if (!isValidToken) {
                        return txt;
                    }

                    if (!angular.isObject(subs)) {
                        subs = [subs];
                    }

                    // Load the file
                    bundle = getBundle(txt, locale);
                    if (bundle && !bundle._loading) {
                        key = getKey(txt);

                        if (bundle[key]) {
                            return applySubstitutions(bundle[key], subs);
                        }
                    } else {
                        if (!bundle) {
                            loadBundle(txt, locale);
                        }
                    }

                    return null;
                }

                function setLocale(value) {
                    var lang;
                    var fall;

                    if(!angular.isString(value)) {
                        lang = localeConf.defaultLocale;
                    }
                    else {
                        value = value.trim();

                        // Get the fallback first - if it's not valid, then use the default
                        if(localeSupported[localeFallbacks[value.split('-')[0]]] != null) {
                            fall = localeFallbacks[value.split('-')[0]];
                        }
                        else {
                            fall = localeConf.defaultLocale;
                        }

                        // Check if the requested locale is supported - if not, use the fallback
                        if(localeSupported[value] != null) {
                            lang = value;
                        }
                        else {
                            lang = fall;
                            fall = localeConf.defaultLocale;
                        }
                    }

                    if (languageBundles == null) {
                        languageBundles = {};
                        angular.forEach(localeSupported, function(value, key) {
                            languageBundles[key] = {};
                        });
                    }

                    if (lang != currentLocale) {
                        deferrences = {};
                        currentLocale = lang;

                        // Create the locales list.
                        locales = [];
                        if(lang != localeConf.defaultLocale) {
                            locales.push(lang);
                        }
                        if(fall != localeConf.defaultLocale) {
                            locales.push(fall);
                        }
                        locales.push(localeConf.defaultLocale);

                        $rootScope.$broadcast(localeEvents.localeChanges, currentLocale);
                        $rootScope.$broadcast(localeEvents.resourceUpdates);

                        if (cookieStore) {
                            cookieStore.put(localeConf.cookieName, lang);
                        }
                    }
                }

                function getLocale() {
                    return currentLocale;
                }

                setLocale(cookieStore ? cookieStore.get(localeConf.cookieName) : $window.navigator.userLanguage || $window.navigator.language);

                return {
                    ready: ready,
                    isToken: isToken,
                    getPath: getPath,
                    getKey: getKey,
                    setLocale: setLocale,
                    getLocale: getLocale,
                    getString: getLocalizedString
                };
            }
        ])
        .filter('i18n', ['locale',
            function (locale) {
                return function (input, args) {
                    return locale.getString(input, args);
                };
            }
        ])
        .directive('i18n', ['$sce', 'locale', 'localeEvents', 'localeConf',
            function ($sce, locale, localeEvents, localeConf) {
                function setText(elm, tag) {
                    if (tag !== elm.html()) {
                        elm.html($sce.getTrustedHtml(tag));
                    }
                }

                function update(elm, string, optArgs) {
                    if (locale.isToken(string)) {
                        locale.ready(locale.getPath(string)).then(function () {
                            setText(elm, locale.getString(string, optArgs));
                        });
                    } else {
                        setText(elm, string);
                    }
                }

                return function (scope, elm, attrs) {
                    var hasObservers;

                    attrs.$observe('i18n', function (newVal, oldVal) {
                        if (newVal && newVal != oldVal) {
                            update(elm, newVal, hasObservers);
                        }
                    });

                    angular.forEach(attrs.$attr, function (attr, normAttr) {
                        if (localeConf.observableAttrs.test(attr)) {
                            attrs.$observe(normAttr, function (newVal, oldVal) {
                                if ((newVal && newVal != oldVal) || !hasObservers || !hasObservers[normAttr]) {
                                    hasObservers = hasObservers || {};
                                    hasObservers[normAttr] = attrs[normAttr];
                                    update(elm, attrs.i18n, hasObservers);
                                }
                            });
                        }
                    });

                    scope.$on(localeEvents.resourceUpdates, function () {
                        update(elm, attrs.i18n, hasObservers);
                    });
                    scope.$on(localeEvents.localeChanges, function () {
                        update(elm, attrs.i18n, hasObservers);
                    });
                };
            }
        ])
        .directive('i18nAttr', ['locale', 'localeEvents',
            function (locale, localeEvents) {
                return function (scope, elem, attrs) {
                    var lastValues = {};

                    function updateText(target, attributes) {
                        var values = scope.$eval(attributes),
                            langFiles = [],
                            exp;

                        for(var key in values) {
                            exp = values[key];
                            if (locale.isToken(exp) && langFiles.indexOf(locale.getPath(exp)) == -1) {
                                langFiles.push(locale.getPath(exp));
                            }
                        }

                        locale.ready(langFiles).then(function () {
                            var value = '';

                            for(var key in values) {
                                exp = values[key];
                                value = locale.getString(exp);
                                if (lastValues[key] !== value) {
                                    attrs.$set(key, lastValues[key] = value);
                                }
                            }
                        });
                    }

                    attrs.$observe('i18nAttr', function (newVal, oldVal) {
                        if (newVal && newVal != oldVal) {
                            updateText(elem, newVal);
                        }
                    });

                    scope.$on(localeEvents.resourceUpdates, function () {
                        updateText(elem, attrs.i18nAttr);
                    });
                    scope.$on(localeEvents.localeChanges, function () {
                        updateText(elem, attrs.i18nAttr);
                    });
                };
            }
        ]);
    /*angular.module('ngLocalize.InstalledLanguages', [])
     .value('localeSupported', {
     'en-US': "English (United States)"
     })
     .value('localeFallbacks', {
     'en': 'en-US'
     });
     */
    angular.module('ngLocalize.InstalledLanguages', [])
        .value('localeSupported', {
            'en-US': "English (United States)",
            'aa-XX': "English (XX)",
            'aa-YY': "English (YY)"
        })

        .value('localeFallbacks', {
            'en': 'en-US',
            'aa': 'aa-XX'
        });
    angular.module('ngLocalize.Version', [])
        .constant('localeVer', '1.2.0');
})(window.angular, window, document);