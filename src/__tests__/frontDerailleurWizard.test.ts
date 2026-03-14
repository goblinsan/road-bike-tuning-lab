import {
  FRONT_STEPS,
  FrontDerailleurWizard,
  FrontWizardResult,
  FrontStepId,
} from '../frontDerailleurWizard';

jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

import inquirer from 'inquirer';
const mockPrompt = inquirer.prompt as jest.MockedFunction<typeof inquirer.prompt>;

describe('FRONT_STEPS data', () => {
  it('contains all required step IDs in order', () => {
    const ids: FrontStepId[] = FRONT_STEPS.map((s) => s.id);
    expect(ids).toEqual([
      'pre_check',
      'height',
      'angle',
      'l_limit',
      'cable_tension',
      'h_limit',
      'friction_check',
    ]);
  });

  it('every step has a non-empty title and at least one instruction', () => {
    FRONT_STEPS.forEach((step) => {
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.instructions.length).toBeGreaterThan(0);
      expect(step.validationQuestion.length).toBeGreaterThan(0);
      expect(step.troubleshootingTips.length).toBeGreaterThan(0);
    });
  });
});

describe('FrontDerailleurWizard', () => {
  beforeEach(() => {
    mockPrompt.mockReset();
  });

  it('completes all steps when all checkpoints pass', async () => {
    mockPrompt.mockResolvedValue({ passed: true } as never);

    const wizard = new FrontDerailleurWizard();
    const result: FrontWizardResult = await wizard.start();

    expect(result.completedSteps).toHaveLength(FRONT_STEPS.length);
    expect(result.skippedSteps).toHaveLength(0);
    expect(result.completedSteps).toEqual(FRONT_STEPS.map((s) => s.id));
  });

  it('starts from a specific step when startFrom is provided', async () => {
    mockPrompt.mockResolvedValue({ passed: true } as never);

    const wizard = new FrontDerailleurWizard();
    const result: FrontWizardResult = await wizard.start('h_limit');

    expect(result.completedSteps).toEqual(['h_limit', 'friction_check']);
  });

  it('records skipped steps when user chooses to skip after 3 failures', async () => {
    mockPrompt
      .mockResolvedValueOnce({ passed: false } as never)
      .mockResolvedValueOnce({ passed: false } as never)
      .mockResolvedValueOnce({ passed: false } as never)
      .mockResolvedValueOnce({ action: 'skip' } as never)
      .mockResolvedValue({ passed: true } as never);

    const wizard = new FrontDerailleurWizard();
    const result: FrontWizardResult = await wizard.start();

    expect(result.skippedSteps).toContain('pre_check');
    expect(result.completedSteps).toContain('height');
  });

  it('exits early when user chooses exit', async () => {
    mockPrompt
      .mockResolvedValueOnce({ passed: false } as never)
      .mockResolvedValueOnce({ passed: false } as never)
      .mockResolvedValueOnce({ passed: false } as never)
      .mockResolvedValueOnce({ action: 'exit' } as never);

    const wizard = new FrontDerailleurWizard();
    const result: FrontWizardResult = await wizard.start();

    expect(result.completedSteps).toHaveLength(0);
    expect(result.skippedSteps).toHaveLength(0);
  });

  it('throws for an unknown startFrom step ID', async () => {
    const wizard = new FrontDerailleurWizard();
    await expect(wizard.start('bad_step' as FrontStepId)).rejects.toThrow(
      'Unknown step ID: bad_step'
    );
  });
});
