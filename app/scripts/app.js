/**
 * HABmin Home Automation GUI for OpenHAB
 *
 * (c) 2014 Chris Jackson
 *
 */

var HABmin = window.HABmin = Ember.Application.create({
    LOG_TRANSITIONS:          true,
    LOG_TRANSITIONS_INTERNAL: true
});

HABmin.Model = RestModel.extend().reopenClass({
    namespace: '',
    getBeforeSend: function(options) {
        return function(jqXHR) {
//            jqXHR.setRequestHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//            jqXHR.setRequestHeader('Access-Control-Allow-Origin', '*');
//            jqXHR.setRequestHeader('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        }
    }
});

CLDR.defaultLocale = 'en';

/* Order and include as you please. */
require('scripts/controllers/*');
require('scripts/languages/*');
require('scripts/stores/*');
require('scripts/models/*');
require('scripts/routes/*');
require('scripts/components/*');
require('scripts/views/*');
require('scripts/router');

