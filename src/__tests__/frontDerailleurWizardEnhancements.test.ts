import {
  FRONT_STEPS,
  FrontDerailleurWizard,
  FrontWizardResult,
} from '../frontDerailleurWizard';

jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

import inquirer from 'inquirer';
const mockPrompt = inquirer.prompt as jest.MockedFunction<typeof inquirer.prompt>;

describe('FRONT_STEPS enhanced data', () => {
  it('steps with toolsRequired have at least one tool listed', () => {
    const stepsWithTools = FRONT_STEPS.filter((s) => s.toolsRequired);
    expect(stepsWithTools.length).toBeGreaterThan(0);
    stepsWithTools.forEach((s) => {
      expect(s.toolsRequired!.length).toBeGreaterThan(0);
    });
  });

  it('safety-critical steps have a safetyWarning defined', () => {
    const lLimit = FRONT_STEPS.find((s) => s.id === 'l_limit');
    expect(lLimit).toBeDefined();
    expect(lLimit!.safetyWarning).toBeDefined();
    expect(lLimit!.safetyWarning!.length).toBeGreaterThan(0);

    const hLimit = FRONT_STEPS.find((s) => s.id === 'h_limit');
    expect(hLimit).toBeDefined();
    expect(hLimit!.safetyWarning).toBeDefined();
    expect(hLimit!.safetyWarning!.length).toBeGreaterThan(0);
  });

  it('pre_check step has toolsRequired', () => {
    const preCheck = FRONT_STEPS.find((s) => s.id === 'pre_check');
    expect(preCheck).toBeDefined();
    expect(preCheck!.toolsRequired).toBeDefined();
    expect(preCheck!.toolsRequired!.length).toBeGreaterThan(0);
  });
});

describe('FrontDerailleurWizard — mobile mode', () => {
  beforeEach(() => {
    mockPrompt.mockReset();
  });

  it('completes all steps in mobile mode when all checkpoints pass', async () => {
    mockPrompt.mockResolvedValue({ passed: true, toolsReady: true, next: true } as never);

    const wizard = new FrontDerailleurWizard({ mobileMode: true });
    const result: FrontWizardResult = await wizard.start();

    expect(result.completedSteps).toHaveLength(FRONT_STEPS.length);
    expect(result.skippedSteps).toHaveLength(0);
  });

  it('default constructor (no options) behaves the same as mobileMode: false', async () => {
    mockPrompt.mockResolvedValue({ passed: true } as never);

    const wizard = new FrontDerailleurWizard();
    const result: FrontWizardResult = await wizard.start();

    expect(result.completedSteps).toHaveLength(FRONT_STEPS.length);
  });

  it('starts from a specific step in mobile mode', async () => {
    mockPrompt.mockResolvedValue({ passed: true, toolsReady: true, next: true } as never);

    const wizard = new FrontDerailleurWizard({ mobileMode: true });
    const result: FrontWizardResult = await wizard.start('friction_check');

    expect(result.completedSteps).toEqual(['friction_check']);
  });
});
