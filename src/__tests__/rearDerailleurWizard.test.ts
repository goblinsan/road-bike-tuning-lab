import {
  REAR_STEPS,
  RearDerailleurWizard,
  WizardResult,
  RearStepId,
} from '../rearDerailleurWizard';

// Mock inquirer so tests don't require interactive input
jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

import inquirer from 'inquirer';
const mockPrompt = inquirer.prompt as jest.MockedFunction<typeof inquirer.prompt>;

describe('REAR_STEPS data', () => {
  it('contains all required step IDs in order', () => {
    const ids: RearStepId[] = REAR_STEPS.map((s) => s.id);
    expect(ids).toEqual([
      'pre_check',
      'h_limit',
      'l_limit',
      'cable_tension',
      'indexing',
      'b_screw',
      'validation',
    ]);
  });

  it('every step has a non-empty title and at least one instruction', () => {
    REAR_STEPS.forEach((step) => {
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.instructions.length).toBeGreaterThan(0);
      expect(step.validationQuestion.length).toBeGreaterThan(0);
      expect(step.troubleshootingTips.length).toBeGreaterThan(0);
    });
  });
});

describe('RearDerailleurWizard', () => {
  beforeEach(() => {
    mockPrompt.mockReset();
  });

  it('completes all steps when all checkpoints pass', async () => {
    // Return `passed: true` for every prompt
    mockPrompt.mockResolvedValue({ passed: true } as never);

    const wizard = new RearDerailleurWizard();
    const result: WizardResult = await wizard.start();

    expect(result.completedSteps).toHaveLength(REAR_STEPS.length);
    expect(result.skippedSteps).toHaveLength(0);
    expect(result.completedSteps).toEqual(REAR_STEPS.map((s) => s.id));
  });

  it('starts from a specific step when startFrom is provided', async () => {
    mockPrompt.mockResolvedValue({ passed: true } as never);

    const wizard = new RearDerailleurWizard();
    const result: WizardResult = await wizard.start('indexing');

    const expectedSteps: RearStepId[] = ['indexing', 'b_screw', 'validation'];
    expect(result.completedSteps).toEqual(expectedSteps);
  });

  it('records skipped steps when user chooses to skip after 3 failures', async () => {
    // Fail 3 times then skip
    mockPrompt
      .mockResolvedValueOnce({ passed: false } as never) // step 1 fail 1
      .mockResolvedValueOnce({ passed: false } as never) // step 1 fail 2
      .mockResolvedValueOnce({ passed: false } as never) // step 1 fail 3 → show extra prompt
      .mockResolvedValueOnce({ action: 'skip' } as never) // choose skip
      .mockResolvedValue({ passed: true } as never); // all remaining pass

    const wizard = new RearDerailleurWizard();
    const result: WizardResult = await wizard.start();

    expect(result.skippedSteps).toContain('pre_check');
    expect(result.notes.length).toBeGreaterThan(0);
    // Remaining steps should be completed
    expect(result.completedSteps).toContain('h_limit');
  });

  it('exits early when user chooses exit', async () => {
    mockPrompt
      .mockResolvedValueOnce({ passed: false } as never)
      .mockResolvedValueOnce({ passed: false } as never)
      .mockResolvedValueOnce({ passed: false } as never)
      .mockResolvedValueOnce({ action: 'exit' } as never);

    const wizard = new RearDerailleurWizard();
    const result: WizardResult = await wizard.start();

    // No steps completed or skipped — exited after 3 fails
    expect(result.completedSteps).toHaveLength(0);
    expect(result.skippedSteps).toHaveLength(0);
  });

  it('throws for an unknown startFrom step ID', async () => {
    const wizard = new RearDerailleurWizard();
    await expect(wizard.start('unknown_step' as RearStepId)).rejects.toThrow(
      'Unknown step ID: unknown_step'
    );
  });

  it('re-shows instructions when user chooses retry after 3 failures', async () => {
    mockPrompt
      .mockResolvedValueOnce({ passed: false } as never) // fail 1
      .mockResolvedValueOnce({ passed: false } as never) // fail 2
      .mockResolvedValueOnce({ passed: false } as never) // fail 3 → extra prompt
      .mockResolvedValueOnce({ action: 'retry' } as never) // retry
      .mockResolvedValueOnce({ passed: true } as never) // passes on re-try
      .mockResolvedValue({ passed: true } as never); // rest pass

    const wizard = new RearDerailleurWizard();
    const result: WizardResult = await wizard.start();

    expect(result.completedSteps).toContain('pre_check');
  });
});
