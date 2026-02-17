import NFA from "../fragments/NFA.js";
export default class RecursiveParser {
  private pointer: number;
  private input: Array<string | { token: string; value: string }>;

  private reservedChar = new Set([
    "|",
    "*",
    "+",
    "(",
    ")",
    "?",
    "[",
    "]",
    "-",
    "$",
    "^",
  ]);

  private getSpecialPattern(symbol: string, negated: boolean) {
    switch (symbol) {
      case "d":
        return [
          { token: "SYMBOL", value: "0", negated },
          "-",
          { token: "SYMBOL", value: "9" },
        ];
      case "w":
        return [
          { token: "SYMBOL", value: "a", negated },
          "-",
          { token: "SYMBOL", value: "z" },
          { token: "SYMBOL", value: "A", negated },
          "-",
          { token: "SYMBOL", value: "Z" },
          { token: "SYMBOL", value: "0", negated },
          "-",
          { token: "SYMBOL", value: "9" },
          { token: "SYMBOL", value: "_", negated },
        ];
      case "s":
        return [
          { token: "SYMBOL", value: " ", negated },
          { token: "SYMBOL", value: "\n", negated },
          { token: "SYMBOL", value: "\t", negated },
        ];
    }
  }

  private specialChar = new Set<string>(["d", "D", "w", "W", "s", "S"]);

  constructor() {
    this.pointer = 0;
    this.input = [];
  }

  parse(str: string) {
    this.pointer = 0;
    this.input = this.tokenize(str);
    return this.Expression();
  }

  private getTokenType(token: any): string {
    return typeof token === "string" ? token : token.token;
  }

  lookahead(withValue: true): {
    token: string;
    value: string;
    negated: boolean;
  };
  lookahead(withValue?: false): string;
  lookahead(withValue: boolean = false) {
    return withValue
      ? this.input[this.pointer]!
      : this.getTokenType(this.input[this.pointer]!);
  }

  consume(expect: string): string {
    if (this.input.length <= this.pointer)
      throw Error("Can't consume end of string");

    if (this.lookahead() !== expect)
      throw Error(
        "Can't consume " + this.lookahead() + " while epxecting " + expect,
      );

    const curr = this.input[this.pointer]!;
    this.pointer++;
    return typeof curr === "string" ? curr : curr.value;
  }

  Expression(): NFA {
    let left: NFA = this.Term();

    const elements: Array<NFA> = [];
    while (this.lookahead() === "|") {
      this.consume("|");
      const right: NFA = this.Term();
      elements.push(right);
    }
    if (elements.length > 0) left = NFA.union(left, ...elements);
    return left;
  }

  Term(): NFA {
    let left: NFA = this.Factor();

    while (
      (this.lookahead() != "EOS" && this.lookahead() === "SYMBOL") ||
      this.lookahead() === "DIGIT" ||
      this.lookahead() === "(" ||
      this.lookahead() === "["
    ) {
      const right: NFA = this.Factor();
      left = NFA.concat(left, right);
    }
    return left;
  }

  Factor(): NFA {
    let node: NFA = this.Base();
    const lookahead: string = this.lookahead();
    if (lookahead === "EOS") return node;

    if (lookahead === "*") {
      this.consume("*");
      return NFA.rep(node);
    }

    if (lookahead === "+") {
      this.consume("+");
      return NFA.concat(node, NFA.rep(node));
    }

    if (lookahead === "?") {
      this.consume("?");
      return NFA.union(node, NFA.epsilon());
    }

    return node;
  }

  CharacterClass() {
    const elements: NFA[] = [];
    const exeptions: NFA[] = [];

    while (this.lookahead() === "SYMBOL" || this.lookahead() === "^") {
      const item = this.ClassItem();

      if (item.negated) exeptions.push(...item.list);
      else elements.push(...item.list);
    }

    if (elements.length === 0 && exeptions.length === 0)
      throw Error("Invallid token after '[' : " + this.lookahead());

    const union = elements.length > 0 ? NFA.union(...elements) : NFA.union();
    return exeptions.length > 0 ? union.except(...exeptions).end() : union;
  }

  ClassItem() {
    if (this.lookahead() === "^") {
      this.consume("^");
      return { negated: true, list: [this.Literal()] };
    }

    const curr = this.lookahead(true);
    const left: NFA = this.Literal();

    if (this.lookahead() === "-") {
      this.consume("-");
      const right: NFA = this.Literal();
      return { negated: curr.negated, list: this.getRange(left, right) };
    }

    return { negated: curr.negated, list: [left] };
  }

  Base() {
    const symbol: string = this.lookahead();
    if (symbol === "EOS") throw Error("Can't consume EOS");

    if (symbol === "(") {
      this.consume("(");
      const node = this.Expression();
      this.consume(")");
      return node;
    }

    if (symbol === "[") {
      this.consume("[");
      const node = this.CharacterClass();
      this.consume("]");
      return node;
    }

    return this.Literal();
  }

  Literal() {
    const item = this.lookahead(true);
    if (this.getTokenType(item) === "SYMBOL") {
      return NFA.char(this.consume("SYMBOL"));
    }

    throw Error("' " + this.getTokenType(item) + "' " + "is not a Literal.");
  }

  getRange(leftLiteral: NFA, rightLiteral: NFA) {
    let left: string = leftLiteral.in.keys()[0]!;
    let right: string = rightLiteral.in.keys()[0]!;

    if (!left || !right) throw Error("Unexpected error!");

    if (
      (left >= "a" && right <= "z") ||
      (left >= "A" && right <= "Z") ||
      (left >= "0" && right <= "9")
    ) {
      const list = [];
      for (let i: number = left.charCodeAt(0); i <= right.charCodeAt(0); i++) {
        list.push(NFA.char(String.fromCharCode(i)));
      }
      return list;
    }

    throw Error(
      "Invalid range between " +
        this.input[this.pointer - 3] +
        "-" +
        this.input[this.pointer - 1],
    );
  }

  tokenize(str: string) {
    let input: Array<any> = [];
    let insideCharClass: boolean = false;

    for (let i = 0; i < str.length; i++) {
      const c: string = str[i]!;
      if (c === "[") insideCharClass = true;
      else if (c === "]") insideCharClass = false;

      if (this.reservedChar.has(c)) input.push(c);
      else if (c === "\\") {
        i++;
        if (i === str.length) throw Error("Symbol '\\' alone is not accepted.");
        if (this.reservedChar.has(str[i]!)) {
          input.push({ token: "SYMBOL", value: str[i] });
        } else if (this.specialChar.has(str[i]!)) {
          const negated = str[i] === "S" || str[i] === "D" || str[i] === "W";
          let pattern = this.getSpecialPattern(str[i]!.toLowerCase(), negated)!;
          if (!insideCharClass) {
            pattern = ["[", ...pattern, "]"];
          }
          pattern.forEach((t: any) => input.push(t));
        } else {
          throw Error("Symbol \\'" + str[i] + "' is not defined.");
        }
      } else {
        input.push({ token: "SYMBOL", value: c });
      }
    }

    input.push("EOS");
    return input;
  }
}
