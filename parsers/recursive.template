export default class Parser {
  private pointer: number;
  private input: Array<string | { token: string; value: string }>;

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

  lookahead(): string {
    return this.getTokenType(this.input[this.pointer]!);
  }

  consume(expect: string) {
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

  Expression() {
    let node: any = this.Term();

    if (this.lookahead() === "|") {
      this.consume("|");
      const right = this.Term();
      node = {
        type: "union",
        left: node,
        right: right,
      };
    }

    return node;
  }

  Term() {
    let node: any = this.Factor();
    if (this.lookahead() === "$") return node;

    while (
      this.lookahead() === "ALPHA" ||
      this.lookahead() === "DIGIT" ||
      this.lookahead() === "(" ||
      this.lookahead() === "["
    ) {
      const right = this.Factor();
      node = {
        type: "concat",
        left: node,
        right: right,
      };

      if (this.lookahead() === "$") return node;
    }
    return node;
  }

  Factor() {
    let node: any = this.Base();
    const lookahead = this.lookahead();
    if (lookahead === "$") return node;

    if (lookahead === "*") {
      this.consume("*");
      node = {
        type: "rep",
        expr: node,
      };
    }

    if (lookahead === "+") {
      this.consume("+");
      node = {
        type: "concat",
        left: node,
        right: {
          type: "rep",
          expr: node,
        },
      };
    }

    if (lookahead === "?") {
      this.consume("?");
      node = {
        type: "union",
        left: node,
        right: {
          type: "epsilon",
        },
      };
    }
    return node;
  }

  CharacterClass() {
    const elements = [];

    elements.push(this.ClassItem());

    while (this.lookahead() === "ALPHA" || this.lookahead() === "DIGIT") {
      elements.push(this.ClassItem());
    }

    return {
      type: "class",
      elements,
    };
  }

  ClassItem() {
    const left = this.Literal();

    if (this.lookahead() === "-") {
      this.consume("-");
      const right = this.Literal();
      return this.getRange(left, right);
    }

    return left;
  }

  Base() {
    const symbol: string = this.lookahead();
    if (symbol === "$") throw Error("Can't consume EOS");

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
    const symbol = this.lookahead();
    if (symbol === "ALPHA" || symbol === "DIGIT") {
      return { type: "symbol", value: this.consume(symbol) };
    }

    throw Error(symbol + "is not a Literal.");
  }

  isAlpha(symbol: string) {
    return /^[a-zA-Z]$/.test(symbol);
  }

  isDigit(symbol: string) {
    return /^[0-9]$/.test(symbol);
  }

  getRange(left: { value: string }, right: { value: string }) {
    if (left.value === "a" && right.value === "z") {
      return {
        type: "range",
        from: { type: "symbol", value: "a" },
        to: { type: "symbol", value: "z" },
      };
    }
    if (left.value === "A" && right.value === "Z") {
      return {
        type: "range",
        from: { type: "symbol", value: "A" },
        to: { type: "symbol", value: "Z" },
      };
    }
    if (left.value === "0" && right.value === "9") {
      return {
        type: "range",
        from: { type: "symbol", value: "0" },
        to: { type: "symbol", value: "9" },
      };
    }

    throw Error("Invalid range between " + left.value + "-" + right.value);
  }

  tokenize(str: string) {
    let input: Array<any> = [];
    const errors: Array<string> = [];
    for (const c of str) {
      if (
        c === "|" ||
        c === "*" ||
        c === "+" ||
        c === "(" ||
        c === ")" ||
        c === "?" ||
        c === "[" ||
        c === "]" ||
        c === "-"
      )
        input.push(c);
      else if (this.isAlpha(c)) input.push({ token: "ALPHA", value: c });
      else if (this.isDigit(c)) input.push({ token: "DIGIT", value: c });
      else {
        errors.push("token " + c + " is invalid!");
      }
    }
    if (errors.length > 0) {
      console.log(errors);
      throw Error("Failed to tokenize.");
    }
    input.push("$");
    return input;
  }
}
