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

  static char(c: string, negation: boolean = false) {
    const s1 = new State({ isNegation: negation });
    const s2 = new State({ isFinal: true });
    s1.addTransition(c, s2);
    return new NFA(s1, s2);
  }

  static epsilon() {
    return NFA.char("ϵ");
  }

  static union(...fragments: Array<NFA>) {
    return new Union(...fragments);
  }

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

// export class Symbol extends NFA {
//   public isNegated : boolean;
//   constructor(c: string, negation: boolean = false) {
//     const s1 = new State({ isNegation: negation });
//     const s2 = new State({ isFinal: true });
//     s1.addTransition(c, s2);
//     super(s1, s2);
//   }
// }

// export class Concat extends NFA {
//   constructor(first: NFA, ...rest: Array<NFA>) {
//     for (const fragment of rest) {
//       first.out.acceptingState(false);
//       first.out.addTransition("ϵ", fragment.in);
//       fragment.out.acceptingState(true);
//       first = new NFA(first.in, fragment.out);
//     }
//     super(first.in, first.out);
//   }
// }

export class Union extends NFA {
  constructor(...fragments: Array<NFA>) {
    const s1 = new State();
    const s2 = new State({ isFinal: true });
    for (const fragment of fragments) {
      const transitions = fragment.in.getMap();
      for (const [key, states] of transitions) {
        states.forEach((s) => s1.addTransition(key, s));
      }

      fragment.out.acceptingState(false);
      fragment.out.addTransition("ϵ", s2);
    }
    super(s1, s2);
  }

  except(...fragments: Array<NFA>) {
    let start: State = this.in.getTransition("\¬")?.at(0)!;
    if (!start) {
      start = new State({ isNegation: true });
      this.in.addTransition("\¬", start);
    }

    for (const fragment of fragments) {
      const transitions = fragment.in.getMap();
      for (const [key, states] of transitions) {
        states.forEach((s) => start.addTransition(key, s));
      }

      fragment.out.acceptingState(false);
      fragment.out.addTransition("ϵ", this.out);
    }
    return this;
  }

  end() {
    if (!this.in.hasTransition("\¬")) return this;
    const map = this.in.getMap();
    map.set("ϵ", [...(map.get("ϵ") || []), ...map.get("\¬")!]);
    map.delete("\¬");
    return this;
  }
}

// export class Rep extends NFA {
//   constructor(fragment: NFA) {
//     const s1 = new State();
//     const s2 = new State({ isFinal: true });

//     s1.addTransition("ϵ", fragment.in);
//     s1.addTransition("ϵ", s2);
//     s2.addTransition("ϵ", fragment.in);
//     fragment.out.acceptingState(false);
//     fragment.out.addTransition("ϵ", s2);
//     super(s1, s2);
//   }
// }
