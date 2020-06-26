# Functional Programming for Beginners (part 2)
In [Part 1](part1.md) of this series we discussed the basics of fp:

1. pure functions over side-effects
1. immutability over mutability
1. composition over inheritance

...and showed how adhering to these principles can make your programs more concise, easier to reason about and easier to test.

However, we glossed over some important things including:

1. How to debug compositions.
1. Currying/partial application
1. Managing exceptional cases

In this post, we'll try to address these three issues in some more detail.

## Debugging Compositions
Let's revisit the functions we wrote in [part1](part1.md). For the sake of brevity, we'll omit the imports and the functions `JSONToTable` and `sortByLastName`:

```js
...
const employeesToTable = compose(
  JSONToTable,
  sortByLastName,
  filter(employee => employee.active),
  JSON.parse,
  censor
);

employeesToCSV = compose(join("\n"), employeesToTable);
employeesToHTML = compose(toHTML, employeesToTable);
```

We can debug named functions that we wrote (e.g. `JSONToTable`) by putting calls to `console` or breakpoints
in the body of those functions. But what if we want to debug in a clearer way between functions in the pipeline?

What we need is a function that calls `console` and then simply returns what's passed to it for input to the next function in the chain. [Ramda](https://ramdajs.com/) has a utility function for this called [`tap`](https://ramdajs.com/docs/#tap) that does just this (among other things). So for quick debugging we can stick `tap` in the middle of our pipeline. For example, if we want
to examine what the data looks like before it's passed to `JSONToTable` we can do this:

```js
const { tap ... } = require("ramda"); // leaving out other imports for brevity.
...
const employeesToTable = compose(
  JSONToTable,
  tap(x => console.log(x)),
  sortByLastName,
  filter(employee => employee.active),
  JSON.parse,
  censor
);
```

It's a bit more problematic to put breakpoints in the midst of a composition, but you can always break within an individual
function in the composition. This is impossible in the filtering function above (`filter(employee => employee.active)`). But
if a component part of a composition proves too difficult to debug, factor it out into a separate, named function so you can
insert breakpoints. Regardless of the programming paradigm this is good practice. Reserve inline functions for no-brainers.

## Currying

In the last post we briefly mentioned currying/partial application in the context of using Ramda for compositions. Let's discuss in more detail currying as it is
central to fp and makes function composition possible. The classic explanation is a `sum` function:

```js
// Not curried.
const sum = (x, y) => x + y;
```

Here's a curried version. When we pass only `x` it will return a *function* that adds `x` to y:

```js
const sum = (x, y) => y => x + y

// sum(x) returns a function that then accepts y:
const add3 = sum(3);

// call it!
add3(6); // 9
```

Apart from allowing compositions, currying allows us to easily  preload functions, or create lots of slight variations on base functions. In the case of the composition from the previous post we imported an already curried filter function, preloaded the filter function with the callback by passing it an anonymous function in the composition. This gave us a function that receives the rest of the arguments (in this case the array), then passes the return value to the next function in the composition. 

Recall that `f` receives a JSON string, parses it and filters for active employees:

```js
const { compose, filter } from "ramda";

...
const f = compose(
  filter(employee => employee.active),
  JSON.parse,
  ...
);
```

Libraries like Ramda usually export functions that are already curried, but when writing your own functions which you intend on composing with other functions
you will sometimes need to curry for yourself, which is why Ramda exports a `curry` function that will curry any function regardless of how many arguments the
function takes:

```js
const _sum = (x, y) => x + y;
_sum(1, 3)
4

_sum(1);
NaN // because 1 + undefined is Nan.

const sum = R.curry(_sum); // Here R is an import of Ramda

// Calling with less args now returns a function ready for the next argument
sum(1);
ƒ (a0, a1) { return fn.apply(this, arguments); } 

sum(1)(3)
4

const addOne = sum(1);
addOne(3)
4
```

Summing numbers is fine and dandy, but let's apply this to real workd programming. Let's say our `sortByLastName` function
needs to be more flexible because we are asked to produce different reports, one sorted by last name descending and one sorted ascending. So, let's parameterize
it:

```js
const sortByLastName2 = (xs, order) => {
  // Ignore case of order being undefined.
  return xs.sort((firstEl, secondEl) => {
    if (firstEl.lastName < secondEl.lastName) {
      return order === "desc" ? -1 : 1;
    }
    if (firstEl.lastName > secondEl.lastName) {
      return order === "desc" ? 1 : -1;
    }
    return 0;
  });
};

// Call it like this:
sortByLastName2(
  [{ lastName: "B" }, { lastName: "A" }, { lastName: "C" }],
    "asc"
); 
// [{lastName: "C"}, {lastName: "B"}, {lastName: "A"}]

```

This works in isolation, but in our composition it doesn't:

```js
...
const employeesToTable = compose(
  JSONToTable,
  sortByLastName2("desc"),
  filter(employee => employee.active),
  JSON.parse,
  censor
);
TypeError: xs.sort is not a function
```

Why does this cause an error?

Because `sortByLastName2` thinks that its `xs` parameter (the array of employees) is "asc", given that `xs` is the first argument in its signature.
`filter` is passing `sortByLastName2` the filtered array, but we are passing "asc" to`sortByLastName1`, so "asc" is overwriting the employee data. Because
"asc" does not have a `sort` function on its prototype JavaScript throws an error.

If we change the signature of `sortByLastName1`, so that the array is the last parameter, we'll have a similar problem: `TypeError: Cannot read property 'sort' of undefined`. Why? Because when we invoke `sortByLastName3` within the composition by passing the "desc" argument, that's it...the function is called with only one parameter--the `order` argument. `xs`. is `undefined` and we can't call `sort` on `undefined`.

What we need is a function that when passed the `order` argument, we'll get a function back that accepts the next argument: `xs`. That is exactly what currying accomplishes for us.

