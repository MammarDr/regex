import { Union } from "./NFA";

export default class State {
  private transitionsMap: Map<string, Array<State>>;
  private isFinal: boolean;
  public isNegation: boolean;
  constructor({
    transitionsMap,
    isFinal = false,
    isNegation = false,
  }: {
    transitionsMap?: Map<string, Array<State>>;
    isFinal?: boolean;
    isNegation?: boolean;
  } = {}) {
    this.transitionsMap = transitionsMap || new Map();
    this.isFinal = isFinal;
    this.isNegation = isNegation;
  }

  public getMap(): Map<string, Array<State>> {
    return this.transitionsMap;
  }

  public keys(): Array<string> {
    return [...this.transitionsMap.keys()];
  }

  public addTransition(symbol: string, state: State): void {
    const transition = this.transitionsMap.get(symbol);
    if (transition) transition.push(state);
    else this.transitionsMap.set(symbol, [state]);
  }

  public getTransition(symbol: string): Array<State> | undefined {
    return this.transitionsMap.get(symbol);
  }

  public hasTransition(symbol: string): boolean {
    return this.transitionsMap.has(symbol);
  }

  public isAcceptingState(): boolean {
    return this.isFinal;
  }

  public acceptingState(flag: boolean) {
    this.isFinal = flag;
  }

  public test(input: string) {
    let stack: Array<{ state: State; index: number }> = [
      { state: this, index: 0 },
    ];

    const addToStack = (symbol: string, index: number, state: State) => {
      state.getTransition(symbol!)?.forEach((s) => {
        stack.push({ state: s, index: index });
      });
    };

    const epsilonStates: Set<State> = new Set();

    while (stack.length > 0) {
      const { state, index: currIndex } = stack!.pop()!;

      // if (epsilonStates.has(state)) {
      //   epsilonStates.clear();
      //   continue;
      // }

      if (input.length === currIndex) {
        if (state.isAcceptingState()) return true;
        if (state.hasTransition("ϵ")) {
          addToStack("ϵ", currIndex, state);
          epsilonStates.add(state);
        }
        continue;
      }
      const symbol = input[currIndex]!;

      if (state.isNegation) {
        const transitions = state.getMap();
        if (transitions.size === 0 || transitions.has(symbol)) continue;

        if (transitions.has("ϵ")) epsilonStates.add(state);
        const key = transitions.keys().next().value;
        addToStack(key!, currIndex + 1, state);

        continue;
      }

      if (state.hasTransition(symbol)) addToStack(symbol, currIndex + 1, state);
      if (state.hasTransition("ϵ")) {
        addToStack("ϵ", currIndex, state);
        epsilonStates.add(state);
      }
    }

    return false;
  }
}
