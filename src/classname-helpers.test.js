import { always, maybe, toggle } from "./classname-helpers.js";

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

  it("should toggle return through a chain", function() {
    expect(toggle("ksmash", "kair").toString()).toBe("kair");
    expect(toggle("krimp", "kramp", false).toString()).toBe("kramp");
    expect(toggle("krimp", "kramp", true).toString()).toBe("krimp");
    expect(
      toggle("krimp", "kramp", true)
        .toggle("klaptrap", "klapsnap", false)
        .toggle("klank", "klink", true)
        .toString()
    ).toBe("krimp klapsnap klank");
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

  it("should maybe and toggle return through a chain", function() {
    expect(
      maybe("krimp", true)
        .toggle("kannon", "keenon", false)
        .maybe("klaptrap", false)
        .maybe("klank", true)
        .toggle("kloak", "koat", true)
        .toString()
    ).toBe("krimp keenon klank kloak");
  });

  it("should always and toggle return through a chain", function() {
    expect(
      always("krimp")
        .toggle("kannon", "keenon", false)
        .always("klaptrap")
        .always("klank")
        .toggle("kloak", "koat", true)
        .toString()
    ).toBe("krimp keenon klaptrap klank kloak");
  });

  it("should always maybe and toggle return through a chain", function() {
    expect(
      always("krimp")
        .toggle("kannon", "keenon", false)
        .always("klaptrap")
        .maybe("klank", true)
        .toggle("kloak", "koat", true)
        .maybe("klump", false)
        .toString()
    ).toBe("krimp keenon klaptrap klank kloak");
  });

  it("should throw when a non string is passed", function() {
    expect(() => maybe(2)).toThrow();
    expect(() => always('dk').maybe(2)).toThrow();
    expect(() => toggle('yoshi', true)).toThrow();
    expect(() => always('sup').maybe('yo', true).toggle('blop', false)).toThrow();
  });
});
