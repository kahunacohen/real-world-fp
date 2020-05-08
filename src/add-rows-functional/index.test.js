const fs = require("fs");

const { compose } = require("ramda");

const readFile = (p) => fs.readFileSync(p, { encoding: "utf-8" });
const parseJSONFile = compose(JSON.parse, readFile);

const makeTable = (employees) => {
  return [["Last Name", "First Name"]].concat(
    employees.map((e) => [
      e.lastName,
      e.firstName,
      e.pay.reduce((acc, curr) => acc + curr),
    ])
  );
};

describe("program", () => {
  describe("parseJSONFile", () => {
    it("gets a JSON string from a file and parses it", () => {
      expect(parseJSONFile(`${__dirname}/employees.json`)).toEqual([
        {
          firstName: "John",
          lastName: "Doe",
          pay: [
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
            11000,
            12102.24,
            12083.33,
            12083.33,
            12083.33,
            20076,
            12083.33,
            12083.33,
            12083.33,
          ],
        },
      ]);
    });
  });
  describe("makeTable", () => {
    expect(
      makeTable([
        {
          firstName: "John",
          lastName: "Doe",
          pay: [
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
            11000,
            12102.24,
            12083.33,
            12083.33,
            12083.33,
            20076,
            12083.33,
            12083.33,
            12083.33,
          ],
        },
      ])
    ).toEqual([
      ["Last Name", "First Name"],
      ["Doe", "John", 97234.76],
      ["Jane", "Mary", 151928.21],
    ]);
  });
});

// const getEmployees = (path) => fs.readFileSync(path, { encoding: "utf-8" });

// const yearlySalariesAsCSV = (xs) => {
//   return (
//     "Last Name,First Name,Total Payments\n" +
//     xs
//       .map(
//         (x) =>
//           `${x.lastName},${x.firstName},${x.pay.reduce(
//             (acc, curr) => acc + curr,
//             0
//           )}`
//       )
//       .join("\n")
//   );
// };

// describe("addData", () => {
//   it("adds rows of numbers", () => {
//     data = [
//       {
//         firstName: "John",
//         lastName: "Doe",
//         pay: [
//           8333.33,
//           8333.33,
//           8333.33,
//           8021.45,
//           7023.0,
//           9023.67,
//           8333.33,
//           8333.33,
//           8333.33,
//           6500.0,
//           8333.33,
//           8333.33,
//         ],
//       },
//       {
//         firstName: "Mary",
//         lastName: "Jane",
//         pay: [
//           12083.33,
//           12083.33,
//           12083.33,
//           11000.0,
//           12102.24,
//           12083.33,
//           12083.33,
//           12083.33,
//           20076.0,
//           12083.33,
//           12083.33,
//           12083.33,
//         ],
//       },
//     ];
//     expect(yearlySalariesAsCSV(data)).toEqual(
//       "Last Name,First Name,Total Payments\nDoe,John,97234.76\nJane,Mary,151928.21"
//     );
//   });
// });
