import {
  PRE_RACE_CHECKLIST_ITEMS,
  PreRaceChecklist,
  PreRaceResult,
} from '../preRaceChecklist';

jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

import inquirer from 'inquirer';
const mockPrompt = inquirer.prompt as jest.MockedFunction<typeof inquirer.prompt>;

describe('PRE_RACE_CHECKLIST_ITEMS data', () => {
  it('has at least 10 items', () => {
    expect(PRE_RACE_CHECKLIST_ITEMS.length).toBeGreaterThanOrEqual(10);
  });

  it('every item has id, category, and description', () => {
    PRE_RACE_CHECKLIST_ITEMS.forEach((item) => {
      expect(item.id.length).toBeGreaterThan(0);
      expect(item.category.length).toBeGreaterThan(0);
      expect(item.description.length).toBeGreaterThan(0);
    });
  });

  it('covers all required triathlon categories', () => {
    const categories = PRE_RACE_CHECKLIST_ITEMS.map((i) => i.category);
    expect(categories).toContain('Drivetrain');
    expect(categories).toContain('Braking');
    expect(categories).toContain('Tires');
    expect(categories).toContain('Cockpit');
  });

  it('includes a Safety category', () => {
    const categories = PRE_RACE_CHECKLIST_ITEMS.map((i) => i.category);
    expect(categories).toContain('Safety');
  });

  it('all ids are unique', () => {
    const ids = PRE_RACE_CHECKLIST_ITEMS.map((i) => i.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('PreRaceChecklist.runChecklist', () => {
  beforeEach(() => {
    mockPrompt.mockReset();
  });

  it('returns allPassed=true when all items pass', async () => {
    mockPrompt.mockResolvedValue({ passed: true } as never);

    const checklist = new PreRaceChecklist();
    const result: PreRaceResult = await checklist.runChecklist(PRE_RACE_CHECKLIST_ITEMS);

    expect(result.allPassed).toBe(true);
    expect(result.failedItems).toHaveLength(0);
    expect(result.items).toHaveLength(PRE_RACE_CHECKLIST_ITEMS.length);
  });

  it('returns allPassed=false when any item fails', async () => {
    mockPrompt
      .mockResolvedValueOnce({ passed: false } as never)
      .mockResolvedValue({ passed: true } as never);

    const checklist = new PreRaceChecklist();
    const result: PreRaceResult = await checklist.runChecklist(PRE_RACE_CHECKLIST_ITEMS);

    expect(result.allPassed).toBe(false);
    expect(result.failedItems).toHaveLength(1);
    expect(result.failedItems[0].id).toBe(PRE_RACE_CHECKLIST_ITEMS[0].id);
  });

  it('records all items as failed when every answer is false', async () => {
    mockPrompt.mockResolvedValue({ passed: false } as never);

    const subset = PRE_RACE_CHECKLIST_ITEMS.slice(0, 3);
    const checklist = new PreRaceChecklist();
    const result: PreRaceResult = await checklist.runChecklist(subset);

    expect(result.failedItems).toHaveLength(3);
    result.items.forEach((item) => expect(item.passed).toBe(false));
  });
});

describe('PreRaceChecklist.start', () => {
  beforeEach(() => {
    mockPrompt.mockReset();
  });

  it('completes without throwing when all items pass', async () => {
    mockPrompt.mockResolvedValue({ passed: true } as never);

    const checklist = new PreRaceChecklist();
    await expect(checklist.start()).resolves.not.toThrow();
  });

  it('completes without throwing when some items fail', async () => {
    mockPrompt
      .mockResolvedValueOnce({ passed: false } as never)
      .mockResolvedValue({ passed: true } as never);

    const checklist = new PreRaceChecklist();
    await expect(checklist.start()).resolves.not.toThrow();
  });
});
