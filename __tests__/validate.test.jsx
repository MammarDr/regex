import { describe, test, it, expect } from "vitest";
import NFA from "../fragments/NFA";

describe("validate", () => {
  describe("char", () => {
    it("simple", () => {
      // Arrange
      const c = NFA.char("a");
      // Assign
      expect(c.test("a")).toBeTruthy();
      expect(c.test("b")).toBeFalsy();
    });
  });
  describe("concat", () => {
    it("simple", () => {
      // Arrange
      const c = NFA.concat(NFA.char("a"), NFA.char("b"));
      // Assign
      expect(c.test("ab")).toBeTruthy();
      expect(c.test("a")).toBeFalsy();
      expect(c.test("b")).toBeFalsy();
    });

    it("complex", () => {
      // Arrange
      const c = NFA.concat(
        NFA.char("a"),
        NFA.concat(NFA.char("b"), NFA.char("c")),
      );
      // Assign
      expect(c.test("abc")).toBeTruthy();
      expect(c.test("ab")).toBeFalsy();
      expect(c.test("a")).toBeFalsy();
      expect(c.test("b")).toBeFalsy();
    });
  });

  describe("union", () => {
    it("simple", () => {
      // Arrange
      const c = NFA.union(NFA.char("a"), NFA.char("b"));
      // Assign
      expect(c.test("a")).toBeTruthy();
      expect(c.test("b")).toBeTruthy();
      expect(c.test("c")).toBeFalsy();
    });

    it("complex", () => {
      // Arrange
      const c = NFA.union(
        NFA.char("a"),
        NFA.union(NFA.char("b"), NFA.char("c")),
      );
      // Assign
      expect(c.test("a")).toBeTruthy();
      expect(c.test("b")).toBeTruthy();
      expect(c.test("c")).toBeTruthy();
      expect(c.test("d")).toBeFalsy();
    });
  });

  describe("rep", () => {
    it("simple", () => {
      // Arrange
      const c = NFA.rep(NFA.char("a"));
      // Assign
      expect(c.test("")).toBeTruthy();
      expect(c.test("a")).toBeTruthy();
      expect(c.test("aa")).toBeTruthy();
      expect(c.test("b")).toBeFalsy();
    });

    it("complex", () => {
      // Arrange
      const c = NFA.rep(NFA.concat(NFA.char("a"), NFA.char("b")));
      // Assign
      expect(c.test("")).toBeTruthy();
      expect(c.test("ab")).toBeTruthy();
      expect(c.test("abab")).toBeTruthy();
      expect(c.test("ababa")).toBeFalsy();
      expect(c.test("ababb")).toBeFalsy();
      expect(c.test("aba")).toBeFalsy();
    });
  });
});
