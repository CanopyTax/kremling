import { always, maybe } from "./classname-helpers.js";

describe("Classname helpers", function() {
  it("should always return through a chain", function() {
    expect(always("krimp").toString()).toBe("krimp");
    expect(
      always("krimp")
        .always("klaptrap")
        .always("klank")
        .toString()
    ).toBe("krimp klaptrap klank");
  });

  it("should maybe return through a chain", function() {
    expect(maybe("krimp", false).toString()).toBe("");
    expect(maybe("krimp", true).toString()).toBe("krimp");
    expect(
      maybe("krimp", true)
        .maybe("klaptrap", false)
        .maybe("klank", true)
        .toString()
    ).toBe("krimp klank");
  });

  it("should maybe and always return through a chain", function() {
    expect(
      maybe("krimp", true)
        .always("kannon")
        .maybe("klaptrap", false)
        .maybe("klank", true)
        .always("kloak")
        .toString()
    ).toBe("krimp kannon klank kloak");
  });
});
