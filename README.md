# Introducing a Functional Programming Paradigm to Existing Web App Code Bases

In this post I'll briefly discuss what functional programming is, the advantages we can reap from programming in this style and how to integrate elements of functional programming in a real-world, existing project that is generally written in a procedural and/or object-oriented style.


Functional programming is a paradigm wherein we solve larger problems by fitting together (or composing) small, focused, pure functions into a broader whole. Though the paradigm can get very academic, it boils down to the use of pure functions and immutable data structures over stateful objects and mutable data. The ideal result is more of a description of how to achieve the goal, rather than a step-by-step recipe how to get there.  

First, what are pure functions? Pure functions are simply functions that given an input x, always return the same output y. Additionally, a pure function performs no side-effects (such as writing to the screen, writing or reading a file, opening a network connection etc.)  in the process of calculating y. 

Here's an example of a typical imperative, impure function that reads number pairs from a CSV file and sums the lines:

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

This function is not pure because it performs side effects--reading data from the file-system. What if the file isn't there, or the file doesn't have the right permissions? What if someone changes the content in the file specified by `path`? The function isn't guarenteed to return the same result given the same file path input. It depends on factors external to the function.

Also note, that it's imperative, meaning reading the function reads like a recipe of how to achieve the specific goal instead of a specification.
