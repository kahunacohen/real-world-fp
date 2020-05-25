const fs = require("fs");

class SalaryReporter {
  constructor(path) {
    // Ignore possible JSON parse errors for now.
    this.employees = JSON.parse(fs.readFileSync(path, { encoding: "utf-8" }));
    this.sortByLastName();
    this.employeeSummaryTable = this.makeEmployeeSummaryTable();
  }
  /**
   * @returns {Array} - A 2 dim array, with each sub array representing a row
   * of employee data.
   */
  makeEmployeeSummaryTable() {
    // The first row of the return array are the headers
    let ret = [["Last Name", "First Name", "Total Salary"]];
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
  sortByLastName() {
    this.employees = this.employees.sort((firstEl, secondEl) => {
      if (firstEl.lastName < secondEl.lastName) {
        return -1;
      }
      if (firstEl.lastName > secondEl.lastName) {
        return 1;
      }
      return 0;
    });
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

describe("monolithic SalaryReporter", () => {
  describe("SalaryReporter", () => {
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
        "Last Name,First Name,Total Salary\nDoe,John,97234.76\nJane,Mary,151928.21"
      );
    });
  });
});
