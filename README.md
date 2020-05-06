# Functional Programming for Smarties

This post is aimed for intermediate JavaScript programmers, and/or those with limited functional programming experience. I'll discuss the basics of functional programming (fp) is, why to use it and how to integrate it into a real-world code base.

## What is Functional Programming?
With the popularity of frameworks and libraries, such as [ReactJs](https://reactjs.org/) and [RxJS](https://rxjs-dev.firebaseapp.com/), fp is has gotten lot of attention in the JavaScript community.

Fp is, as [Martin Odesky](https://en.wikipedia.org/wiki/Martin_Odersky) the creator of [Scala](https://en.wikipedia.org/wiki/Scala_(programming_language)) says, is simply an "alias for programming with functions."  That is, it's fitting together small, focused, *pure* functions to solve a greater problem. The style prefers functions over stateful objects and side effects and aims to represent data with immutable data structures. Functional solutions also tend to be more declarative rather than imperative.

Though fp is a broad and sometimes complex subject, its main prinicples are quite simple and directly address common challenges when programming in more traditional styles. In this particular post we'll focus on the following charateristics of fp:

1. Purity over side effects 
1. Immutablity over mutability
1. Composition over inheritance

To make this all more concrete, we'll implement a typical programming task in a an object-oriented, procedural style and then transform it to a functional style. Of course one blog post is insufficient to teach all of fp, so our example will be somewhat contrived in order to quickly illustrate the essence of what we are trying to achieve when using fp.

## A Procedural Implementation
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

We'll test the class like this:

```js
const fs = require("fs");


describe("Salary Reporter", () => {
  const outPath = `${__dirname}/employees.csv`;
  const safeDelete = () => {
    if (fs.existsSync(outPath)) {
      fs.unlinkSync(outPath);
    }
  };
  beforeEach(() => {
    safeDelete();
  });
  afterEach(() => {
    safeDelete();
  });
  it("writes a correct CSV file", () => {
    const salaryReporter = new SalaryReporter(
      `${__dirname}/employees.json`,
      outPath
    );
    salaryReporter.write();
    expect(fs.readFileSync(outPath, { encoding: "utf-8" })).toEqual(
      "Last Name,First Name\nDoe,John,97234.76\nJane,Mary,151928.21"
    );
  });
});
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

```js
describe("SalaryReporter", () => {
  it("parses correct 2 dim array", () => {
    const salaryReporter = new SalaryReporter(`${__dirname}/employees.json`);
    expect(salaryReporter.parsedData).toEqual([
      ["Last Name", "First Name"],
      ["Doe", "John", 97234.76],
      ["Jane", "Mary", 151928.21],
    ]);
  });
});
```

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

...and it's test:

```js
...
describe("SalaryCSVReporter", () => {
  const outPath = `${__dirname}/employees.csv`;
  const safeDelete = () => {
    if (fs.existsSync(outPath)) {
      fs.unlinkSync(outPath);
    }
  };
  beforeEach(() => {
    safeDelete();
  });
  afterEach(() => {
    safeDelete();
  });
  it("writes a CSV file", () => {
    const salaryCSVReporter = new SalaryCSVReporter(
      `${__dirname}/employees.json`
    );
    salaryCSVReporter.write(outPath);
    expect(fs.readFileSync(outPath, { encoding: "utf-8" })).toEqual(
      "Last Name,First Name\nDoe,John,97234.76\nJane,Mary,151928.21"
    );
  });
});
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

Here's its test:

```js
...
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

describe("SalaryHTMLReporter", () => {
  const outPath = `${__dirname}/employees.html`;
  const safeDelete = () => {
    if (fs.existsSync(outPath)) {
      fs.unlinkSync(outPath);
    }
  };
  beforeEach(() => {
    safeDelete();
  });
  afterEach(() => {
    safeDelete();
  });
  it("writes an HTML report", () => {
    const htmlReporter = new SalaryReporterHTMLReporter(
      `${__dirname}/employees.json`
    );
    htmlReporter.write(outPath);
    const html = fs.readFileSync(outPath, { encoding: "utf8" });
    
    // Parse the HTML string from the file to a DOM so we can assert stuff.
    const doc = new JSDOM(html).window.document;
    const headers = Array.from(doc.querySelectorAll("table thead th"));
    const dataCells = Array.from(doc.querySelectorAll("table tbody td"));
    
    // Assert stuff.
    expect(headers.length).toEqual(3);
    expect(headers.map((header) => header.textContent)).toEqual([
      "Last Name",
      "First Name",
      "Total",
    ]);

    expect(dataCells.map((cell) => cell.textContent)).toEqual([
      "Doe",
      "John",
      "97234.76",
      "Jane",
      "Mary",
      "151928.21",
    ]);
  });
});
```

Let's code-review this approach. A few observations:

* The `write` methods perform side effects, namely reading and writing data from the file-system. The methods are *impure*, meaning the outputs of the `write` methods depend on state apart from their local scope, and their output is not guarenteed to be the same given the same input:
  * What if the file at inPath` doesn't exist?
  * What if the file at `inPath` doesn't have read permissions?
  * What if the caller doesn't have write permissions for `outPath`?
  * In general, the solution is monolihic and mixes concerns between data and how the data is output.
  * To test the class, we have to read an input file, we have to read an output file, and we have to be sure to remove the output file before and after each test-run.
  * What if the content of `inPath` is changed by a person or process? Can we reliably execute the `write` methods concurrently?
* It's verbose and reads like a step-by-step recipe of how to get from the input to the output. Generally the more verbose code is the more likely we've introduced bugs. It's a bit hard to read and easy to "get lost in the trees."
* It mutates variables including `employeeTotal` and `this.parsedData` in the base class' `parse` method. Not only is this unnecessary, it makes it harder to reason about, and it's bug-bait.

## A Functional Implementation

Before we code let's think about a few things that will guide is, namely state and function composition.

### State
State is anything that needs to be persisted and remembered in a system, outside of our program's execution. For example:

1. Writing to the screen
1. Reading from user input
1. Network connecitons
1. Mutating the DOM etc.

State is the hardest part of any program, in that it's hard to keep track of and reason about and hard to test in a reliable manner. And yet state is essential to almost all real-world programs. For the most part our programs need to have some kind of effect on the real world.

The key is not avoiding state, is isolating it from the rest of our program. 

In our case, the state is the the data in the JSON file. Reading and writing to the file-system is something we'd want to wall-off. So the first function we want to create is getting the data from the file.

### Function Composition

Let's see how a functional approach to the problem can address the above deficiancies. When thinking functionally we'll try
to view our programs as transformations, or pipelines of data. We have an input, in this case JSON representing employees, and an output: a CSV and HTML file with each employee's total salary. We'll then try to break each part of the problem into smaller pieces using pure functions.

Think about how the Unix toolset works. It's a collection of small, focused programs that take from `stdin` and output to `stdout`. The power and flexibility comes when you pipe these programs together. For example, to get the first name in alphebetical order of a list of unordered names in a file:

names.txt:
```
Raymond
Cohen
Albert
```
```
$ cat names.txt | sort | head -n 1
```
sends `Cohen` to `stdout`.


## Challenges of Integrating into Existing Code Bases
