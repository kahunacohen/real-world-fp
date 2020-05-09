# Functional Programming for Smarties (part 1)

This series is aimed for intermediate JavaScript programmers, and/or those with limited functional programming experience. In the first part, I'll explore four, important key characteristics of functional programming (fp), namely:

1. functions as core building blocks
1. immutablity over mutability
1. pure functions over procedures
1. composition over inheritance

To illustrate these points we'll implement a typical programming task in a an object-oriented, procedural style and then transform it to a functional style.

Let's imagine we are given the task for converting this data:

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

to 

CSV, where the total salary column is the sum of the monthly
payments. When read by a program like Excel, the CSV would look like this table::

| Last Name  | First Name | Total Salary
| ---------- | -----------| ------------
| Doe        | John       |  97234.76
| Jane       | Mary       | 151928.21

## Procderual/Object-Oriented Approach

We might start with a class like this:

```js
const fs = require("fs");

class SalaryReporter {
  constructor(employees) {
    this.empoyees = employees;
    this.employeeSummaryTable = this.makeEmployeeSummaryTable();
  }
  /**
   * @returns {Array} - A 2 dim array, with each sub array representing a row
   * of employee data.
   */
  makeEmployeeSummaryTable() {
    // The first row of the return array are the headers
    let ret = [["Last Name", "First Name"]];

    // For each employee...
    for (let i = 0; i < this.employees.length; i++) {
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
    return ret;
  }
  /**
   * @returns {String} - CSV string
   */
  report() {
    return this.employeeSummaryTable.join("\n");
  }
}
```

Now imagine that, in addition to a CSV file, we are asked to generate an HTML report. One approach might be to create a hierarchy of `SalaryReporter` classes, each one responsible for writing the report in a different way. Let's do that now. Here's a base class for both the CSV reporter and the HTML reporter. We
just extract out the `report` method:

```js
class SalaryReporter {
  constructor(employees) {
    this.empoyees = employees;
    this.employeeSummaryTable = this.makeEmployeeSummaryTable();
  }
  /**
   * @returns {Array} - A 2 dim array, with each sub array representing a row
   * of employee data.
   */
  makeEmployeeSummaryTable() {
    // The first row of the return array are the headers
    let ret = [["Last Name", "First Name"]];

    // For each employee...
    for (let i = 0; i < this.employees.length; i++) {
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
    return ret;
  }
}
```

Now, let's extend this base class to write a CSV report. The subclass cares only about it's specialization, in this case returning the CSV representatiion of the table:

```js
...
class SalaryCSVReporter extends SalaryReporter {
  report(outPath) {
    return this.employeeSummaryTable.join("\n");
  }
}
```

Now the HTML reporter. We'll, again, subclass `SalaryReporter`, overriding the `report` method to generate an HTML file containing a table:

```js
...
class SalaryReporterHTMLReporter extends SalaryReporter {
  report() {
    const date = new Date();
    const headerRow =
      "<tr>" +
      this.employeeSummaryTable[0].map((heading) => `<th>${heading}</th>`).join("") +
      "</tr>";

    const dataRows = this.employeeSummaryTable
      .slice(1) // Everything but the first row
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
    return html;
  }
}
```

Let's do a pretend code-review:

* The solution is verbose and reads like a detailed step-by-step recipe of how to get from the input to the output. Generally the more verbose code is the more likely we've introduced bugs. It's a bit hard to read and easy to "get lost in the trees."
* It mutates variables including `employeeTotal` and `ret` in the base class' `parse` method. Not only is this unnecessary, it makes it harder to reason about, and it's bug-bait.
* It writes to the instance variable, `employeeSummaryTable` in the constructor, which is then referenced in a different method, `report`. Writing and reading variables outside a function's scope can make program
logic hard to follow.

## A Functional Implementation

Now let's use some principles of fp to address the above deficiencies. Before we start, though, let's discuss the main characteristics of fp which me mentioned at the beginining of the post.

### Functions as Building Blocks

In general, fp emphasizes plain old functions as first-class citizens and the core building blocks of programs. We pass functions to other functions and avoid classes unless absolutely necessary. In other
words, we start with functions and use classes only if we have a good reason to do so so.

### Immutability

The second main characteristic of fp is immutablity. Immutability means *not* modifying variables in-place, or after they are initialized.  Immutablity makes programs easier to reason about and thus less buggy. Immutability also lends itself to concurrency. It's easier to avoid race conditions if variables aren't man-handled in arbitrary locations.

An additional benefit of immutablity is that it allows us to track application state programatically. For instance, if you were developing a video game, and you preserved application state, instead of destroying it, you could easily show a "replay" of the game. 

### Purity

In fp we try to program not only with functions as much as possible, but also with *pure* functions. Pure
functions are functions that given *x* input **always** return the same output, *y*. Pure functions also avoid side-effects which we'll come back to in a later post.

Why are pure functions so important? Because they are:

* easy to reason about
* easy to test
* faciliate function composition (as explained later)

### Composition over Inheretance

This means we avoid classical inheratance, and instead stress building larger pieces of application logic by combining smaller functions in pipelines to *transform* data. This is best illustrated by the Unix toolset, which is a collection of small, focused programs that can be piped together. Each program takes from `stdin` and outputs to `stdout`. Unix programs don't care about where they get their input from and where they dump their output.

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

We'll also try to consider the smallest chunks of functionality possible and their inputs and outputs. 

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
