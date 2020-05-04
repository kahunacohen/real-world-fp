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

class SalaryCSVReporter extends SalaryReporter {
  write(outPath) {
    fs.writeFileSync(outPath, this.parsedData.join("\n"), {
      encoding: "utf-8",
    });
  }
}

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
    expect(true).toEqual(true);
    expect(fs.readFileSync(outPath, { encoding: "utf-8" })).toEqual(
      "Last Name,First Name\nDoe,John,97234.76\nJane,Mary,151928.21"
    );
  });
});
