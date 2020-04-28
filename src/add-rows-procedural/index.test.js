const fs = require("fs");

function addData(path) {
  let ret = 0;
  const data = fs.readFileSync(path, { encoding: "utf8" });
  const lines = data.split("\n");
  for (let i = 0; i < lines.length; i++) {;
    const cols = lines[i].split(",");
    for (let j = 0; j < cols.length; j++) {
      ret += parseInt(cols[j]);
    }
  }
  return ret;
}

describe("addData", () => {
  it("sums all the rows of arbitrary column of numbers", () => {
    expect(addData(`${__dirname}/data.csv`)).toEqual(109);
  });
});
