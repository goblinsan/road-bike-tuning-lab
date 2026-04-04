import {
  SYMPTOMS,
  DIAGNOSIS_ROUTES,
  SymptomDiagnosis,
  Symptom,
} from '../symptomDiagnosis';

jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

// Mock the wizards so they don't run their full interactive flow
jest.mock('../rearDerailleurWizard', () => ({
  RearDerailleurWizard: jest.fn().mockImplementation(() => ({
    start: jest.fn().mockResolvedValue({
      completedSteps: [],
      skippedSteps: [],
      notes: [],
    }),
  })),
  REAR_STEPS: [],
}));

jest.mock('../frontDerailleurWizard', () => ({
  FrontDerailleurWizard: jest.fn().mockImplementation(() => ({
    start: jest.fn().mockResolvedValue({
      completedSteps: [],
      skippedSteps: [],
      notes: [],
    }),
  })),
  FRONT_STEPS: [],
}));

// Mock the outcome tracker so no real state accumulates across tests
jest.mock('../outcomeTracker', () => ({
  outcomeTracker: { recordOutcome: jest.fn(), getOutcomesForSymptom: jest.fn().mockReturnValue([]) },
  TuningOutcomeTracker: jest.fn(),
}));

// Mock the confidence scorer to keep tests simple
jest.mock('../confidenceScoring', () => ({
  ConfidenceScorer: jest.fn().mockImplementation(() => ({
    scoreRoute: jest.fn().mockReturnValue({ confidence: null, sampleSize: 0 }),
    formatScore: jest.fn().mockReturnValue('[No data yet]'),
  })),
}));

import inquirer from 'inquirer';
const mockPrompt = inquirer.prompt as jest.MockedFunction<typeof inquirer.prompt>;

describe('SYMPTOMS data', () => {
  it('has a non-empty label and description for each entry', () => {
    expect(SYMPTOMS.length).toBeGreaterThan(0);
    SYMPTOMS.forEach((s) => {
      expect(s.value.length).toBeGreaterThan(0);
      expect(s.label.length).toBeGreaterThan(0);
      expect(s.description.length).toBeGreaterThan(0);
    });
  });

  it('contains key symptoms', () => {
    const values = SYMPTOMS.map((s) => s.value);
    expect(values).toContain('skips_gears');
    expect(values).toContain('chain_rub_front');
    expect(values).toContain('noisy_shifts');
    expect(values).toContain('chain_drops_outside_rear');
    expect(values).toContain('chain_drops_inside_rear');
  });
});

describe('DIAGNOSIS_ROUTES data', () => {
  it('has a route for every symptom value', () => {
    const routedSymptoms = DIAGNOSIS_ROUTES.map((r) => r.symptom);
    SYMPTOMS.forEach((s) => {
      expect(routedSymptoms).toContain(s.value);
    });
  });

  it('every route specifies a valid derailleur type', () => {
    DIAGNOSIS_ROUTES.forEach((r) => {
      expect(['rear', 'front']).toContain(r.derailleur);
    });
  });

  it('every route has a non-empty explanation', () => {
    DIAGNOSIS_ROUTES.forEach((r) => {
      expect(r.explanation.length).toBeGreaterThan(0);
    });
  });
});

describe('SymptomDiagnosis.findRoute', () => {
  const diagnosis = new SymptomDiagnosis();

  it('returns the correct route for skips_gears', () => {
    const route = diagnosis.findRoute('skips_gears');
    expect(route).toBeDefined();
    expect(route!.derailleur).toBe('rear');
    expect(route!.startStep).toBe('indexing');
  });

  it('returns the correct route for chain_drops_outside_rear', () => {
    const route = diagnosis.findRoute('chain_drops_outside_rear');
    expect(route!.startStep).toBe('h_limit');
    expect(route!.derailleur).toBe('rear');
  });

  it('returns the correct route for chain_drops_inside_rear', () => {
    const route = diagnosis.findRoute('chain_drops_inside_rear');
    expect(route!.startStep).toBe('l_limit');
    expect(route!.derailleur).toBe('rear');
  });

  it('returns the correct route for chain_rub_front', () => {
    const route = diagnosis.findRoute('chain_rub_front');
    expect(route!.derailleur).toBe('front');
    expect(route!.startStep).toBe('friction_check');
  });

  it('returns the correct route for slow_front_shift', () => {
    const route = diagnosis.findRoute('slow_front_shift');
    expect(route!.derailleur).toBe('front');
    expect(route!.startStep).toBe('cable_tension');
  });

  it('returns undefined for an unknown symptom', () => {
    const route = diagnosis.findRoute('unknown_symptom' as Symptom);
    expect(route).toBeUndefined();
  });
});

describe('SymptomDiagnosis.start', () => {
  beforeEach(() => {
    mockPrompt.mockReset();
  });

  it('routes to the rear wizard with correct startStep for skips_gears', async () => {
    const { RearDerailleurWizard } = require('../rearDerailleurWizard');
    const mockStart = jest.fn().mockResolvedValue({ completedSteps: [], skippedSteps: [], notes: [] });
    RearDerailleurWizard.mockImplementation(() => ({ start: mockStart }));

    mockPrompt
      .mockResolvedValueOnce({ selectedSymptom: 'skips_gears' } as never)
      .mockResolvedValueOnce({ proceed: true } as never)
      .mockResolvedValueOnce({ resolved: true } as never);

    const diagnosis = new SymptomDiagnosis();
    await diagnosis.start();

    expect(mockStart).toHaveBeenCalledWith('indexing');
  });

  it('routes to the front wizard for chain_rub_front', async () => {
    const { FrontDerailleurWizard } = require('../frontDerailleurWizard');
    const mockStart = jest.fn().mockResolvedValue({ completedSteps: [], skippedSteps: [], notes: [] });
    FrontDerailleurWizard.mockImplementation(() => ({ start: mockStart }));

    mockPrompt
      .mockResolvedValueOnce({ selectedSymptom: 'chain_rub_front' } as never)
      .mockResolvedValueOnce({ proceed: true } as never)
      .mockResolvedValueOnce({ resolved: false } as never);

    const diagnosis = new SymptomDiagnosis();
    await diagnosis.start();

    expect(mockStart).toHaveBeenCalledWith('friction_check');
  });

  it('does not launch a wizard when user declines to proceed', async () => {
    const { RearDerailleurWizard } = require('../rearDerailleurWizard');
    const mockStart = jest.fn();
    RearDerailleurWizard.mockImplementation(() => ({ start: mockStart }));

    mockPrompt
      .mockResolvedValueOnce({ selectedSymptom: 'skips_gears' } as never)
      .mockResolvedValueOnce({ proceed: false } as never);

    const diagnosis = new SymptomDiagnosis();
    await diagnosis.start();

    expect(mockStart).not.toHaveBeenCalled();
  });
});
