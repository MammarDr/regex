import { describe, it, expect } from "vitest";
import RecursiveParser from "../parsers/RecursiveParser";

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

  describe("negation", () => {
    it("negate single char", () => {
      const res = parser.parse("[^a]");
      expect(res.test("b")).toBeTruthy();
      expect(res.test("a")).toBeFalsy();
    });

    it("star", () => {
      // [^a]*
      const res = parser.parse("[^a]*");
      expect(res.test("")).toBeTruthy();
      expect(res.test("a")).toBeFalsy();
      expect(res.test("aaaaabaaaa")).toBeFalsy();
      expect(res.test("bfsq4546@")).toBeTruthy();
      expect(res.test("cfz5")).toBeTruthy();
      expect(res.test("10")).toBeTruthy();
      expect(res.test("@")).toBeTruthy();
    });
    it("plus", () => {
      // [^a]+
      const res = parser.parse("[^a]+");
      expect(res.test("")).toBeFalsy();
      expect(res.test("a")).toBeFalsy();
      expect(res.test("aaaaaaaaa")).toBeFalsy();
      expect(res.test("@zae")).toBeFalsy();
      expect(res.test("ba")).toBeFalsy();
      expect(res.test("sqssc")).toBeTruthy();
      expect(res.test("1846")).toBeTruthy();
    });
    it("opt", () => {
      // [^a]?
      const res = parser.parse("[^a]?");
      expect(res.test("")).toBeTruthy();
      expect(res.test("a")).toBeFalsy();
      expect(res.test("b")).toBeTruthy();
      expect(res.test("c")).toBeTruthy();
      expect(res.test("1")).toBeTruthy();
      expect(res.test("@")).toBeTruthy();
    });
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
    describe("word", () => {
      it("\\w", () => {
        const res = parser.parse("\\w");
        expect(res.test("a")).toBeTruthy();
        expect(res.test("Z")).toBeTruthy();
        expect(res.test("5")).toBeTruthy();
        expect(res.test("_")).toBeTruthy();
        expect(res.test(" ")).toBeFalsy();
      });

      it("\\w+", () => {
        const res1 = parser.parse("\\w+");
        expect(res1.test("aaabsqf")).toBeTruthy();
        expect(res1.test("Zasd8456")).toBeTruthy();
        expect(res1.test("5sfx99")).toBeTruthy();
      });

      it("[\\w]*", () => {
        const res = parser.parse("[\\w]*");
        expect(res.test("a")).toBeTruthy();
        expect(res.test("Aa")).toBeTruthy();
        expect(res.test(" ")).toBeFalsy();
      });

      it("\\W", () => {
        const res = parser.parse("\\W");
        expect(res.test("@")).toBeTruthy();
        expect(res.test(" ")).toBeTruthy();
        expect(res.test("a")).toBeFalsy();
        expect(res.test("Z")).toBeFalsy();
        expect(res.test("5")).toBeFalsy();
        expect(res.test("_")).toBeFalsy();
      });

      it("\\W+", () => {
        const res1 = parser.parse("\\W+");
        expect(res1.test("@@&é'=")).toBeTruthy();
        expect(res1.test("aaabsqf")).toBeFalsy();
        expect(res1.test("Zasd8456")).toBeFalsy();
        expect(res1.test("5sfx99")).toBeFalsy();
      });
      it("\\W*", () => {
        const res1 = parser.parse("\\W*a");
        expect(res1.test(" a")).toBeTruthy();
        expect(res1.test("@@&é'=")).toBeFalsy();
        expect(res1.test("aaabsqf")).toBeFalsy();
        expect(res1.test("Zasd8456")).toBeFalsy();
        expect(res1.test("5sfx99")).toBeFalsy();
      });
    });

    it("\\d", () => {
      const res = parser.parse("\\d");
      expect(res.test("0")).toBeTruthy();
      expect(res.test("5")).toBeTruthy();
      expect(res.test("9")).toBeTruthy();
      expect(res.test("a")).toBeFalsy();
    });

    it("\\D", () => {
      const res = parser.parse("\\D");
      expect(res.test("0")).toBeFalsy();
      expect(res.test("5")).toBeFalsy();
      expect(res.test("9")).toBeFalsy();
      expect(res.test("a")).toBeTruthy();
    });

    it("\\s", () => {
      const res = parser.parse("\\s");
      expect(res.test(" ")).toBeTruthy();
      expect(res.test("\t")).toBeTruthy();
      expect(res.test("\n")).toBeTruthy();
      expect(res.test("a")).toBeFalsy();
      const res1 = parser.parse("\\s+");
      expect(res1.test("     ")).toBeTruthy();
      expect(res1.test("\n\n\n")).toBeTruthy();
      expect(res1.test("\t\t\t")).toBeTruthy();
    });

    it("\\S", () => {
      const res = parser.parse("\\S");
      expect(res.test(" ")).toBeFalsy();
      expect(res.test("\t")).toBeFalsy();
      expect(res.test("\n")).toBeFalsy();
    });
  });

  describe("simple complex expressions", () => {
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

  describe("complex complex expressions", () => {
    it("character class with union", () => {
      const res = parser.parse("[a-z]+@[a-z]+");
      expect(res.test("hello@world")).toBeTruthy();
      expect(res.test("a@b")).toBeTruthy();
      expect(res.test("test123@email")).toBeFalsy();
    });

    it("word characters with digits", () => {
      const res = parser.parse("\\w+@\\w+");
      expect(res.test("user123@domain456")).toBeTruthy();
      expect(res.test("a@b")).toBeTruthy();
      expect(res.test("test@")).toBeFalsy();
    });

    it("digit range with optional", () => {
      const res = parser.parse("[0-9]{2}");
      expect(res.test("42")).toBeFalsy();
    });

    it("mixed character class and sugar", () => {
      const res = parser.parse("[a-zA-Z0-9_]+\.(com|org|net)");
      expect(res.test("user@example.com")).toBeFalsy();
      expect(res.test("example.com")).toBeTruthy();
      expect(res.test("test_123.org")).toBeTruthy();
    });

    it("space and non-word", () => {
      const res = parser.parse("\\w+\\s+\\W+");
      expect(res.test("hello !!!")).toBeTruthy();
      expect(res.test("test   @#$")).toBeTruthy();
      expect(res.test("nospace!!!")).toBeFalsy();
    });

    it("digit and non-digit combo", () => {
      const res = parser.parse("\\D*\\d+\\D*");
      expect(res.test("abc123def")).toBeTruthy();
      expect(res.test("123")).toBeTruthy();
      expect(res.test("abcdef")).toBeFalsy();
    });

    it("character class with repetition", () => {
      const res = parser.parse("[a-z]*[A-Z][a-z]*");
      expect(res.test("Hello")).toBeTruthy();
      expect(res.test("helloWorld")).toBeTruthy();
      expect(res.test("helloworld")).toBeFalsy();
      expect(res.test("A")).toBeTruthy();
      expect(res.test("abCde")).toBeTruthy();
    });

    it("complex whitespace pattern", () => {
      const res = parser.parse("[a-z]+\\s+[0-9]+");
      expect(res.test("hello 42")).toBeTruthy();
      expect(res.test("test  \t  999")).toBeTruthy();
      expect(res.test("hello42")).toBeFalsy();
    });
  });
});
