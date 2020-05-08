# Functional Programming for Smarties

This piece is aimed for intermediate JavaScript programmers, and/or those with limited functional programming experience. I'll discuss the basics of functional programming (fp) is, why to use it and how to integrate it into a real-world code base.

## What is Functional Programming?
With the popularity of frameworks and libraries, such as [ReactJs](https://reactjs.org/) and [RxJS](https://rxjs-dev.firebaseapp.com/), fp is has gotten lot of attention in the JavaScript community. Though fp can be complex subject, its main prinicples are actually quite simple and useful in day-to-day programming. In this post we'll focus on these main charateristics of fp:

1. Purity over side effects 
1. Immutablity over mutability
1. Composition over inheritance

To illustrate these points we'll implement a typical programming task in a an object-oriented, procedural style and then transform it to a functional style. Of course one blog post is insufficient to teach all of fp, so our working example will be somewhat contrived in order to quickly illustrate the essence of what we are trying to achieve when using fp.

## A Procedural Example
Ready? Let's go. Imagine data in a JSON file representing salary information for employees over a year:

```json
[
  {
    "firstName": "John",
    "lastName": "Doe",
    "payments": [
      8333.33,
      8333.33,
      8333.33,
      8021.45,
      7023,
      9023.67,
      8333.33,
      8333.33,
      8333.33,
      6500,
      8333.33,
      8333.33
    ]
  },
  {
    "firstName": "Mary",
    "lastName": "Jane",
    "payments": [
      12083.33,
      12083.33,
      12083.33,
      11000,
      12102.24,
      12083.33,
      12083.33,
      12083.33,
      20076,
      12083.33,
      12083.33,
      12083.33
    ]
  }
]
```
We'd like to transform this data to a CSV file, where the total salary column is the sum of the monthly
payments. E.g.:

| Last Name  | First Name | Total Salary
| ---------- | -----------| ------------
| Doe        | John       |  97234.76
| Jane       | Mary       | 151928.21

Here's a typical approach. Granted in real-life we'd probably use a CSV parsing library,
but you get the drift. We'll write a class with a `write` method that creates the CSV file given a path to the JSON data:

```js
const fs = require("fs");

class SalaryReporter {
  constructor(inPath, outPath) {
    // Ignore possible errors.
    this.data = JSON.parse(fs.readFileSync(inPath, { encoding: "utf-8" }));
    this.outPath = outPath;
  }
  write() {
    // The first row of the return array are the headers

    let ret = [["Last Name", "First Name"]];

    // For each employee...
    for (let i = 0; i < this.data.length; i++) {
      const employee = this.data[i];
      let employeeTotal = 0;

      // Sum the yearly payments
      for (let j = 0; j < employee.pay.length; j++) {
        employeeTotal += employee.pay[j];
      }

      // Add a row with the employee's info, including total salary
      let row = [employee.lastName, employee.firstName, employeeTotal];
      ret.push(row);
    }
    fs.writeFileSync(this.outPath, ret.join("\n"), { encoding: "utf-8" });
  }
}
```

Now imagine that, in addition to a CSV file, we are asked to generate an HTML report. One approach might be to create a hierarchy of SalaryReporter classes, each one responsible for writing the report in a different way. Let's do that now. Here's a base class for both the CSV reporter and the HTML reporter:

```js
const fs = require("fs");

class SalaryReporter {
  constructor(inPath) {
    this.data = JSON.parse(fs.readFileSync(inPath, { encoding: "utf-8" }));
    this.parsedData = [];
    this.parse();
  }
  parse() {
    // Only parse data if we haven't parsed it yet.
    if (this.parsedData.length === 0) {
      this.parsedData = [["Last Name", "First Name"]];
      for (let i = 0; i < this.data.length; i++) {
        const employee = this.data[i];
        let employeeTotal = 0;
        for (let j = 0; j < employee.pay.length; j++) {
          employeeTotal += employee.pay[j];
        }
        let row = [employee.lastName, employee.firstName, employeeTotal];
        this.parsedData.push(row);
      }
    }
    return this;
  }
}
```

We've taken out the `write` method and added a `parse` method that's generally useful. `parse` saves the parsed data structure
as internal state (`this.parsedData`) and returns an instance of `SalaryReporter`. We could test it like this:

Now, let's extend this base class to write a CSV report. The subclass cares only about it's specialization, writing
a CSV representation of the data:

```js
...
class SalaryCSVReporter extends SalaryReporter {
  write(outPath) {
    fs.writeFileSync(outPath, this.parsedData.join("\n"), {
      encoding: "utf-8",
    });
  }
}
```

Now the HTML reporter. We'll, again, subclass `SalaryReporter`, overriding the `write` method to generate an HTML file containing a table:

```js
...
class SalaryReporterHTMLReporter extends SalaryReporter {
  write(outPath) {
    const date = new Date();
    const headerRow =
      "<tr>" +
      this.parsedData[0].map((heading) => `<th>${heading}</th>`).join("") +
      "</tr>";
    const dataRows = this.parsedData
      .slice(1)
      .map((row) => {
        const cells = row.map((data) => `<td>${data}</td>`).join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");

    const html = `<html>
    <head>
      <title>Employee Report: ${date}</title>
    </head>
    <body>
      <table>
        <thead>
          ${headerRow}
        </thead>
        <tbody>
          ${dataRows}
        </tbody>
      </table>
    </body>
  </html>`;
    fs.writeFileSync(outPath, html, { encoding: "utf-8" });
  }
}
```

Let's code-review this approach. A few observations:

* The `parse` and `write` methods are *impure*, meaning they perform side effects, namely reading and writing data from the file-system. How is this a problem?
  * What if the file at inPath` doesn't exist?
  * What if the file at `inPath` doesn't have read permissions?
  * What if the caller doesn't have write permissions for `outPath`?
  * To test the class, we need a lot of setup and teardown code: have to read an input file, we have to read an output file, and we have to be sure to remove the output file before and after each test-run.
  * What if the content of `inPath` is changed by a person or process? Can we reliably execute the `write` methods concurrently?
* The solution is verbose and reads like a step-by-step recipe of how to get from the input to the output. Generally the more verbose code is the more likely we've introduced bugs. It's a bit hard to read and easy to "get lost in the trees."
* It mutates variables including `employeeTotal` and `this.parsedData` in the base class' `parse` method. Not only is this unnecessary, it makes it harder to reason about, and it's bug-bait.

## A Functional Implementation

We'll now use fp to address the above deficiencies. Before we start, though, let's discuss the main characteristics of fp which me mentioned at the beginining of the post.

### Purity
In fp we try to program with as many pure functions as possible. That is, we design functions that given *x* input **always** output *y*. Pure functions also avoid side-effects, which include:

* reading from files
* writing to files
* reading from user input
* writing to the screen
* Making network connections
* etc.

Why are pure functions so important? Because they are:

* easy to reason about
* easy to test
* faciliate function composition (as explained later)

Of course, most useful programs perform side-effects. They need to reach out into the world and affect it, so we can't avoid them. But we can isolate side effects and clearly flag them.

### Immutability

The second main characteristic of fp is immutablity. Immutablity 
makes programs easier to reason about and thus less buggy. How many times have you, for example, tried to trace the value of an instance variable that was being modified by various instance methods and various times? 

Immutability also lends itself to concurrency. It's easier to avoid race conditions if variables aren't mucked with after their initialized.

An additional benefit of immutablity is that it gives you the ability to track application state programatically. For instance, if you were programming a video game, adhering to immutablity, you could easily show a "replay" of the game if you kept each state change, instead of mutating it. ugs 

### Function Composition

The third most important principle of fp is function composition. This is best explained by the Unix toolset, which is a collection of small, focused programs that can be piped together. Each program takes from `stdin` and outputs to `stdout`. Unix programs don't care about where they get their input from and where they dump their output.

The power and flexibility of this paradigm comes when we combine these small programs together. For example, to get the first name in alphebetical order of a list of unordered names in a file:

names.txt:
```
Raymond
Cohen
Albert
```
```bash
# read a text file, sort it, and take the first line.
$ cat names.txt | sort | head -n 1
```
sends `Cohen` to `stdout`.

So functional composition is simply using the output of one function as the input for another. You probably never thought much about this, but you see this all the time, in the form of intermediate variables or nested invocations:

```js
const exclaim = s => `${s}!`;
const upper = s => s.toUpperCase();

let exclaimed = exclaim("get out"); // "get out!"
upper(exclaimed); // "GET OUT!"

// or
upper(exclaim("get out"));
```

That doesn't look as nice as the unix toolset does. It's not imediately clear that there's a transformation of data, so instead we can use a `compose` function that clarifies this. Ramda's [`compose`](https://ramdajs.com/docs/#compose) function 
will do. `compose` takes any number of functions, starting at the right and passes each one's output to the function
to the left. It returns a new function that is a *composition* of all the passed functions:

```js
import { compose } from "ramda";


const exclaim = s => `${s}!`;
const upper = s => s.toUpperCase();

const yell = compose(upper, exclaim);
yell("get out") // "GET OUT!"
```

There's more to function composition than this, but these are the basics. It allows you to write small, focused functions
to build larger functions. Note that `exclaim` and `upper` are pure functions. For every input they output the *same* value regardless of the context outside the functions' scope. This is what makes composition possible.

## A Functional Implementation

OK, with the theory out of the way, now we're ready to refactor. Let's start, for now, by avoiding the cruft of classes and work with plain old functions. If we need to remember state, we'll consider using classes later.

We'll also try to consider the smallest chunks of functionality possible and their inputs and outputs. The first thing we need to do is get the data from the file. It's input is a path and its output is a string.

### Reading the File

How about this for getting the data from the file:

```js
import fs;

const readFileSync = (path) => fs.readFileSync(path, { encoding: "utf-8" });
```

Why do we even need a function for this? Well, we don't necessarily, but there's enough
detail in the call to `fs.readFileSync` that it will make our code more readable to abstract
away a few of the details. To keep things simple, for now we are not accounting for errors.

Do we need a test for this? I'd say no because it's so simple and I assume `fs.readFileSync` well tested
by someone else.

### Parsing the String

Our next step is parsing the string from the file to JSON. Well, we don't need to write that function--it already
exists: `JSON.parse`.

Now let's compose the two functions we have so far:

```js
const fs = require("fs");
const { compose } = require("ramda");

const readFile = (path) => fs.readFileSync(path, { encoding: "utf-8" });

const parseJSONFile = compose(JSON.parse, readFileSync);

parseJSONFile(`${__dirname}/employees.json`); // returns an array of employee objects.
```

`parseJSONFile` takes a path to a file, reads the file, outputs a string and feeds the string to `JSON.parse`.

Note how, already, our program is more declarative. The `parseJSON` function definition literally says: read a file and parse its contents as JSON.

### Transforming the Array of Objects to a Table

Next, we need to transform the array of employee objects to a two-dimensional array, with each
sub-array representing a row of data. The first row should be the header. Here's the output we want
from this function:

```js
[
  ["Last Name", "First Name"],
  ["Doe", "John", 97234.76],
  ["Jane", "Mary", 151928.21]
]
```

Let's try to do this without mutating variables:

```js
const makeTable = (employees) => {
  return [["Last Name", "First Name"]].concat(
    employees.map((x) => [
      x.lastName,
      x.firstName,
      x.pay.reduce((acc, curr) => acc + curr),
    ])
  );
};
```

## Challenges of Integrating into Existing Code Bases
