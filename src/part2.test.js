const sortByLastName = (xs, order) => {
  return xs.sort((firstEl, secondEl) => {
    if (firstEl.lastName < secondEl.lastName) {
      return order === "desc" ? -1 : 1;
    }
    if (firstEl.lastName > secondEl.lastName) {
      return order === "desc" ? 1 : -1;
    }
    return 0;
  });
};

describe("parameterized sort fn", () => {
  it("sorts desc", () => {
    expect(
      sortByLastName(
        [{ lastName: "B" }, { lastName: "A" }, { lastName: "C" }],
        "desc"
      )
    ).toEqual([{ lastName: "A" }, { lastName: "B" }, { lastName: "C" }]);
  });
  it("sorts asc", () => {
    expect(
      sortByLastName(
        [{ lastName: "B" }, { lastName: "A" }, { lastName: "C" }],
        "asc"
      )
    ).toEqual([{ lastName: "C" }, { lastName: "B" }, { lastName: "A" }]);
  });
});
