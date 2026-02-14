import State from "./State.js";
export default class NFA {
  public in: State;
  public out: State;
  constructor(input: State, output: State) {
    this.in = input;
    this.out = output;
  }

  test(input: string) {
    return this.in.test(input);
  }

  static char(c: string) {
    const s1 = new State();
    const s2 = new State({ isFinal: true });
    s1.addTransition(c, s2);
    return new NFA(s1, s2);
  }

  static epsilon() {
    return NFA.char("ϵ");
  }

  static union(...rest: Array<NFA>) {
    const s1 = new State();
    const s2 = new State({ isFinal: true });
    for (const fragment of rest) {
      s1.addTransition("ϵ", fragment.in);
      fragment.out.acceptingState(false);
      fragment.out.addTransition("ϵ", s2);
    }
    return new NFA(s1, s2);
  }

  // static u(first: NFA, second: NFA) {
  //   first.out.acceptingState(false);
  //   first.out.addTransition("ϵ", second.in);
  //   second.out.acceptingState(true);
  //   return new NFA(first.in, second.out);
  // }

  static concat(first: NFA, ...rest: Array<NFA>) {
    if (rest.length === 0) return first;
    for (const fragment of rest) {
      first.out.acceptingState(false);
      first.out.addTransition("ϵ", fragment.in);
      fragment.out.acceptingState(true);
      first = new NFA(first.in, fragment.out);
    }
    return first;
  }

  static rep(fragment: NFA) {
    const s1 = new State();
    const s2 = new State({ isFinal: true });

    s1.addTransition("ϵ", fragment.in);
    s1.addTransition("ϵ", s2);
    fragment.out.acceptingState(false);
    fragment.out.addTransition("ϵ", s2);
    s2.addTransition("ϵ", fragment.in);
    return new NFA(s1, s2);
  }
}
