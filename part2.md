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
