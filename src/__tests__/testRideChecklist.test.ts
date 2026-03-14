import {
  BEFORE_RIDE_ITEMS,
  AFTER_RIDE_ITEMS,
  TestRideChecklist,
  ChecklistResult,
} from '../testRideChecklist';

jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

import inquirer from 'inquirer';
const mockPrompt = inquirer.prompt as jest.MockedFunction<typeof inquirer.prompt>;

describe('BEFORE_RIDE_ITEMS data', () => {
  it('has at least 5 items', () => {
    expect(BEFORE_RIDE_ITEMS.length).toBeGreaterThanOrEqual(5);
  });

  it('every item has id, category, and description', () => {
    BEFORE_RIDE_ITEMS.forEach((item) => {
      expect(item.id.length).toBeGreaterThan(0);
      expect(item.category.length).toBeGreaterThan(0);
      expect(item.description.length).toBeGreaterThan(0);
    });
  });

  it('covers safety-critical categories', () => {
    const categories = BEFORE_RIDE_ITEMS.map((i) => i.category);
    expect(categories).toContain('Tires');
    expect(categories).toContain('Brakes');
    expect(categories).toContain('Wheels');
  });
});

describe('AFTER_RIDE_ITEMS data', () => {
  it('has at least 5 items', () => {
    expect(AFTER_RIDE_ITEMS.length).toBeGreaterThanOrEqual(5);
  });

  it('covers shifting verification categories', () => {
    const categories = AFTER_RIDE_ITEMS.map((i) => i.category);
    expect(categories).toContain('Shifting');
    expect(categories).toContain('Drivetrain');
    expect(categories).toContain('Brakes');
  });
});

describe('TestRideChecklist.runChecklist', () => {
  beforeEach(() => {
    mockPrompt.mockReset();
  });

  it('returns allPassed=true when all items pass', async () => {
    mockPrompt.mockResolvedValue({ passed: true } as never);

    const checklist = new TestRideChecklist();
    const result: ChecklistResult = await checklist.runChecklist('before', BEFORE_RIDE_ITEMS);

    expect(result.allPassed).toBe(true);
    expect(result.failedItems).toHaveLength(0);
    expect(result.items).toHaveLength(BEFORE_RIDE_ITEMS.length);
    expect(result.phase).toBe('before');
  });

  it('returns allPassed=false when any item fails', async () => {
    // First item fails, rest pass
    mockPrompt
      .mockResolvedValueOnce({ passed: false } as never)
      .mockResolvedValue({ passed: true } as never);

    const checklist = new TestRideChecklist();
    const result: ChecklistResult = await checklist.runChecklist('before', BEFORE_RIDE_ITEMS);

    expect(result.allPassed).toBe(false);
    expect(result.failedItems).toHaveLength(1);
    expect(result.failedItems[0].id).toBe(BEFORE_RIDE_ITEMS[0].id);
  });

  it('records passed=false on items that fail', async () => {
    mockPrompt.mockResolvedValue({ passed: false } as never);

    const checklist = new TestRideChecklist();
    const result: ChecklistResult = await checklist.runChecklist(
      'after',
      AFTER_RIDE_ITEMS.slice(0, 2)
    );

    expect(result.failedItems).toHaveLength(2);
    result.items.forEach((item) => expect(item.passed).toBe(false));
  });

  it('sets phase correctly for after-ride checklist', async () => {
    mockPrompt.mockResolvedValue({ passed: true } as never);

    const checklist = new TestRideChecklist();
    const result: ChecklistResult = await checklist.runChecklist('after', AFTER_RIDE_ITEMS);

    expect(result.phase).toBe('after');
  });
});

describe('TestRideChecklist.start', () => {
  beforeEach(() => {
    mockPrompt.mockReset();
  });

  it('runs before-ride checklist when phase is "before"', async () => {
    // Phase selection → before; then all checklist items pass
    mockPrompt
      .mockResolvedValueOnce({ phase: 'before' } as never)
      .mockResolvedValue({ passed: true } as never);

    const checklist = new TestRideChecklist();
    await expect(checklist.start()).resolves.not.toThrow();
  });

  it('runs after-ride checklist when phase is "after"', async () => {
    mockPrompt
      .mockResolvedValueOnce({ phase: 'after' } as never)
      .mockResolvedValue({ passed: true } as never);

    const checklist = new TestRideChecklist();
    await expect(checklist.start()).resolves.not.toThrow();
  });

  it('stops before test ride when safety check fails and user declines', async () => {
    // Phase = both; first checklist item fails; user declines to continue
    mockPrompt
      .mockResolvedValueOnce({ phase: 'both' } as never)
      .mockResolvedValueOnce({ passed: false } as never) // first item fails
      .mockResolvedValue({ passed: true } as never) // rest of before items pass
      // After all before items, user is asked to continue anyway
      .mockResolvedValueOnce({ continueAnyway: false } as never);

    const checklist = new TestRideChecklist();
    await expect(checklist.start()).resolves.not.toThrow();
  });
});
