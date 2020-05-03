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

describe("Salary Reporter", () => {
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
