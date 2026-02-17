import { describe, test, it, expect } from "vitest";
import NFA from "../fragments/NFA";
import RecursiveParser from "../parsers/RecursiveParser";

const parser = new RecursiveParser();

describe("validate", () => {
  describe("char", () => {
    it("simple", () => {
      const frag = NFA.char("a");
      expect(frag.test("a")).toBeTruthy();
      expect(frag.test("b")).toBeFalsy();
    });

    it("star", () => {
      const frag = parser.parse("a*");
      expect(frag.test("")).toBeTruthy();
      expect(frag.test("a")).toBeTruthy();
      expect(frag.test("aaa")).toBeTruthy();
      expect(frag.test("b")).toBeFalsy();
    });

    it("plus", () => {
      const frag = parser.parse("a+");

      expect(frag.test("")).toBeFalsy();
      expect(frag.test("a")).toBeTruthy();
      expect(frag.test("aaa")).toBeTruthy();
      expect(frag.test("b")).toBeFalsy();
    });

    it("opt", () => {
      const frag = parser.parse("a?");

      expect(frag.test("")).toBeTruthy();
      expect(frag.test("a")).toBeTruthy();
      expect(frag.test("aa")).toBeFalsy();
      expect(frag.test("b")).toBeFalsy();
    });
  });

  describe("concat", () => {
    it("simple", () => {
      const frag = NFA.concat(NFA.char("a"), NFA.char("b"));

      expect(frag.test("ab")).toBeTruthy();
      expect(frag.test("a")).toBeFalsy();
      expect(frag.test("b")).toBeFalsy();
    });

    it("complex", () => {
      const frag = NFA.concat(
        NFA.char("a"),
        NFA.concat(NFA.char("b"), NFA.char("c")),
      );

      expect(frag.test("abc")).toBeTruthy();
      expect(frag.test("ab")).toBeFalsy();
      expect(frag.test("a")).toBeFalsy();
      expect(frag.test("b")).toBeFalsy();
    });
  });

  describe("union", () => {
    it("simple", () => {
      const frag = NFA.union(NFA.char("a"), NFA.char("b"));

      expect(frag.test("a")).toBeTruthy();
      expect(frag.test("b")).toBeTruthy();
      expect(frag.test("c")).toBeFalsy();
    });

    it("complex", () => {
      const frag = NFA.union(
        NFA.char("a"),
        NFA.union(NFA.char("b"), NFA.char("c")),
      );

      expect(frag.test("a")).toBeTruthy();
      expect(frag.test("b")).toBeTruthy();
      expect(frag.test("c")).toBeTruthy();
      expect(frag.test("d")).toBeFalsy();
    });
  });

  describe("rep", () => {
    it("simple", () => {
      const frag = NFA.rep(NFA.char("a"));

      expect(frag.test("")).toBeTruthy();
      expect(frag.test("a")).toBeTruthy();
      expect(frag.test("aa")).toBeTruthy();
      expect(frag.test("b")).toBeFalsy();
    });

    it("complex", () => {
      const frag = NFA.rep(NFA.concat(NFA.char("a"), NFA.char("b")));

      expect(frag.test("")).toBeTruthy();
      expect(frag.test("ab")).toBeTruthy();
      expect(frag.test("abab")).toBeTruthy();
      expect(frag.test("ababa")).toBeFalsy();
      expect(frag.test("ababb")).toBeFalsy();
      expect(frag.test("aba")).toBeFalsy();
    });
  });

  describe("negation", () => {
    describe("char", () => {
      it("single", () => {
        const frag = NFA.char("a", true);
        expect(frag.test("a")).toBeFalsy();
        expect(frag.test("A")).toBeTruthy();
        expect(frag.test("bb")).toBeFalsy();
        expect(frag.test("b")).toBeTruthy();
        expect(frag.test("c")).toBeTruthy();
        expect(frag.test("1")).toBeTruthy();
        expect(frag.test("@")).toBeTruthy();
      });
      it("star", () => {
        // [^a]*
        const frag = NFA.rep(NFA.char("a", true));
        expect(frag.test("")).toBeTruthy();
        expect(frag.test("a")).toBeFalsy();
        expect(frag.test("aaaaabaaaa")).toBeFalsy();
        expect(frag.test("bfsq4546@")).toBeTruthy();
        expect(frag.test("cfz5")).toBeTruthy();
        expect(frag.test("10")).toBeTruthy();
        expect(frag.test("@")).toBeTruthy();
      });
      it("plus", () => {
        // [^a]+
        const frag = NFA.concat(
          NFA.char("a", true),
          NFA.rep(NFA.char("a", true)),
        );
        expect(frag.test("")).toBeFalsy();
        expect(frag.test("a")).toBeFalsy();
        expect(frag.test("aaaaaaaaa")).toBeFalsy();
        expect(frag.test("@zae")).toBeFalsy();
        expect(frag.test("ba")).toBeFalsy();
        expect(frag.test("sqssc")).toBeTruthy();
        expect(frag.test("1846")).toBeTruthy();
      });
      it("opt", () => {
        // [^a]?
        const frag = NFA.union(NFA.epsilon()).except(NFA.char("a")).end();
        expect(frag.test("")).toBeTruthy();
        expect(frag.test("a")).toBeFalsy();
        expect(frag.test("b")).toBeTruthy();
        expect(frag.test("c")).toBeTruthy();
        expect(frag.test("1")).toBeTruthy();
        expect(frag.test("@")).toBeTruthy();
      });
    });

    describe("concat", () => {
      it("simple", () => {
        const frag = NFA.concat(
          NFA.char("a", true),
          NFA.char("b", true),
          NFA.char("c", true),
        );
        expect(frag.test("abc")).toBeFalsy();
        expect(frag.test("bbb")).toBeFalsy();
        expect(frag.test("aac")).toBeFalsy();
        expect(frag.test("cba")).toBeFalsy();
        expect(frag.test("ABC")).toBeTruthy();
        expect(frag.test("cab")).toBeTruthy();
        expect(frag.test("568")).toBeTruthy();
        expect(frag.test("On@")).toBeTruthy();
      });
    });

    describe("union", () => {
      it("simple", () => {
        const frag = NFA.union().except(NFA.char("a")).end();
        expect(frag.test("a")).toBeFalsy();
        expect(frag.test("b")).toBeTruthy();
        expect(frag.test("5")).toBeTruthy();
      });
    });
  });
});
