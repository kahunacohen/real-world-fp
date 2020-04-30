# Real World Functional Programming

This post is aimed for intermediate JavaScript programmers, and/or those with very limited functional programming experience. I'll discuss what functional programming (fp) is, why to use it and how to integrate it into a real-world, existing project written mainly in a procedural and/or object-oriented style.

## What is Functional Programming?
With the popularity of frameworks such as [ReactJs](https://reactjs.org/) and [RxJS](https://rxjs-dev.firebaseapp.com/) fp is getting a lot of attention in the JavaScript community. But what is it and how can our programs from it? Though fp has a reputaiton for being too academic, its principles are really quite basic and it's had a huge affect on modern programming practices.

Fp is a way to solve larger problems by fitting together small, focused, *pure* functions, preferring immutable data structures over side-effects, stateful objects and mutable data. A program written in an fp style tends to read more like a spec rather than a step-by-step recipe.  

First, what are *pure* functions? Pure functions are simply functions that given an input *x*, always return the same output *y*. Additionally, a pure function performs no side-effects (such as writing to the screen, writing or reading a file, opening a network connection etc.). 

Let's take a look at a practical programming task that will help us understand the difference betweeen procedural and functional programming. Imagine data in a JSON file in this form:

```
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
We'd like to transform this data to a CSV file like this, where the total salary column is the sum of the monthly
payments:

| Last Name  | First Name | Total Salary
| ---------- | -----------| ------------
| Doe        | John       |  97234.76
| Jane       | Mary       | 151928.21


Here's a typical impure, procedural, object-oriented approach. Granted in real-life we'd probably use a CSV parsing library,
but you get the drift:

```js
class SalaryManager {
  constructor(inPath, outPath) {
    // Ignore possible errors.
    this.data = JSON.parse(fs.readFileSync(inPath, { encoding: "utf-8" }));
    this.outPath = outPath;
  }
  writeReport() {
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

We could test the class like this:

```js
describe("Salary Manager", () => {

  // Ensure the report file is removed before and after
  // the test.
  const outPath = `${__dirname}/report.csv`;
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
  
  it("writeReport writes a correct CSV file", () => {
    const salaryReporter = new SalaryManager(
      `${__dirname}/employees.json`,
      outPath
    );
    salaryReporter.writeReport();
    expect(fs.readFileSync(outPath, { encoding: "utf-8" })).toEqual(
      "Last Name,First Name\nDoe,John,97234.76\nJane,Mary,151928.21"
    );
  });
});
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
