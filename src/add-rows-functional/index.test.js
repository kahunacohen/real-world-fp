const fs = require("fs");

const addData = s => {
  return s.split("\n").reduce((acc1, line) => acc1 + line.split(",").reduce((acc, col) => parseInt(acc) + parseInt(col)), 0)
}

describe("addData", () => {
  it("adds rows of numbers", () => {
    const s = "1,2\n100,0\n1,1";
    //expect(addData(s)).toEqual(105);
    console.log(addData(s));
  });
});
