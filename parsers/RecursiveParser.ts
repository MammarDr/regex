import NFA from "../fragments/NFA.js";
export default class RecursiveParser {
  private pointer: number;
  private input: Array<string | { token: string; value: string }>;

  private reservedChar = [
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
  ];

  private specialChar = new Map<string, Array<any>>([
    [
      "d",
      [
        "[",
        { token: "SYMBOL", value: "0" },
        "-",
        { token: "SYMBOL", value: "9" },
        "]",
      ],
    ],
    [
      "w",
      [
        "[",
        { token: "SYMBOL", value: "a" },
        "-",
        { token: "SYMBOL", value: "z" },
        { token: "SYMBOL", value: "A" },
        "-",
        { token: "SYMBOL", value: "Z" },
        { token: "SYMBOL", value: "0" },
        "-",
        { token: "SYMBOL", value: "9" },
        { token: "SYMBOL", value: "_" },
        "]",
      ],
    ],
    ["s", [{ token: "SYMBOL", value: " " }]],
    ["S", [{ token: "EXCEPTION", value: " " }]], // Implement this
  ]);

  constructor() {
    this.pointer = 0;
    this.input = [];
  }

  parse(str: string) {
    this.pointer = 0;
    this.input = this.tokenize(str);
    //console.log(this.input);
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

    while (this.lookahead() === "|") {
      this.consume("|");
      const right = this.Term();
      node = NFA.union(node, right);
    }

    return node;
  }

  Term() {
    let node: any = this.Factor();

    while (
      (this.lookahead() != "$" && this.lookahead() === "SYMBOL") ||
      this.lookahead() === "DIGIT" ||
      this.lookahead() === "(" ||
      this.lookahead() === "["
    ) {
      const right = this.Factor();
      node = NFA.concat(node, right);
    }
    return node;
  }

  Factor() {
    let node: any = this.Base();
    const lookahead = this.lookahead();
    if (lookahead === "$") return node;

    if (lookahead === "*") {
      this.consume("*");
      node = NFA.rep(node);
    }

    if (lookahead === "+") {
      this.consume("+");
      node = NFA.concat(node, NFA.rep(node));
    }

    if (lookahead === "?") {
      this.consume("?");
      node = NFA.union(node, NFA.epsilon());
    }
    return node;
  }

  CharacterClass() {
    const elements: NFA[] = [];

    while (this.lookahead() === "SYMBOL") {
      const item = this.ClassItem();
      if (item instanceof Array) {
        elements.push(...item);
      } else {
        elements.push(item);
      }
    }

    if (elements.length === 0)
      throw Error("Invallid token after '[' : " + this.lookahead());

    return NFA.union(...elements);
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
    const symbol = this.lookahead();
    if (symbol === "SYMBOL") {
      return NFA.char(this.consume(symbol));
    }

    throw Error("' " + symbol + "' " + "is not a Literal.");
  }

  getRange(leftLiteral: NFA, rightLiteral: NFA) {
    const left: string | undefined = leftLiteral.in.keys()[0];
    const right: string | undefined = rightLiteral.in.keys()[0];

    if (!left || !right) throw Error("Unexpected error!");

    if (
      (left >= "a" && right <= "z") ||
      (left >= "A" && right <= "Z") ||
      (left >= "0" && right <= "9")
    ) {
      const spawn = () => {
        const list = [];
        for (
          let i: number = left.charCodeAt(0);
          i <= right.charCodeAt(0);
          i++
        ) {
          list.push(NFA.char(String.fromCharCode(i)));
        }
        return list;
      };
      return spawn();
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

    for (let i = 0; i < str.length; i++) {
      const c: string = str[i]!;
      if (this.reservedChar.includes(c)) input.push(c);
      else if (c === "\\") {
        i++;
        if (i === str.length) throw Error("Symbol '\\' alone is not accepted.");
        if (this.reservedChar.includes(str[i]!)) {
          input.push({ token: "SYMBOL", value: str[i] });
        } else if (this.specialChar.has(str[i]!)) {
          this.specialChar.get(str[i]!)?.forEach((t: any) => {
            input.push(t);
          });
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
