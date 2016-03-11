# angular-promise-extras

[![build status](https://circleci.com/gh/ohjames/angular-promise-extras.png)](https://circleci.com/gh/ohjames/angular-promise-extras)

## Installation

1. Install the package
    ```
    bower install --save angular-promise-extras
    ```

2. Add the bower source file to your web page.
3. Add the angular module `ngPromiseExtras` as a dependency of your application module.

## Usage

```javascript
var deferreds = [ $q.defer(), $q.defer() ]
var asyncVals = deferreds.map(function(deferred) {
  return deferred.promise
})
asyncVals.push(3)

$q.allSettled(asyncVals).then(function(values) {
  expect(values).toEqual([
    { state: 'fulfilled', value: 1 },
    { state: 'rejected', reason: 2 },
    { state: 'fulfilled', value: 3 },
  ])
})

deferreds[0].resolve(1)
deferreds[1].reject(2)
```

Also works with objects:

```javascript
var deferreds = [ $q.defer(), $q.defer() ]
var promisesArray = deferreds.map(function(deferred) {
  return deferred.promise
})
var promises = { a: promisesArray[0], b: promisesArray[1], c: 3  }

$q.allSettled(promises).then(function(values) {
  expect(values).toEqual({
    a: { state: 'fulfilled', value: 1 },
    b: { state: 'rejected', reason: 2 },
    c: { state: 'fulfilled', value: 3 },
  })
})

deferreds[0].resolve(1)
deferreds[1].reject(2)
```

Also provides
  * `$q.map`: works like `Bluebird.map` or `Bluebird.props` depending on whether an array or an object is passed.
  * `$q.mapSettled`: Works like `$q.map` but with the settled semantics.
  * `$q.resolve`: Works like `Bluebird.resolve`.
