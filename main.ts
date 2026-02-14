import * as readline from "readline";
import NFA from "./fragments/NFA.js";
import RecursiveParser from "./parsers/RecursiveParser.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let currentNFA: NFA | null = null;
let currentRegex: string = "";

// ANSI color codes
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  reset: "\x1b[0m",
};

async function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function promptForRegex() {
  rl.question("\nEnter regex pattern or 'exit': ", async (regex) => {
    if (regex.toLowerCase() === "exit") {
      rl.close();
      process.exit(0);
    }

    try {
      const parser = new RecursiveParser();
      currentNFA = parser.parse(regex);
      currentRegex = regex;
      console.log(
        `${colors.green}Regex compiled successfully: ${regex}${colors.reset}`,
      );
      await testLoop();
    } catch (error: any) {
      console.error(
        `${colors.red}Error compiling regex: ${error.message}${colors.reset}`,
      );
      await promptForRegex();
    }
  });
}

async function testLoop() {
  while (true) {
    const input = await question(`\nTest string - 'new' or 'exit': `);

    if (input.toLowerCase() === "exit") {
      rl.close();
      process.exit(0);
    }

    if (input.toLowerCase() === "new") {
      await promptForRegex();
      return;
    }

    if (currentNFA) {
      const result = currentNFA.test(input);
      const padding = " ".repeat(10);
      if (result) {
        process.stdout.write(
          `\x1b[1A\x1b[2K\r${input}${padding}${colors.green}Valid${colors.reset}\n`,
        );
      } else {
        process.stdout.write(
          `\x1b[1A\x1b[2K\r${input}${padding}${colors.red}Invalid${colors.reset}\n`,
        );
      }
    }
  }
}

async function main() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║   Regex NFA Matcher - Interactive CLI  ║");
  console.log("╚════════════════════════════════════════╝");
  console.log("\nSupported regex syntax:");
  console.log("  • Literals: a, b, 1, 2, etc.");
  console.log("  • Concatenation: abc");
  console.log("  • Union: a|b");
  console.log("  • Star: a*");
  console.log("  • Plus: a+");
  console.log("  • Optional: a?");
  console.log("  • Grouping: (ab)*");
  console.log("  • Character class: [a-zA-Z0-9], \\w, \\d, \\s");

  await promptForRegex();
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
