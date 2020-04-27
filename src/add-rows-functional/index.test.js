const fs = require("fs");

const addData = (s) =>
  s.split("\n").reduce((acc, line) => {
    const [x, y] = line.split(",");
    return acc + (parseInt(x) + parseInt(y));
  }, 0);

describe("addData", () => {
  it("adds rows of numbers", () => {
    const s = "1,2\n100,0\n1,1";
    expect(addData(s)).toEqual(105);
  });
});
