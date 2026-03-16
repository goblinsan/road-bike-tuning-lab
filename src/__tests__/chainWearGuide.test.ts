import {
  CHAIN_WEAR_THRESHOLDS,
  RECOMMENDED_TOOLS,
  CASSETTE_WEAR_SIGNS,
  getChainWearRecommendation,
  ChainWearGuide,
  ChainWearReading,
} from '../chainWearGuide';

jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

import inquirer from 'inquirer';
const mockPrompt = inquirer.prompt as jest.MockedFunction<typeof inquirer.prompt>;

describe('getChainWearRecommendation', () => {
  it('returns "good" when wear is below 0.5', () => {
    expect(getChainWearRecommendation(0)).toBe('good');
    expect(getChainWearRecommendation(0.3)).toBe('good');
    expect(getChainWearRecommendation(0.49)).toBe('good');
  });

  it('returns "monitor" when wear is 0.5 to just below 0.75', () => {
    expect(getChainWearRecommendation(0.5)).toBe('monitor');
    expect(getChainWearRecommendation(0.6)).toBe('monitor');
    expect(getChainWearRecommendation(0.74)).toBe('monitor');
  });

  it('returns "replace_chain" when wear is 0.75 to just below 1.0', () => {
    expect(getChainWearRecommendation(0.75)).toBe('replace_chain');
    expect(getChainWearRecommendation(0.9)).toBe('replace_chain');
    expect(getChainWearRecommendation(0.99)).toBe('replace_chain');
  });

  it('returns "replace_chain_and_cassette" when wear is 1.0 or above', () => {
    expect(getChainWearRecommendation(1.0)).toBe('replace_chain_and_cassette');
    expect(getChainWearRecommendation(1.5)).toBe('replace_chain_and_cassette');
  });
});

describe('CHAIN_WEAR_THRESHOLDS', () => {
  it('has GOOD at 0.5', () => {
    expect(CHAIN_WEAR_THRESHOLDS.GOOD).toBe(0.5);
  });

  it('has MONITOR at 0.75', () => {
    expect(CHAIN_WEAR_THRESHOLDS.MONITOR).toBe(0.75);
  });

  it('has REPLACE_CHAIN at 1.0', () => {
    expect(CHAIN_WEAR_THRESHOLDS.REPLACE_CHAIN).toBe(1.0);
  });
});

describe('RECOMMENDED_TOOLS data', () => {
  it('has at least 4 tools', () => {
    expect(RECOMMENDED_TOOLS.length).toBeGreaterThanOrEqual(4);
  });

  it('every tool has a name and purpose', () => {
    RECOMMENDED_TOOLS.forEach((tool) => {
      expect(tool.name.length).toBeGreaterThan(0);
      expect(tool.purpose.length).toBeGreaterThan(0);
    });
  });
});

describe('CASSETTE_WEAR_SIGNS data', () => {
  it('has at least 3 signs', () => {
    expect(CASSETTE_WEAR_SIGNS.length).toBeGreaterThanOrEqual(3);
  });
});

describe('ChainWearGuide.checkWear', () => {
  beforeEach(() => {
    mockPrompt.mockReset();
  });

  it('returns correct reading and recommendation for a good chain', async () => {
    mockPrompt.mockResolvedValueOnce({ wearInput: '0.3' } as never);

    const guide = new ChainWearGuide();
    const result: ChainWearReading = await guide.checkWear();

    expect(result.wearPercent).toBe(0.3);
    expect(result.recommendation).toBe('good');
  });

  it('returns replace_chain recommendation for 0.75 wear', async () => {
    mockPrompt.mockResolvedValueOnce({ wearInput: '0.75' } as never);

    const guide = new ChainWearGuide();
    const result: ChainWearReading = await guide.checkWear();

    expect(result.wearPercent).toBe(0.75);
    expect(result.recommendation).toBe('replace_chain');
  });

  it('returns replace_chain_and_cassette for wear at or above 1.0', async () => {
    mockPrompt.mockResolvedValueOnce({ wearInput: '1.0' } as never);

    const guide = new ChainWearGuide();
    const result: ChainWearReading = await guide.checkWear();

    expect(result.recommendation).toBe('replace_chain_and_cassette');
  });
});

describe('ChainWearGuide.start', () => {
  beforeEach(() => {
    mockPrompt.mockReset();
  });

  it('runs check_wear flow without throwing', async () => {
    mockPrompt
      .mockResolvedValueOnce({ action: 'check_wear' } as never)
      .mockResolvedValueOnce({ wearInput: '0.5' } as never);

    const guide = new ChainWearGuide();
    await expect(guide.start()).resolves.not.toThrow();
  });

  it('runs view_thresholds flow without throwing', async () => {
    mockPrompt.mockResolvedValueOnce({ action: 'view_thresholds' } as never);

    const guide = new ChainWearGuide();
    await expect(guide.start()).resolves.not.toThrow();
  });

  it('runs view_tools flow without throwing', async () => {
    mockPrompt.mockResolvedValueOnce({ action: 'view_tools' } as never);

    const guide = new ChainWearGuide();
    await expect(guide.start()).resolves.not.toThrow();
  });

  it('runs cassette_signs flow without throwing', async () => {
    mockPrompt.mockResolvedValueOnce({ action: 'cassette_signs' } as never);

    const guide = new ChainWearGuide();
    await expect(guide.start()).resolves.not.toThrow();
  });
});
