# Functional Programming for Smarties (part 1)

This series is aimed for intermediate JavaScript programmers, and/or those with limited functional programming experience. In the first part, I'll explore three important characteristics of functional programming (fp), namely:

1. pure functions as primary building blocks
1. immutablity over mutability
1. composition over inheritance

In later posts we'll explore other key aspects of fp, but for now these three will get us started.

We'll implement a typical programming task in a an object-oriented, procedural style and then transform it to a functional style and continue the refactor in later posts.

Let's imagine we have data representing employees. We would like to:

* Return the number of active employees
* Generate a CSV table of each active employee and the total amount of paychecks for the year.

The data looks like this:

```json
[
  {
    "firstName": "John",
    "lastName": "Doe",
    "active": true,
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
    "active": true,
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
{
  "firstName": "Robert",
  "lastName": "Brown",
  "active": false,
  "payments": [
    2300,
    1900
  ]

}
```
The current, active employees should be `2`, and the CSV, when read by a program like Excel, should look like this:

| Last Name  | First Name | Total Salary
| ---------- | -----------| ------------
| Doe        | John       |  97234.76
| Jane       | Mary       | 151928.21

## Procderual/Object-Oriented Approach

We might start with a class like this:

```js
class SalaryReporter {
  /**
   * data {string} - A string of JSON.
   */
  constructor(data) {
    // Ignore possible JSON parse errors for now.
    this.empoyees = JSON.parse(employees);
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
  getActiveEmployees() {
    let ret = 0;
    for (let i = 0; i < this.employees.length; i++) {
      if (employees[i].active) {
        return ret += 1;
      }
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

Now imagine that, in addition to a CSV file, we are asked to generate an HTML report. We could create a hierarchy of `SalaryReporter` classes, each one responsible for writing the report in a different way. Let's do that now. Here's a base class for both the CSV reporter and the HTML reporter. We
just extract out the `report` method:

```js
class SalaryReporter {
  constructor(employees) {
    this.empoyees = employees;
    this.employeeSummaryTable = this.makeEmployeeSummaryTable();
  }
  getActiveEmployees() {
    let ret = [];
    for (let i = 0; i < this.employees.length; i++) {
      if (employees[i].active) {
        ret.push(employees[i]);
      }
    }
    return ret;
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

`makeEmployeeSummaryTable`, transforms the raw employee data into a data structure suitable for various
kinds of tabular reports.

Now, let's extend this base class to write a CSV report. The subclass cares only about it's specialization, in this case returning the CSV representatiion of the table:

```js
...
class SalaryCSVReporter extends SalaryReporter {
  report() {
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

Now, for a code review:

* Our solution is unnecessarily verbose, which makes it hard to read and introduces more opportunties for bugs.
* It mutates variables including `employeeTotal` and `ret` in the base class' `makeEmployeeSummaryTable`
and the `getActiveEmployees` method. Not only is this unnecessary, it makes it harder to reason about. It also contributes to the verbosity as stated above.
* It writes to the instance variable, `employeeSummaryTable` in the constructor, which is then referenced in a different method, `report`. Writing and reading variables outside a function's scope can make program
logic hard to follow.

## A Functional Implementation

Now let's fix these issues by applying the principles of fp we mentioned in the beginning of this post. But before we get
started let's discuss the principles in a bit more detail.

### Pure Functions as Primary Building Blocks

In general, fp emphasizes plain old functions as first-class citizens and the core building blocks of programs. We pass functions to other functions and avoid classes unless absolutely necessary. In other
words, we start with functions and use classes only if we have a good reason to do so so.

In fp we try to program not only with functions as much as possible, but also with *pure* functions. Pure
functions are functions that given *x* input **always** return the same output, *y*. Pure functions also avoid side-effects which we'll come back to in a later post.

Why are pure functions so important? Because they are:

* easy to reason about, by subsituting a function call with the value it returns
* easy to test
* faciliate function composition (as explained later)

In our example code, `getActiveEmployees` and `makeEmployeeSummaryTable` are both *impure* because they rely on variables
outside their scopes as input and output. Remember a pure function always *returns* its output based on its parameters, and given the same parameters always returns the same result. `getActiveEmployees`, besides for the fact that it doesn't take any
parameters can return a different result based on the value of `this.employees`, which is set outside its context.

### Immutability

The second main characteristic of fp is immutablity. Immutability means *not* modifying variables in-place, or after they are initialized.  Like using pure functions, immutablity makes programs easier to reason about and thus less buggy. Immutability also lends itself to concurrency. It's easier to avoid race conditions if variables aren't man-handled in arbitrary locations.

### Composition over Inheritance

In fp composition is used instead of inheritance. We specialize by plugging smaller functions together to make larger functions using pipelines to *transform* data. This is best illustrated by the Unix toolset, which is a collection of small, focused programs that can be strung together. Each program takes from `stdin` and outputs to `stdout`. Unix programs don't care about where they get their input from and where they dump their output.

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

So, functional composition is simply using the output of one function as the input for another. We use this all the time, in the form of intermediate variables or nested invocations:

```js
const exclaim = s => `${s}!`;
const upper = s => s.toUpperCase();

let exclaimed = exclaim("get out"); // "get out!"
upper(exclaimed); // "GET OUT!"

// or
upper(exclaim("get out"));
```

That's not as easy to read as Unix pipes, especially when piping together more than two functions. It's not imediately clear that there's a transformation of data, so instead we can use a `compose` function that clarifies this. Ramda's [`compose`](https://ramdajs.com/docs/#compose) function 
will do. `compose` takes any number of functions, starting at the right and passes each one's output to the function
to the left. It returns a new function that is a *composition* of all the passed functions:

```js
import { compose } from "ramda";


const exclaim = s => `${s}!`;
const upper = s => s.toUpperCase();

// Create a new function, yell that's a composition of upper and exclaim
const yell = compose(upper, exclaim);
yell("get out") // "GET OUT!"
```

There's more to function composition than this, but these are the basics. It allows you to write small, focused functions
to build larger functions. The fact that `exclaim` and `upper` are pure functions makes this composition
possible.

## A Functional Implementation

OK, with the theory out of the way, now we're ready to refactor. Let's start, for now, by avoiding the cruft of classes and work with plain old functions. If we need to remember state, we'll consider using classes later.

We'll also try to consider the smallest chunks of functionality possible and their inputs and outputs. 

### Parsing the String

Our first step is parsing the string from our data source to JSON. Well, we don't need to write that function. It already exists: `JSON.parse`.

### Making the Tabular Data Structure

Given an array of employee objects from a string we need to create the two-dimensional array that can represent a table:

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
Remember, we want an array of arrays, each sub-array is a row of the table.

1. We `concat` the header row and [`map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) each employee object to a an array of whose elements are first name, last name and
total pay. `map` is a critical tool for functional programmers. It's called a *higher order* function because it takes a function as
an argument. It *maps* over arrays, applying a function to each element and returning a *new* array.
1. Instead of mutating an accumulator variable, we apply the [`reduce`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) function to the employee's `pay` array. `reduce` is another higher order function that 
takes a function with an accumulator and current element parameter. It is typically used to operate on arrays and reduce them to one
value. In this case we reduce the `pay` array and sum its elements.

Note how concise our function is. We do not mutate any local variables and are simply transforming our input array to another array
that's suitable for rendering in tabular format. We can now compose two functions to take a JSON string and transform it to
our tabular array:

```js
foo
```

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
