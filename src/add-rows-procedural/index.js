const fs = require("fs");

function addData(path) {
  let ret = 0;
  const data = fs.readFileSync(path, { encoding: "utf8" });
  // error checking with file system read etc.
  for (const line of data.split("\n")) {
    if (line !== "") {
      const [x, y] = line.split(",");
      ret += parseInt(x) + parseInt(y);
    }
    return ret;
  }
}
console.log(addData("./data.csv"));
