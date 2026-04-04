import inquirer from 'inquirer';
import { showInstructionsOneByone } from './wizardUtils';

export type FrontStepId =
  | 'pre_check'
  | 'height'
  | 'angle'
  | 'l_limit'
  | 'cable_tension'
  | 'h_limit'
  | 'friction_check';

export interface FrontTuningStep {
  id: FrontStepId;
  title: string;
  instructions: string[];
  validationQuestion: string;
  troubleshootingTips: string[];
  toolsRequired?: string[];
  safetyWarning?: string;
}

export interface FrontWizardResult {
  completedSteps: FrontStepId[];
  skippedSteps: FrontStepId[];
  notes: string[];
}

export const FRONT_STEPS: FrontTuningStep[] = [
  {
    id: 'pre_check',
    title: 'Pre-Check: Inspection & Cleaning',
    toolsRequired: ['4 mm or 5 mm hex key (clamp/mount bolt)', 'Chain cleaning solvent', 'Lint-free rag'],
    instructions: [
      '1. Inspect the front derailleur clamp or braze-on mount — it must be tight with no play.',
      '2. Check the shift cable for fraying, kinks, or corrosion. Replace if worn.',
      '3. Inspect the cable housing for cracks. Replace if damaged.',
      '4. Clean the front derailleur cage inside and out — old grease attracts grime.',
      '5. Lightly lube the pivot points on the cage arms.',
    ],
    validationQuestion:
      'Is the derailleur mount secure, cable in good condition, and cage clean?',
    troubleshootingTips: [
      'A loose mount causes the cage to twist under load — always check this first.',
      'Corroded cables create sticky, inconsistent shifts.',
    ],
  },
  {
    id: 'height',
    title: 'Height Adjustment',
    toolsRequired: ['4 mm or 5 mm hex key (clamp bolt)', 'Feeler gauge or ruler (1–3 mm reference)'],
    instructions: [
      '1. Look at the front derailleur from the side with the chain on the large chainring.',
      '2. The outer cage plate should sit 1–3 mm ABOVE the tallest teeth of the large chainring.',
      '3. Loosen the clamp bolt slightly to adjust height up or down.',
      '4. Re-tighten the clamp bolt once the correct height is achieved.',
      '5. Spin the cranks — the chain must NOT contact the cage on the large ring.',
    ],
    validationQuestion:
      'Is the outer cage plate 1–3 mm above the large chainring teeth with no chain contact?',
    troubleshootingTips: [
      'Too high: sluggish shifting and possible chain drop.',
      'Too low: the cage contacts the chain on the large ring, creating friction and noise.',
      'Use a feeler gauge or business card as a 1–2 mm reference.',
    ],
  },
  {
    id: 'angle',
    title: 'Angle (Rotational Alignment)',
    toolsRequired: ['4 mm or 5 mm hex key (clamp bolt)'],
    instructions: [
      '1. Look down at the front derailleur cage from above.',
      '2. The outer cage plate should run PARALLEL to the large chainring (within 1–2°).',
      '3. Loosen the clamp bolt slightly and rotate the derailleur body to align.',
      '4. Re-tighten once parallel alignment is achieved.',
      '5. Verify from above: cage plate and chainring teeth should look parallel.',
    ],
    validationQuestion:
      'Does the outer cage plate run parallel to the large chainring when viewed from above?',
    troubleshootingTips: [
      'Misalignment causes friction on one side of the cage during pedaling.',
      'Even 3–4° off can cause chain rub on the inner or outer plate in every gear.',
    ],
  },
  {
    id: 'l_limit',
    title: 'L-Limit Screw (Small Chainring)',
    toolsRequired: ['Small Phillips or flat-head screwdriver (check derailleur label)'],
    safetyWarning:
      '⚠️  SAFETY: If the L-limit is set too loose the chain can drop off the inner chainring toward the frame, potentially jamming the drivetrain. Verify before riding.',
    instructions: [
      '1. Shift to the small chainring and the largest rear cog.',
      '2. Locate the L-limit screw (usually marked "L" on the derailleur body).',
      '3. The inner cage plate should clear the chain by approximately 1 mm — just no contact.',
      '4. Turn the L screw CLOCKWISE to move the cage outward (away from the frame).',
      '5. Turn COUNTER-CLOCKWISE to allow the cage to move inward.',
      '6. Goal: chain clears the inner plate in small ring with no rub.',
    ],
    validationQuestion:
      'Does the chain clear the inner cage plate in the small ring / large cog combination without rubbing?',
    troubleshootingTips: [
      'If the chain rubs the inner plate, turn the L screw clockwise 1/4 turn.',
      'If shifting to the small ring is sluggish, loosen the L screw slightly.',
      'Check this in both the largest and second-largest rear cogs.',
    ],
  },
  {
    id: 'cable_tension',
    title: 'Cable Tension Reset',
    toolsRequired: ['4 mm or 5 mm hex key (cable anchor bolt)'],
    instructions: [
      '1. Shift to the small chainring.',
      '2. Loosen the cable anchor bolt at the derailleur.',
      '3. Pull the cable taut by hand — not excessively tight, just snug.',
      '4. Re-clamp the cable anchor bolt firmly.',
      '5. Set the barrel adjuster (at shifter or frame stop) to mid-range for fine-tuning.',
      '6. Shift the chain to the large chainring — it should move fully without hesitation.',
    ],
    validationQuestion:
      'Is the cable clamped firmly, and does the chain shift up to the large ring cleanly?',
    troubleshootingTips: [
      'Too little tension: chain hesitates to shift up to the large ring.',
      'Too much tension: chain over-shifts or is slow to return to small ring.',
      'Re-clamp with more tension if the chain will not reach the large ring.',
    ],
  },
  {
    id: 'h_limit',
    title: 'H-Limit Screw (Large Chainring)',
    toolsRequired: ['Small Phillips or flat-head screwdriver (check derailleur label)'],
    safetyWarning:
      '⚠️  SAFETY: Over-tightening the H-limit can cause the chain to skip back off the large ring under pedalling load. Test under power before race day.',
    instructions: [
      '1. Shift to the large chainring and the smallest rear cog.',
      '2. Locate the H-limit screw (usually marked "H" on the derailleur body).',
      '3. The outer cage plate should clear the chain by approximately 1 mm — no contact.',
      '4. Turn the H screw CLOCKWISE to move the cage inward (toward the frame).',
      '5. Turn COUNTER-CLOCKWISE to allow the cage to move outward.',
      '6. Goal: chain sits on large ring with no rub on the outer plate.',
    ],
    validationQuestion:
      'Does the chain clear the outer cage plate in the large ring / small cog combination without rubbing?',
    troubleshootingTips: [
      'If the chain rubs the outer plate, turn the H screw clockwise 1/4 turn.',
      'If the chain struggles to shift to the large ring, loosen the H screw or add cable tension.',
      'Over-tightening the H screw can cause the chain to skip back down under power.',
    ],
  },
  {
    id: 'friction_check',
    title: 'Friction-Rub Avoidance Check',
    toolsRequired: ['No tools required — barrel adjuster adjusted by hand'],
    instructions: [
      '1. Shift to the LARGE chainring and LARGE rear cog (cross-chain inner position).',
      '2. Pedal slowly and listen for chain rub on the inner cage plate.',
      '3. Shift to the SMALL chainring and SMALL rear cog (cross-chain outer position).',
      '4. Pedal slowly and listen for chain rub on the outer cage plate.',
      '5. These extreme cross-chain positions will have some rub — that is normal.',
      '6. Verify there is NO rub in all NORMAL riding gear combinations (small-small/medium, large-medium/small).',
      '7. Use the barrel adjuster for micro-adjustments if slight rub occurs in normal combinations.',
    ],
    validationQuestion:
      'Is the chain rub-free in all normal riding gear combinations (avoiding extreme cross-chain positions)?',
    troubleshootingTips: [
      'Slight rub in extreme cross-chain is acceptable — advise the rider to avoid those combinations.',
      'Persistent rub in normal gears: micro-adjust the barrel adjuster 1/8 turn at a time.',
      'If rub only occurs under pedaling load, recheck the mount for looseness.',
      'A new cable can stretch in the first few rides — re-tension after the first test ride.',
    ],
  },
];

/**
 * Front Derailleur Tuning Wizard
 * Guides users through height, angle, cable tension, and limit screws
 * with friction-rub avoidance checks.
 */
export class FrontDerailleurWizard {
  private result: FrontWizardResult = {
    completedSteps: [],
    skippedSteps: [],
    notes: [],
  };

  private mobileMode: boolean;

  constructor(options: { mobileMode?: boolean } = {}) {
    this.mobileMode = options.mobileMode ?? false;
  }

  /**
   * Run the full wizard, optionally starting from a specific step.
   * @param startFrom - The step ID to begin from (default: first step)
   */
  async start(startFrom?: FrontStepId): Promise<FrontWizardResult> {
    if (this.mobileMode) {
      console.log('\n== FRONT DERAILLEUR WIZARD (Mobile) ==\n');
    } else {
      console.log('\n========================================');
      console.log('  FRONT DERAILLEUR TUNING WIZARD');
      console.log('========================================\n');
      console.log(
        'This wizard will guide you through height, angle, cable tension, and limit adjustments.\n'
      );
    }

    const startIndex = startFrom
      ? FRONT_STEPS.findIndex((s) => s.id === startFrom)
      : 0;

    if (startFrom && startIndex === -1) {
      throw new Error(`Unknown step ID: ${startFrom}`);
    }

    if (startIndex > 0) {
      console.log(`Starting from step: "${FRONT_STEPS[startIndex].title}"\n`);
    }

    for (let i = startIndex; i < FRONT_STEPS.length; i++) {
      const step = FRONT_STEPS[i];
      const shouldContinue = await this.runStep(step, i - startIndex + 1, FRONT_STEPS.length - startIndex);
      if (!shouldContinue) {
        console.log('\nWizard exited early. Steps completed so far:');
        this.printSummary();
        return this.result;
      }
    }

    console.log('\n✅ Front derailleur tuning complete!');
    this.printSummary();
    return this.result;
  }

  private async runStep(step: FrontTuningStep, current: number, total: number): Promise<boolean> {
    console.log(`\n--- Step ${current} of ${total}: ${step.title} ---\n`);

    if (step.safetyWarning) {
      console.log(`${step.safetyWarning}\n`);
    }

    if (step.toolsRequired && step.toolsRequired.length > 0) {
      console.log('🛠️  Tools needed for this step:');
      step.toolsRequired.forEach((tool) => console.log(`   • ${tool}`));
      console.log();

      if (this.mobileMode) {
        await inquirer.prompt([
          {
            type: 'confirm',
            name: 'toolsReady',
            message: 'Do you have the required tools ready?',
            default: true,
          },
        ]);
      }
    }

    if (this.mobileMode) {
      await this.showInstructionsOneByone(step.instructions);
    } else {
      step.instructions.forEach((line) => console.log(line));
      console.log();
    }

    let validated = false;
    let attempts = 0;

    while (!validated) {
      attempts++;
      const { passed } = await inquirer.prompt<{ passed: boolean }>([
        {
          type: 'confirm',
          name: 'passed',
          message: `✔ Checkpoint: ${step.validationQuestion}`,
          default: true,
        },
      ]);

      if (passed) {
        validated = true;
        this.result.completedSteps.push(step.id);
        console.log(`  ✅ Step validated.\n`);
      } else {
        console.log('\n  ⚠️  Troubleshooting tips:');
        step.troubleshootingTips.forEach((tip) => console.log(`     • ${tip}`));
        console.log();

        if (attempts >= 3) {
          const { action } = await inquirer.prompt<{ action: string }>([
            {
              type: 'list',
              name: 'action',
              message: 'Still having trouble. What would you like to do?',
              choices: [
                { name: 'Review step instructions again', value: 'retry' },
                { name: 'Skip this step and continue', value: 'skip' },
                { name: 'Exit wizard', value: 'exit' },
              ],
            },
          ]);

          if (action === 'skip') {
            this.result.skippedSteps.push(step.id);
            this.result.notes.push(`Step "${step.title}" was skipped after ${attempts} attempts.`);
            console.log(`  ⏭  Step skipped.\n`);
            return true;
          } else if (action === 'exit') {
            return false;
          } else {
            console.log(`\n--- Re-reading: ${step.title} ---\n`);
            if (this.mobileMode) {
              await this.showInstructionsOneByone(step.instructions);
            } else {
              step.instructions.forEach((line) => console.log(line));
              console.log();
            }
          }
        }
      }
    }

    return true;
  }

  /**
   * In mobile mode, show each instruction one at a time with a "Next" prompt
   * so the user does not need to scroll back on a small screen.
   */
  private async showInstructionsOneByone(instructions: string[]): Promise<void> {
    await showInstructionsOneByone(instructions);
  }

  private printSummary(): void {
    console.log('\n--- Summary ---');
    if (this.result.completedSteps.length > 0) {
      console.log('Completed:', this.result.completedSteps.join(', '));
    }
    if (this.result.skippedSteps.length > 0) {
      console.log('Skipped:', this.result.skippedSteps.join(', '));
    }
    if (this.result.notes.length > 0) {
      console.log('Notes:');
      this.result.notes.forEach((n) => console.log(`  - ${n}`));
    }
  }
}

export default FrontDerailleurWizard;
