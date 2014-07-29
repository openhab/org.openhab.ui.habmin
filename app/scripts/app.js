var HABmin = window.HABmin = Ember.Application.create();

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

