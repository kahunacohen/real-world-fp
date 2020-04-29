const fs = require("fs");

const yearlySalariesAsCSV = (xs) => {
  return (
    "Last Name,First Name,Total Payments\n" +
    xs
      .map(
        (x) =>
          `${x.lastName},${x.firstName},${x.pay.reduce(
            (acc, curr) => acc + curr,
            0
          )}`
      )
      .join("\n")
  );
};

describe("addData", () => {
  it("adds rows of numbers", () => {
    data = [
      {
        firstName: "John",
        lastName: "Doe",
        pay: [
          8333.33,
          8333.33,
          8333.33,
          8021.45,
          7023.0,
          9023.67,
          8333.33,
          8333.33,
          8333.33,
          6500.0,
          8333.33,
          8333.33,
        ],
      },
      {
        firstName: "Mary",
        lastName: "Jane",
        pay: [
          12083.33,
          12083.33,
          12083.33,
          11000.0,
          12102.24,
          12083.33,
          12083.33,
          12083.33,
          20076.0,
          12083.33,
          12083.33,
          12083.33,
        ],
      },
    ];
    expect(yearlySalariesAsCSV(data)).toEqual(
      "Last Name,First Name,Total Payments\nDoe,John,97234.76\nJane,Mary,151928.21"
    );
  });
});
