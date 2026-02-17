# Regex NFA Matcher

A TypeScript implementation of a regex engine using Non-deterministic Finite Automata (NFA). Features a recursive descent parser that compiles regex patterns into NFAs and a CLI for testing.

## Features

- **Regex Pattern Support**
  - Literals: `a`, `b`, `1`, `2`
  - Concatenation: `abc`
  - Union (alternation): `a|b`
  - Kleene star: `a*`
  - Plus: `a+`
  - Optional: `a?`
  - Grouping: `(ab)*`
  - Character classes: `[abc]`, `[a-z]`, `[A-Z]`, `[0-9]`, `[^a]`
  - Sugar Syntax: `\w`, `\d`, `\s`, `\W`, `\D`, `\S`

## Installation

```bash
npm install
```

## Usage

```bash
npm run build
```

Compiles TypeScript to JavaScript in `dist/` directory.

### Interactive CLI

```bash
npm start
```

Example:

```
Enter regex pattern (or 'exit' to quit): a*b+

Test: aaabbb - Valid

Test: bbb - Valid

Test: aaa - Invalid
```

### Build

## Project Structure

```
.
├── fragments/
│   ├── NFA.ts          # NFA construction and operations
│   └── State.ts        # State machine implementation
├── parsers/
│   ├── recursive.template       # notes about regex to abstract syntax tree
│   └── RecursiveParser.ts  # Recursive descent regex parser
├── __tests__/
│   ├── parser.test.jsx     # Parser tests
│   └── validate.test.jsx   # NFA validation tests
├── main.ts             # CLI entry point
├── package.json
└── tsconfig.json
```

## Development

### Run Tests

```bash
npm test
```

## How It Works

1. **Parsing**: The recursive descent parser tokenizes and parses regex patterns into an NFA using semantic actions.
2. **Matching**: Input strings are tested against the NFA by traversing states and following epsilon transitions

## Author

MammarDr
