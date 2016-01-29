# angular-input-modified changelog

## Version 2.2.5
(30 Jul 2015)

- Added mechanism for model's value stabilization.
  This is required for some directives like Angular UI TinyMCE.
  Also, see [this issue](https://github.com/angular-ui/ui-tinymce/issues/156)


## Version 2.2.0
(02 May 2015)

- Addition of the modifiable behavior now can be fully controlled via `bsModifiable` directive


## Version 2.1.0
(27 April 2015)

- Nested forms are now fully-supported
- Improved internal design and performance of the library


## Version 2.0.5
(27 April 2015)

- Fixed an issue where elements were used without a parent form


## Version 2.0.4
(24 April 2015)

- Fixed Angular annotations (all files in `dist` directory is now properly annotated)


## Version 2.0.3
(19 April 2015)

- Module split into several smaller files for ease of development


## Version 2.0.2
(23 January 2015)

- Directive is now attached by `ngModel` attribute
- Added `webserver` task to the `gulpfile` to [run demos locally][readme-faq-local-demos]
- Added [form initialization][readme-form-init] section to the [README][readme]
- Added [delayed initialization demo][demo-delayed-init]


## Version 2.0.1
(04 January 2015)

- [\#7][issue-7]: "Array and object models are not compared using deep comparison"
  (thanks to [Vaibhav][user-vaibhavguptaIITD]).
  `angular.equals()` method is now used to deeply compare objects

- Added [demo][demo-select-multiple] for select field with `multiple` option


## Version 2.0.0
(04 January 2015)


### Backward-incompatible changes

The following public-properties of the form controller are no longer considered public,
you should not relay on them, cause their behavior can change in the future:

- `ngForm.modifiedCount` - can show a bigger number now, cause it indicates all modified input elements (including all radio buttons)
- `ngForm.modifiedModels` - now contains list of references to the modified models instead of just model names

If you still need this functionality - please [create an issue][new-issue] to discuss this.

Also, form initialization strategy has changed - please see the
[Form initialization][readme-form-init]
section of the [README][readme].


### Changes

- [\#8][issue-8]: "Doesn't work when bound object member isn't set"
  (thanks to [Chris Yates][user-cyates81]).
  We are now using a more robust way to initialize master value (initialization flag)

- [\#5][issue-5]: "Issues with ng-repeat"
  (thanks to [@prudd][user-prudd]).
  We are now storing a list of references to the modified model controllers instead of their names

- Updated all demos
- All dependencies for demos are now included with *Bower*
- Added [`ngRepeat` example][demo-ng-repeat] to the repository
- Updated [README][readme]


## Version 1.2.0
(12 November 2014)

- [\#4][issue-4]: "Doesn't work with Ui-Bootstrap's Timepicker"
  (thanks to [@prudd][user-prudd])

- [\#2][issue-2]: "Fixed *ngModel* existence check".
  Issue revisited.
  Implemented general solution for both `1.2.x` and `1.3.x` branches of AngularJS

- Added configuration provider
- Introduced ability to disable directive globally
- Introduced ability to enable directive only for specific elements or forms
- CSS classes are now configurable
- Added demos to the repository
- Added *Gulp* task to deploy demos to *GitHub Pages*
- Updated [README][readme]


## Version 1.1.6
(10 November 2014)

- [\#2][issue-2]: "Fixed *ngModel* existence check"
  (thanks to [@atte-backman][user-atte-backman])

- [\#3][issue-3]: "Crashes if model property does not exists when eval() in reset function"
  (thanks to [@kornalius][user-kornalius]).
  Fixed a problem when *ngModel* pointing to a missing variable will cause exception when input is reset

- Done some minor refactoring
- Updated Demo Plunk


## Version 1.1.5
(29 October 2014)

- AngularJS 1.3 is now tested and supported
- Updated Demo plunk


## Version 1.1.4
(25 October 2014)

- Removed unused `gulp-clean` dependency
- Fixed an issue where form modification state will not be properly updated after a call to form's `$setPristine()` method


## Version 1.1.3
(13 October 2014)

- Done some serious refactoring.
  Low-level details moved to a separate functions, so the main logic became more abstract and readable.
  Performance and memory footprint should also improve

- Fixed bug when empty element would not recover it's master value when reset is invoked on the parent form
- Introduced distribution files (normal and minified versions) and a proper build process using **Gulp**
- Improved [README][readme]


## Version 1.1.2
(13 October 2014)

- Updated README (no code changes)
- Added new Demo via **Plunker**


## Version 1.1.1
(08 October 2014)

- Updated versioning (no code changes)


## Version 1.1.0
(30 May 2014)

- Improved initialization code
- Updated comparison function to allow more weak comparison like `"1"` (string) and `1` (integer)
- Fixed bug with `$setPristine` method, now it should work correctly in all cases
- Improved modification tracking
- Added property `ngForm.modifiedModels` (list of names for modified models)
- Demo updated


## Version 1.0.0
(18 May 2014)

- Public API stabilized


  <!-- *** LINKS *** -->

  [readme]: readme.md
  [new-issue]: https://github.com/betsol/angular-input-modified/issues/new

  <!-- Demos -->

  [demo-ng-repeat]:       http://betsol.github.io/angular-input-modified/ng-repeat/
  [demo-select-multiple]: http://betsol.github.io/angular-input-modified/select-multiple/
  [demo-delayed-init]:    http://betsol.github.io/angular-input-modified/delayed-init/

  <!-- Issues -->

  [issue-2]: https://github.com/betsol/angular-input-modified/pull/2
  [issue-3]: https://github.com/betsol/angular-input-modified/issues/3
  [issue-4]: https://github.com/betsol/angular-input-modified/issues/4
  [issue-5]: https://github.com/betsol/angular-input-modified/issues/5
  [issue-7]: https://github.com/betsol/angular-input-modified/issues/7
  [issue-8]: https://github.com/betsol/angular-input-modified/issues/8

  <!-- Users -->

  [user-atte-backman]: https://github.com/atte-backman
  [user-kornalius]: https://github.com/kornalius
  [user-prudd]: https://github.com/prudd
  [user-cyates81]: https://github.com/cyates81
  [user-vaibhavguptaIITD]: https://github.com/vaibhavguptaIITD

  [readme-form-init]: readme.md#form-initialization
  [readme-faq-local-demos]: readme.md#how-do-i-access-demos-locally
