const fs = require("fs");

class SalaryReporter {
  constructor(path) {
    // Ignore possible JSON parse errors for now.
    this.employees = JSON.parse(fs.readFileSync(path, { encoding: "utf-8" }));
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
      const employee = this.employees[i];

      // Only active employees
      if (employee.active) {
        let employeeTotal = 0;

        // Sum the yearly payments
        for (let j = 0; j < employee.pay.length; j++) {
          employeeTotal += employee.pay[j];
        }

        // Add a row with the employee's info, including total salary
        let row = [employee.lastName, employee.firstName, employeeTotal];
        ret.push(row);
      }
    }
    return ret;
  }
  /**
   * @returns {String} - CSV string
   */
  report(path) {
    fs.writeFileSync(path, this.employeeSummaryTable.join("\n"), {
      encoding: "utf-8",
    });
  }
}

describe("post", () => {
  describe("SalaryReporter1", () => {
    const outPath = `${__dirname}/employees.csv`;
    beforeEach(() => {
      if (fs.existsSync(outPath)) {
        fs.unlinkSync(outPath);
      }
    });
    afterEach(() => {
      if (fs.existsSync(outPath)) {
        fs.unlinkSync(outPath);
      }
    });
    it("reports salary as CSV", () => {
      const reporter = new SalaryReporter(`${__dirname}/employees.json`);
      reporter.report(outPath);
      expect(fs.readFileSync(outPath, { encoding: "utf-8" })).toEqual(
        "Last Name,First Name\nDoe,John,97234.76\nJane,Mary,151928.21"
      );
    });
  });
});
