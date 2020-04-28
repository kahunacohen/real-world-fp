const fs = require("fs");

function addData(path) {
  let ret = 0;
  const data = fs.readFileSync(path, { encoding: "utf8" });
  const lines = data.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
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
