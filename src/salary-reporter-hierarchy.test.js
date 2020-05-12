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
}

class SalaryCSVReporter extends SalaryReporter {
  report(path) {
    fs.writeFileSync(path, this.employeeSummaryTable.join("\n"), {
      encoding: "utf-8",
    });
  }
}

class SalaryHTMLReporter extends SalaryReporter {
  report(path) {
    const date = new Date();
    const headerRow =
      "<tr>" +
      this.employeeSummaryTable[0]
        .map((heading) => `<th>${heading}</th>`)
        .join("") +
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
    fs.writeFileSync(path, html, { encoding: "utf-8" });
  }
}

describe("hierarchy", () => {
  const csvOutPath = `${__dirname}/employees.csv`;
  const htmlOutPath = `${__dirname}/employees.html`;
  beforeEach(() => {
    if (fs.existsSync(csvOutPath)) {
      fs.unlinkSync(csvOutPath);
    }
    if (fs.existsSync(htmlOutPath)) {
      fs.unlinkSync(htmlOutPath);
    }
  });
  afterEach(() => {
    if (fs.existsSync(csvOutPath)) {
      fs.unlinkSync(csvOutPath);
    }
    if (fs.existsSync(htmlOutPath)) {
      fs.unlinkSync(htmlOutPath);
    }
  });
  describe("SalaryCSVReporter", () => {
    it("reports salary as CSV", () => {
      const reporter = new SalaryCSVReporter(`${__dirname}/employees.json`);
      reporter.report(csvOutPath);
      expect(fs.readFileSync(csvOutPath, { encoding: "utf-8" })).toEqual(
        "Last Name,First Name\nDoe,John,97234.76\nJane,Mary,151928.21"
      );
    });
  });
  describe("SalaryHTMLReporter", () => {
    it("reports salary as HTML", () => {
      const reporter = new SalaryHTMLReporter(`${__dirname}/employees.json`);
      reporter.report(htmlOutPath);
      // In real-life we'd use minidom to parse the html and query it.
      expect(fs.readFileSync(htmlOutPath, { encoding: "utf-8" })).toContain(
        "<tr><td>Doe</td><td>John</td><td>97234.76</td></tr>"
      );
    });
  });
});
