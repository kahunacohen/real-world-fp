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

We can obviously debug individual functions that we wrote (e.g. `JSONToTable`) by putting calls to `console` or breakpoints
in the body of those functions. But what if we want to debug in a clearer way between functions in the pipeline?

What we need is a function that calls `console` and then simply returns what's passed to it for input to the next function in the chain. [Ramda](https://ramdajs.com/) has a utility function for this called [`tap`](https://ramdajs.com/docs/#tap) that does just this (among other things). So for quick debugging we can stick `tap` in the middle of our pipeline. For example, if we want
to examine what the data looks like before it's passed to `JSONToTable` we can do this:

```js
const { tap ... } = require("ramda"); // leaving out other imports for brevity.
...
const employeesToTable = compose(
  JSONToTable,
  **tap(x => console.log(x))**,
  sortByLastName,
  filter(employee => employee.active),
  JSON.parse,
  censor
);
```

It's a bit more problematic to put breakpoints in the midst of a composition, but you can always break within an individual
function in the composition. This is impossible in the filtering function above (`filter(employee => employee.active)`). But
if a component part of a composition proves too difficult to debug, break it out into a separate, named function so you can
insert breakpoints.
