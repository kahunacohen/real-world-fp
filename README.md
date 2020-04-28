# Integrating Functional Programming into Existing Web App Code Bases

In this post I'll discuss what functional programming (fp) is, why we'd want to use it and how to integrate this style into a real-world, existing project written mainly in a procedural and/or object-oriented style.

## What is Functional Programming?
With the popularity of frameworks such as [ReactJs](https://reactjs.org/) and [RxJS](https://rxjs-dev.firebaseapp.com/) fp is getting a lot of exposure in the JavaScript community. But what is it and how can our programs from it? Though the paradigm can get obtruse and academic, its principles are really quite basic. 

Fp is a way to solve larger problems by fitting together small, focused, *pure* functions, preferring pure functions and immutable data structures over side-effects, stateful objects and mutable data. A program written in an fp style tends to read more like a spec rather than a step-by-step recipe.  

First, what are *pure* functions? Pure functions are simply functions that given an input *x*, always return the same output *y*. Additionally, a pure function performs no side-effects (such as writing to the screen, writing or reading a file, opening a network connection etc.). 

Here's an [example](src/add-rows-procedural/index.test.js) of a typical imperative, impure function that reads arbitrary numbers on each line from a CSV file and sums all the lines. The input file might look something like this:

```
1,2
100,0
1,1
```
Given this input, the following function would return `105`:

```js
const fs = require("fs");

function addData(path) {
  let ret = 0;
  const data = fs.readFileSync(path, { encoding: "utf8" });
  for (const line of data.split("\n")) {
    const [x, y] = line.split(",");
    ret += parseInt(x) + parseInt(y);
  }
  return ret;
}
```

This function is *not* pure because it performs side effects, namely reading data from the file-system. The function's return value isn't soley dependent on its parameters. What if the file specified by `path` isn't there, or the file doesn't have read permissions? What if someone changes the content in the file specified by `path`? Additionally, the function is imperative. It reads like point-by-point directions on how to get from a file path to a sum. And lastly, it mutates its local data. The return value `ret` is changed in-place inside the `for` loop.

So, how do we make `addRows` more "functional"? Let's start with *walling off* the state, which in this case is the state of the file on the file system. Let's relegate the side effect of reading the file to our function's caller and focus just on parsing the CSV text. Let's also get rid of manually managing a for loop, and while we're at it, let's get rid of the mutable data:

```js
const addData = s =>
  s.split("\n").reduce((acc, line) => {
    const [x, y] = line.split(",");
    return acc + (parseInt(x) + parseInt(y));
  }, 0);
```

[Here](src/add-rows-functional/index.test.js) we pass the CSV text as a string to the function and [reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) the string to the end-data, which in our case is the sum of each line. JavaScript's `reduce` function takes a callback function which in-turn takes an accumulator and the current value and *reduces* the array to one value. 

Functions like `reduce`, `forEach`, `map`, `filter` etc. are called
*higher order functions* (or HOFs), because they take functions as parameters. They are crucial in a functional programmer's toolbox, because they help avoid manual state management and are general enough to be useful regardless of the input's type. 
