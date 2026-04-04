import inquirer from 'inquirer';

/**
 * In mobile mode, displays each instruction one at a time with a "Next" confirm prompt
 * so the user does not need to scroll back on a small screen.
 */
export async function showInstructionsOneByone(instructions: string[]): Promise<void> {
  for (let i = 0; i < instructions.length; i++) {
    console.log(`\n${instructions[i]}`);
    if (i < instructions.length - 1) {
      await inquirer.prompt([
        {
          type: 'confirm',
          name: 'next',
          message: 'Next instruction →',
          default: true,
        },
      ]);
    }
  }
  console.log();
}
