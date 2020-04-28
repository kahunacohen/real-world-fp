const fs = require("fs");

const addData = s => {
  return s.split("\n")
    .reduce((lineAcc, line) => lineAcc + line.split(",")
      .reduce((colAcc, col) => parseInt(colAcc) + parseInt(col)), 0)
}

describe("addData", () => {
  it("adds rows of numbers", () => {
    const s = "1,2,3\n100,0,1\n1,1";
    expect(addData(s)).toEqual(109);
  });
});
