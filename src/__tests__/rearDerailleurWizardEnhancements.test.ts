import {
  REAR_STEPS,
  RearDerailleurWizard,
  TuningStep,
  WizardResult,
} from '../rearDerailleurWizard';

jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

import inquirer from 'inquirer';
const mockPrompt = inquirer.prompt as jest.MockedFunction<typeof inquirer.prompt>;

describe('REAR_STEPS enhanced data', () => {
  it('steps with toolsRequired have at least one tool listed', () => {
    const stepsWithTools = REAR_STEPS.filter((s) => s.toolsRequired);
    expect(stepsWithTools.length).toBeGreaterThan(0);
    stepsWithTools.forEach((s) => {
      expect(s.toolsRequired!.length).toBeGreaterThan(0);
    });
  });

  it('safety-critical steps have a safetyWarning defined', () => {
    const lLimit = REAR_STEPS.find((s) => s.id === 'l_limit');
    expect(lLimit).toBeDefined();
    expect(lLimit!.safetyWarning).toBeDefined();
    expect(lLimit!.safetyWarning!.length).toBeGreaterThan(0);

    const hLimit = REAR_STEPS.find((s) => s.id === 'h_limit');
    expect(hLimit).toBeDefined();
    expect(hLimit!.safetyWarning).toBeDefined();
    expect(hLimit!.safetyWarning!.length).toBeGreaterThan(0);
  });

  it('pre_check step has toolsRequired', () => {
    const preCheck = REAR_STEPS.find((s) => s.id === 'pre_check');
    expect(preCheck).toBeDefined();
    expect(preCheck!.toolsRequired).toBeDefined();
    expect(preCheck!.toolsRequired!.length).toBeGreaterThan(0);
  });
});

describe('RearDerailleurWizard — mobile mode', () => {
  beforeEach(() => {
    mockPrompt.mockReset();
  });

  it('completes all steps in mobile mode when all checkpoints pass', async () => {
    // In mobile mode each step shows: toolsReady confirm + (n-1) "next" confirms + checkpoint
    // We use a blanket mock that returns the right shape for all prompts
    mockPrompt.mockResolvedValue({ passed: true, toolsReady: true, next: true } as never);

    const wizard = new RearDerailleurWizard({ mobileMode: true });
    const result: WizardResult = await wizard.start();

    expect(result.completedSteps).toHaveLength(REAR_STEPS.length);
    expect(result.skippedSteps).toHaveLength(0);
  });

  it('default constructor (no options) behaves the same as mobileMode: false', async () => {
    mockPrompt.mockResolvedValue({ passed: true } as never);

    const wizard = new RearDerailleurWizard();
    const result: WizardResult = await wizard.start();

    expect(result.completedSteps).toHaveLength(REAR_STEPS.length);
  });

  it('starts from a specific step in mobile mode', async () => {
    mockPrompt.mockResolvedValue({ passed: true, toolsReady: true, next: true } as never);

    const wizard = new RearDerailleurWizard({ mobileMode: true });
    const result: WizardResult = await wizard.start('b_screw');

    expect(result.completedSteps).toEqual(['b_screw', 'validation']);
  });
});
