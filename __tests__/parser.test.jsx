import { describe, it, expect } from "vitest";
import NFA from "../fragments/NFA";
import RecursiveParser from "../parsers/RecursiveParser";

// let o1 = x.parse("[a]");
// let o2 = x.parse("[abcde]");
// let o3 = x.parse("[a-z]");
// let o4 = x.parse("[A-Z]");
// let o5 = x.parse("[0-9]");
// try {
//   let o6 = x.parse("[a-Z]");
// } catch (e) {
//   console.log(e);
// }
// let o6 = x.parse("[0-9aZAa-zZbs]");

// let p = x.parse("a*(b*|z)|c*");
// let o = x.parse("");

describe("recursiveParser", () => {
  const parser = new RecursiveParser();
  it("simple", () => {
    const res = parser.parse("a");
    expect(res.test("a")).toBeTruthy();
    expect(res.test("b")).toBeFalsy();
    expect(res.test("")).toBeFalsy();
  });

  it("concat", () => {
    const res = parser.parse("ab");
    expect(res.test("ab")).toBeTruthy();
    expect(res.test("a")).toBeFalsy();
    expect(res.test("b")).toBeFalsy();
    expect(res.test("")).toBeFalsy();
  });

  it("union", () => {
    const res = parser.parse("a|b|c");
    expect(res.test("a")).toBeTruthy();
    expect(res.test("b")).toBeTruthy();
    expect(res.test("ab")).toBeFalsy();
    expect(res.test("")).toBeFalsy();
  });

  it("rep", () => {
    const res = parser.parse("a*");
    expect(res.test("")).toBeTruthy();
    expect(res.test("a")).toBeTruthy();
    expect(res.test("aa")).toBeTruthy();
    expect(res.test("b")).toBeFalsy();
  });

  it("plus", () => {
    const res = parser.parse("a+");
    expect(res.test("")).toBeFalsy();
    expect(res.test("a")).toBeTruthy();
    expect(res.test("aa")).toBeTruthy();
  });

  it("opt", () => {
    const res = parser.parse("a?");
    expect(res.test("")).toBeTruthy();
    expect(res.test("a")).toBeTruthy();
  });

  describe("bracket", () => {
    it("bracket", () => {
      const res = parser.parse("(a)");
      expect(res.test("a")).toBeTruthy();
    });

    it("bracket union", () => {
      const res = parser.parse(
        "(a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z)",
      );
      expect(res.test("a")).toBeTruthy();
      expect(res.test("b")).toBeTruthy();
      expect(res.test("v")).toBeTruthy();
      expect(res.test("z")).toBeTruthy();
    });

    it("concat", () => {
      const res = parser.parse("(ab)(ac)");
      expect(res.test("abac")).toBeTruthy();
      expect(res.test("ab")).toBeFalsy();
      expect(res.test("ac")).toBeFalsy();
    });

    it("rep", () => {
      const res = parser.parse("(a)*");
      expect(res.test("")).toBeTruthy();
      expect(res.test("a")).toBeTruthy();
      expect(res.test("aa")).toBeTruthy();
    });
  });

  describe("character class", () => {
    it("single", () => {
      const res = parser.parse("[a]");
      expect(res.test("a")).toBeTruthy();
      expect(res.test("b")).toBeFalsy();
    });

    it("multiple", () => {
      const res = parser.parse("[abc]");
      expect(res.test("a")).toBeTruthy();
      expect(res.test("b")).toBeTruthy();
      expect(res.test("c")).toBeTruthy();
      expect(res.test("d")).toBeFalsy();
    });

    it("char range", () => {
      const res = parser.parse("[a-z]");
      expect(res.test("a")).toBeTruthy();
      expect(res.test("m")).toBeTruthy();
      expect(res.test("z")).toBeTruthy();
      expect(res.test("A")).toBeFalsy();
      expect(res.test("1")).toBeFalsy();
    });
    it("minimal char range", () => {
      const res = parser.parse("[a-c]");
      expect(res.test("a")).toBeTruthy();
      expect(res.test("b")).toBeTruthy();
      expect(res.test("c")).toBeTruthy();
      expect(res.test("m")).toBeFalsy();
      expect(res.test("z")).toBeFalsy();
      expect(res.test("A")).toBeFalsy();
      expect(res.test("1")).toBeFalsy();
    });

    it("capitalize char range", () => {
      const res = parser.parse("[A-Z]");
      expect(res.test("A")).toBeTruthy();
      expect(res.test("O")).toBeTruthy();
      expect(res.test("V")).toBeTruthy();
      expect(res.test("a")).toBeFalsy();
      expect(res.test("1")).toBeFalsy();
    });
    it("minimal capitalize char range", () => {
      const res = parser.parse("[N-Z]");
      expect(res.test("N")).toBeTruthy();
      expect(res.test("O")).toBeTruthy();
      expect(res.test("Y")).toBeTruthy();
      expect(res.test("F")).toBeFalsy();
      expect(res.test("H")).toBeFalsy();
    });

    it("digits", () => {
      const res = parser.parse("[0-9]");
      expect(res.test("0")).toBeTruthy();
      expect(res.test("5")).toBeTruthy();
      expect(res.test("9")).toBeTruthy();
      expect(res.test("a")).toBeFalsy();
    });
    it("minimal digits", () => {
      const res = parser.parse("[0-5]");
      expect(res.test("0")).toBeTruthy();
      expect(res.test("5")).toBeTruthy();
      expect(res.test("2")).toBeTruthy();
      expect(res.test("8")).toBeFalsy();
    });
  });

  describe("sugar syntax", () => {
    it("\\w", () => {
      const res = parser.parse("\\w");
      expect(res.test("a")).toBeTruthy();
      expect(res.test("Z")).toBeTruthy();
      expect(res.test("5")).toBeTruthy();
      expect(res.test("_")).toBeTruthy();
      expect(res.test(" ")).toBeFalsy();
    });

    it("\\s", () => {
      const res = parser.parse("\\s");
      expect(res.test(" ")).toBeTruthy();
      expect(res.test("\t")).toBeFalsy();
      expect(res.test("a")).toBeFalsy();
      const res1 = parser.parse("\\s+");
      expect(res1.test("\n")).toBeTruthy();
      expect(res1.test("\t")).toBeTruthy();
    });

    it("\\d", () => {
      const res = parser.parse("\\d");
      expect(res.test("0")).toBeTruthy();
      expect(res.test("5")).toBeTruthy();
      expect(res.test("9")).toBeTruthy();
      expect(res.test("a")).toBeFalsy();
    });
  });

  it("complex", () => {
    const res = parser.parse("(a|b)*c");
    expect(res.test("c")).toBeTruthy();
    expect(res.test("ac")).toBeTruthy();
    expect(res.test("bc")).toBeTruthy();
    expect(res.test("abc")).toBeTruthy();
    expect(res.test("aababc")).toBeTruthy();
    expect(res.test("aaaaaaaaabbbbbbbbbbc")).toBeTruthy();
    expect(res.test("")).toBeFalsy();
  });

  it("complex 2", () => {
    const res = parser.parse("(a|b)*c(a|b)*");
    expect(res.test("c")).toBeTruthy();
    expect(res.test("ac")).toBeTruthy();
    expect(res.test("bc")).toBeTruthy();
    expect(res.test("abc")).toBeTruthy();
    expect(res.test("aababc")).toBeTruthy();
    expect(res.test("aaaaaaaaaabbbbbbbcaaaaaabbbbbbb")).toBeTruthy();
    expect(res.test("aaaaaaaaaabbbbbbbc")).toBeTruthy();
    expect(res.test("")).toBeFalsy();
  });

  it("complex 3", () => {
    const res = parser.parse("(a*|b+)c?(a|b)*d?");
    expect(res.test("")).toBeTruthy();
    expect(res.test("a")).toBeTruthy();
    expect(res.test("b")).toBeTruthy();
    expect(res.test("c")).toBeTruthy();
    expect(res.test("d")).toBeTruthy();
    expect(res.test("ab")).toBeTruthy();
    expect(res.test("bbbbbbbaaaaaaad")).toBeTruthy();
  });

  it("complex 4", () => {
    const res = parser.parse("(a|b)*c(a|b)*d(a|b)*");
    expect(res.test("cd")).toBeTruthy();
    expect(res.test("acd")).toBeTruthy();
    expect(res.test("bcd")).toBeTruthy();
    expect(res.test("abcd")).toBeTruthy();
    expect(res.test("aababcd")).toBeTruthy();
    expect(res.test("aaaaaaaaaabbbbbbbbcd")).toBeTruthy();
    expect(res.test("")).toBeFalsy();
  });

  it("complex 5", () => {
    const res = parser.parse("(abcd)f(ad)*|sc*(a|cd(a|d)*)");
    expect(res.test("abcd")).toBeFalsy();
    expect(res.test("abcdf")).toBeTruthy();
    expect(res.test("abcdfad")).toBeTruthy();
    expect(res.test("abcdfadad")).toBeTruthy();
    expect(res.test("sc")).toBeFalsy();
    expect(res.test("sca")).toBeTruthy();
    expect(res.test("scd")).toBeTruthy();
    expect(res.test("scda")).toBeTruthy();
    expect(res.test("scdd")).toBeTruthy();
    expect(res.test("scdda")).toBeTruthy();
    expect(res.test("scddd")).toBeTruthy();
  });
});
