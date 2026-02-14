export default class State {
  private transitionsMap: Map<string, Array<State>>;
  private isFinal: boolean;
  constructor({
    transitionsMap,
    isFinal = false,
  }: {
    transitionsMap?: Map<string, Array<State>>;
    isFinal?: boolean;
  } = {}) {
    this.transitionsMap = transitionsMap || new Map();
    this.isFinal = isFinal;
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

  public acceptingState(flag: boolean): boolean {
    return (this.isFinal = flag);
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

    while (stack.length > 0) {
      const { state, index: currIndex } = stack!.pop()!;

      if (input.length === currIndex) {
        if (state.isAcceptingState()) return true;
        if (state.hasTransition("ϵ")) {
          addToStack("ϵ", currIndex, state);
        }
        continue;
      }
      const symbol = input[currIndex]!;

      if (!state.hasTransition(symbol) && !state.hasTransition("ϵ")) {
        continue;
      }
      addToStack(symbol, currIndex + 1, state);
      addToStack("ϵ", currIndex, state);
    }

    return false;
  }
}
