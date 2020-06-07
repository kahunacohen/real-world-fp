const { compose, filter } = require("ramda");
const fs = require("fs");

const censor = (s) =>
  s.replace(/\d{3}-\d{2}-(\d{4})/g, (_, lastFour) => `xxx-xx-${lastFour}`);

const sortByLastName = (xs) => {
  return xs.sort((firstEl, secondEl) => {
    if (firstEl.lastName < secondEl.lastName) {
      return -1;
    }
    if (firstEl.lastName > secondEl.lastName) {
      return 1;
    }
    return 0;
  });
};

const makeTable = (employees) => {
  return [["Last Name", "First Name"]].concat(
    employees.map((x) => [
      x.lastName,
      x.firstName,
      x.pay.reduce((acc, curr) => acc + curr),
    ])
  );
};

const f = compose(
  makeTable,
  sortByLastName,
  filter((x) => x.active),
  JSON.parse,
  censor
);

describe("foo", () => {
  let employeesStr;
  beforeAll(() => {
    employeesStr = fs.readFileSync(`${__dirname}/employees.json`, {
      encoding: "utf-8",
    });
  });
  it("does", () => {
    console.log(f(employeesStr));
  });
});
