# Unprunk

[![Gitlab pipeline status](https://img.shields.io/gitlab/pipeline/justinlivi/prunk.svg)](https://gitlab.com/justinlivi/prunk/pipelines)
[![Coverage Status](https://coveralls.io/repos/gitlab/justinlivi/prunk/badge.svg?branch=master&kill_cache=1)](https://coveralls.io/gitlab/justinlivi/prunk?branch=master)
[![David](https://img.shields.io/david/justinlivi/prunk.svg)](https://github.com/JustinLivi/prunk/blob/master/package.json)
[![NPM](https://img.shields.io/npm/l/unprunk.svg)](https://www.npmjs.com/package/unprunk)
[![node](https://img.shields.io/node/v/unprunk.svg)](https://github.com/JustinLivi/prunk/blob/master/package.json)
[![npm](https://img.shields.io/npm/v/unprunk.svg)](https://www.npmjs.com/package/unprunk)
[![Greenkeeper badge](https://badges.greenkeeper.io/JustinLivi/prunk.svg)](https://greenkeeper.io/)
[![npm type definitions](https://img.shields.io/npm/types/unprunk.svg)](https://github.com/JustinLivi/prunk/blob/master/package.json)

> What the funk is a prunk?

---

⚠ You are most likely viewing the `dev` branch of this repo, which is considered unstable. ⚠

- For the most recent stable release visit the [master branch](https://github.com/JustinLivi/prunk/tree/master).
- For a specific release select a tag from the branches menu.

---

# Overview

A prunk is a special type of configuration whose values can be defined either statically or as dynamic hooks.

## Why would I want to use a prunk?

Prunks are mostly useful when accepting configuration for a component or library that may externalize a large portion of business logic based on values not known at the time of configuration.
They're a sort of opt-in callback, where you can either provide a known static value, or provide a callback to defer configuration or add more complex logic.

For example, consider the following situation:

We have a library that logs a `fullName` provided by a configuration object.
In our library we first capture a `firstName` and a `lastName` via user input.
We want to provide the user of our library the flexibility to either statically configure or dynamically generate a `fullName`.

In our library we define our configuration as a prunk, and then unprunk it using the user input we captured as the prunk values:

```javascript
const logFullName = async config => {
  try {
    const userInput = await captureUserInput();
    const unprunk = unprunkWithValues(userInput);
    const unprunkedConfig = await unprunk(config);
    console.log(unprunkedConfig.fullName);
  } catch (error) {
    throw error;
  }
};
```

One user of our library statically configures the fullName:

```javascript
logFullName({
  fullName: 'John Doe'
});
```

A second user of our library dynamically configures the fullName based on the user input:

```javascript
logFullName({
  fullName: userInput => `${userInput.firstName} ${userInput.lastName}`
});
```

A third user asyncronously fetches a fullName based on the user input:

```javascript
logFullName({
  fullName: userInput =>
    fetchUserInfo(userInput).then(userInfo => userInfo.fullName)
});
```

Our library seamlessly handles all the different configurations without any situtational code on our part.

# Installation

`npm i -s unprunk`

Both typescript and javascript support come out of the box.

# Basic Usage

## Async API

```javascript
import { unprunk } from 'unprunk';

unprunk('stateValue', {
  value: stateVal => stateVal
}).then(res => {
  // { value: 'stateValue' }
  console.log(res);
});
```

Curried API:

```javascript
import { unprunkWithValues } from 'unprunk';

const unprunk = unprunkWithValues('stateValue');
unprunk({
  value: stateVal => stateVal
}).then(res => {
  // { value: 'stateValue' }
  console.log(res);
});
```

## Synchronous API

```javascript
import { unprunkSync } from 'unprunk';

const res = unprunkSync('stateValue', {
  value: stateVal => stateVal
});
console.log(res);
```

Curried API:

```javascript
import { unprunkWithValuesSync } from 'unprunk';

const unprunk = unprunkWithValuesSync('stateValue');
const res = unprunk({
  value: stateVal => stateVal
});
console.log(res);
```

# Advanced example:

```javascript
import { unprunkWithValues } from 'unprunk';

// values our functional prunks should expect
const values = { value2: 'value2', value3: 'value3' };
// unprunk is a function which will do the actual unprunking
// unprunk will always return a Promise which will resolve with result
const unprunk = unprunkWithValues(values);
unprunk({
  value1: Promise.resolve('value1'),
  value2: Promise.resolve([
    false,
    Promise.resolve(true),
    ({ value2 }) => Promise.resolve(value2)
  ]),
  value3: Promise.resolve({
    nested: ({ value3 }) => value3
  })
}).then(res => {
  /**
   * {
   *   value1: 'value1',
   *   value2: [false, true, 'value2'],
   *   value3: {
   *     nested: 'value3'
   *   }
   * }
   */
  console.log(res);
});
```

# Types Definitions

An async prunk is defined as the intersection of the following:

- a Result
- a function which accepts Values and returns a Result
- a function which accepts Values and returns a Promise which resolves with a Result
- a Promise which resolves with a Result
- a Map of keys and Prunks

In typescript that looks like the following:

```typescript
export type PrunkFunc<Values, Result> = (
  values: Values
) => Result | Promise<Result>;

export interface PrunkMap<Values, MapType, Key extends keyof MapType>
  extends Map<Key, Prunk<Values, MapType[Key]>> {}

// the main Prunk type
export type Prunk<Values, Result> =
  | PrunkFunc<Values, Result>
  | Promise<Result>
  | PrunkMap<Values, Result, keyof Result>
  | Result;
```

An synchronous prunk is defined as the intersection of the following:

- a Result
- a function which accepts Values and returns a Result
- a Map of keys and Prunks

In typescript that looks like the following:

```typescript
export type PrunkFuncSync<Values, Result> = (
  values: Values
) => Result | Promise<Result>;

export interface PrunkMapSync<Values, MapType, Key extends keyof MapType>
  extends Map<Key, PrunkSync<Values, MapType[Key]>> {}

// the main Prunk type
export type PrunkSync<Values, Result> =
  | PrunkFuncSync<Values, Result>
  | PrunkMapSync<Values, Result, keyof Result>
  | Result;
```

# Why the name Prunk?

properties/promise + func/thunk = prunk

# License

Licensed under [MIT](https://github.com/JustinLivi/prunk/blob/master/LICENSE)
