import {
  MAINTENANCE_TASKS,
  evaluateDueTasks,
  MaintenanceScheduler,
  ScheduledTask,
} from '../maintenanceScheduler';

jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

import inquirer from 'inquirer';
const mockPrompt = inquirer.prompt as jest.MockedFunction<typeof inquirer.prompt>;

describe('MAINTENANCE_TASKS data', () => {
  it('has at least 5 tasks', () => {
    expect(MAINTENANCE_TASKS.length).toBeGreaterThanOrEqual(5);
  });

  it('every task has id, name, description, intervalType, intervalValue, and intervalUnit', () => {
    MAINTENANCE_TASKS.forEach((task) => {
      expect(task.id.length).toBeGreaterThan(0);
      expect(task.name.length).toBeGreaterThan(0);
      expect(task.description.length).toBeGreaterThan(0);
      expect(['mileage', 'time']).toContain(task.intervalType);
      expect(task.intervalValue).toBeGreaterThan(0);
      expect(task.intervalUnit.length).toBeGreaterThan(0);
    });
  });

  it('includes both mileage-based and time-based tasks', () => {
    const types = MAINTENANCE_TASKS.map((t) => t.intervalType);
    expect(types).toContain('mileage');
    expect(types).toContain('time');
  });

  it('all task ids are unique', () => {
    const ids = MAINTENANCE_TASKS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('evaluateDueTasks', () => {
  it('marks a mileage-based task as due when current miles exceed threshold', () => {
    const tasks = MAINTENANCE_TASKS.filter((t) => t.intervalType === 'mileage').slice(0, 1);
    const task = tasks[0];

    // Last done at 0 miles; interval is e.g. 150 miles; now at 200 → due
    const result = evaluateDueTasks(tasks, 200, { [task.id]: 0 }, 0, {});
    expect(result[0].isDue).toBe(true);
  });

  it('marks a mileage-based task as not due when below interval', () => {
    const tasks = MAINTENANCE_TASKS.filter((t) => t.intervalType === 'mileage').slice(0, 1);
    const task = tasks[0];

    // Last done at 0; interval say 150; currently at 100 → not due
    const result = evaluateDueTasks(tasks, 100, { [task.id]: 0 }, 0, {});
    expect(result[0].isDue).toBe(false);
  });

  it('marks a time-based task as due when current months exceed threshold', () => {
    const tasks = MAINTENANCE_TASKS.filter((t) => t.intervalType === 'time').slice(0, 1);
    const task = tasks[0];

    // Use currentMonths well above the interval to ensure it's due
    const currentMonths = task.intervalValue + 1;
    const result = evaluateDueTasks(tasks, 0, {}, currentMonths, { [task.id]: 0 });
    expect(result[0].isDue).toBe(true);
  });

  it('marks a time-based task as not due when below interval', () => {
    const tasks = MAINTENANCE_TASKS.filter((t) => t.intervalType === 'time').slice(0, 1);
    const task = tasks[0];

    // Use currentMonths below the interval so it's not yet due
    const currentMonths = task.intervalValue - 1;
    const result = evaluateDueTasks(tasks, 0, {}, currentMonths, { [task.id]: 0 });
    expect(result[0].isDue).toBe(false);
  });

  it('computes nextDueValue correctly', () => {
    const tasks = MAINTENANCE_TASKS.filter((t) => t.intervalType === 'mileage').slice(0, 1);
    const task = tasks[0];

    const result = evaluateDueTasks(tasks, 300, { [task.id]: 100 }, 0, {});
    expect(result[0].nextDueValue).toBe(100 + task.intervalValue);
    expect(result[0].lastDoneValue).toBe(100);
  });

  it('defaults to 0 when task id is not in the map', () => {
    const tasks = MAINTENANCE_TASKS.filter((t) => t.intervalType === 'mileage').slice(0, 1);
    const result = evaluateDueTasks(tasks, 1000, {}, 0, {});
    // No entry in map → lastDoneValue defaults to 0
    expect(result[0].lastDoneValue).toBe(0);
  });
});

describe('MaintenanceScheduler.start', () => {
  beforeEach(() => {
    mockPrompt.mockReset();
  });

  it('runs view_all_tasks without throwing', async () => {
    mockPrompt.mockResolvedValueOnce({ action: 'view_all_tasks' } as never);

    const scheduler = new MaintenanceScheduler();
    await expect(scheduler.start()).resolves.not.toThrow();
  });

  it('runs check_due flow without throwing when all values provided', async () => {
    // Action selection → check_due
    mockPrompt.mockResolvedValueOnce({ action: 'check_due' } as never);
    // Current mileage and months
    mockPrompt.mockResolvedValueOnce({
      currentMilesInput: '500',
      monthsSinceStartInput: '6',
    } as never);
    // One prompt per task for "last done" value
    MAINTENANCE_TASKS.forEach(() => {
      mockPrompt.mockResolvedValueOnce({ lastValueInput: '0' } as never);
    });

    const scheduler = new MaintenanceScheduler();
    await expect(scheduler.start()).resolves.not.toThrow();
  });
});

describe('MaintenanceScheduler.checkDueTasks', () => {
  beforeEach(() => {
    mockPrompt.mockReset();
  });

  it('returns an array of ScheduledTask for every maintenance task', async () => {
    mockPrompt.mockResolvedValueOnce({
      currentMilesInput: '1000',
      monthsSinceStartInput: '12',
    } as never);
    MAINTENANCE_TASKS.forEach(() => {
      mockPrompt.mockResolvedValueOnce({ lastValueInput: '0' } as never);
    });

    const scheduler = new MaintenanceScheduler();
    const result: ScheduledTask[] = await scheduler.checkDueTasks();

    expect(result).toHaveLength(MAINTENANCE_TASKS.length);
  });

  it('marks tasks as due when last done was at 0 and usage is high', async () => {
    mockPrompt.mockResolvedValueOnce({
      currentMilesInput: '5000',
      monthsSinceStartInput: '24',
    } as never);
    MAINTENANCE_TASKS.forEach(() => {
      mockPrompt.mockResolvedValueOnce({ lastValueInput: '0' } as never);
    });

    const scheduler = new MaintenanceScheduler();
    const result: ScheduledTask[] = await scheduler.checkDueTasks();

    const dueTasks = result.filter((s) => s.isDue);
    expect(dueTasks.length).toBeGreaterThan(0);
  });
});
