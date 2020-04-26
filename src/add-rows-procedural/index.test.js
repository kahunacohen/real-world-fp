const fs = require("fs");

function addData(path) {
  let ret = 0;
  const data = fs.readFileSync(path, { encoding: "utf8" });
  for (const line of data.split("\n")) {
    const [x, y] = line.split(",");
    ret += parseInt(x) + parseInt(y);
  }
  return ret;
}

describe("addData", () => {
  it("adds rows of numbers", () => {
    expect(addData(`${__dirname}/data.csv`)).toEqual(105);
  });
});
