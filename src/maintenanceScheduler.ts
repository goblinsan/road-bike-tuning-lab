import inquirer from 'inquirer';

export type IntervalType = 'mileage' | 'time';

export interface MaintenanceTask {
  id: string;
  name: string;
  description: string;
  intervalType: IntervalType;
  intervalValue: number;
  intervalUnit: string;
}

export interface ScheduledTask {
  task: MaintenanceTask;
  lastDoneValue: number;
  nextDueValue: number;
  isDue: boolean;
}

export const MAINTENANCE_TASKS: MaintenanceTask[] = [
  {
    id: 'clean_lube_chain',
    name: 'Clean and re-lube chain',
    description: 'Degrease chain and apply fresh lubricant',
    intervalType: 'mileage',
    intervalValue: 150,
    intervalUnit: 'miles',
  },
  {
    id: 'check_chain_wear',
    name: 'Check chain wear',
    description: 'Measure chain elongation with a wear indicator — replace if ≥ 0.75',
    intervalType: 'mileage',
    intervalValue: 500,
    intervalUnit: 'miles',
  },
  {
    id: 'inspect_brake_pads',
    name: 'Inspect brake pads',
    description: 'Check pad thickness and alignment; replace if worn to indicators',
    intervalType: 'mileage',
    intervalValue: 500,
    intervalUnit: 'miles',
  },
  {
    id: 'check_cable_housing',
    name: 'Inspect cables and housing',
    description: 'Check for fraying, kinking, or contamination; replace as needed',
    intervalType: 'mileage',
    intervalValue: 1000,
    intervalUnit: 'miles',
  },
  {
    id: 'replace_bar_tape',
    name: 'Replace bar tape',
    description: 'Re-wrap handlebar tape for comfort and secure grip',
    intervalType: 'time',
    intervalValue: 6,
    intervalUnit: 'months',
  },
  {
    id: 'full_drivetrain_clean',
    name: 'Full drivetrain deep-clean',
    description: 'Degrease cassette, chainrings, and derailleur pulleys',
    intervalType: 'mileage',
    intervalValue: 1000,
    intervalUnit: 'miles',
  },
  {
    id: 'check_wheel_bearings',
    name: 'Check wheel bearings',
    description: 'Spin each wheel and check for roughness or play in the hub',
    intervalType: 'mileage',
    intervalValue: 2000,
    intervalUnit: 'miles',
  },
  {
    id: 'torque_bolts',
    name: 'Re-torque cockpit and saddle bolts',
    description: 'Check stem, aero bar, saddle, and seatpost bolts with a torque wrench',
    intervalType: 'time',
    intervalValue: 3,
    intervalUnit: 'months',
  },
];

/**
 * Evaluate which maintenance tasks are due based on current usage.
 */
export function evaluateDueTasks(
  tasks: MaintenanceTask[],
  currentMiles: number,
  lastMilesMap: Record<string, number>,
  currentMonths: number,
  lastMonthsMap: Record<string, number>
): ScheduledTask[] {
  return tasks.map((task) => {
    const isTimeBased = task.intervalType === 'time';
    const lastDoneValue = isTimeBased
      ? (lastMonthsMap[task.id] ?? 0)
      : (lastMilesMap[task.id] ?? 0);
    const currentValue = isTimeBased ? currentMonths : currentMiles;
    const nextDueValue = lastDoneValue + task.intervalValue;
    const isDue = currentValue >= nextDueValue;

    return { task, lastDoneValue, nextDueValue, isDue };
  });
}

/**
 * Recurring Maintenance Scheduler
 * Prompts users for current mileage/time and shows which maintenance tasks are due.
 */
export class MaintenanceScheduler {
  /**
   * Run the interactive maintenance scheduler.
   */
  async start(): Promise<void> {
    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║   RECURRING MAINTENANCE SCHEDULER        ║');
    console.log('╚══════════════════════════════════════════╝\n');
    console.log('Enter your current usage and see which maintenance tasks are due.\n');

    const { action } = await inquirer.prompt<{
      action: 'check_due' | 'view_all_tasks';
    }>([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '📅 Check which tasks are due now', value: 'check_due' },
          { name: '📋 View all maintenance tasks and intervals', value: 'view_all_tasks' },
        ],
      },
    ]);

    if (action === 'view_all_tasks') {
      this.printAllTasks();
      return;
    }

    await this.checkDueTasks();
  }

  /**
   * Interactively gather current mileage/time usage and compute which tasks are due.
   */
  async checkDueTasks(): Promise<ScheduledTask[]> {
    console.log('\n--- ENTER YOUR CURRENT USAGE ---\n');

    const { currentMilesInput, monthsSinceStartInput } = await inquirer.prompt<{
      currentMilesInput: string;
      monthsSinceStartInput: string;
    }>([
      {
        type: 'input',
        name: 'currentMilesInput',
        message: 'Total miles on this bike (or miles since last full reset):',
        validate: (v: string) =>
          !isNaN(parseFloat(v)) && parseFloat(v) >= 0 ? true : 'Enter a non-negative number.',
      },
      {
        type: 'input',
        name: 'monthsSinceStartInput',
        message: 'Months since you started tracking (or since last annual service):',
        validate: (v: string) =>
          !isNaN(parseFloat(v)) && parseFloat(v) >= 0 ? true : 'Enter a non-negative number.',
      },
    ]);

    const currentMiles = parseFloat(currentMilesInput);
    const currentMonths = parseFloat(monthsSinceStartInput);

    console.log('\n--- ENTER WHEN EACH TASK WAS LAST DONE ---\n');
    console.log('For each task, enter the mileage or months when it was last completed.');
    console.log('Enter 0 if you are not sure or it has never been done.\n');

    const lastMilesMap: Record<string, number> = {};
    const lastMonthsMap: Record<string, number> = {};

    for (const task of MAINTENANCE_TASKS) {
      const isTimeBased = task.intervalType === 'time';
      const promptMsg = isTimeBased
        ? `"${task.name}" — months ago when last done (0 if unknown):`
        : `"${task.name}" — mileage when last done (0 if unknown):`;

      const { lastValueInput } = await inquirer.prompt<{ lastValueInput: string }>([
        {
          type: 'input',
          name: 'lastValueInput',
          message: promptMsg,
          default: '0',
          validate: (v: string) =>
            !isNaN(parseFloat(v)) && parseFloat(v) >= 0 ? true : 'Enter a non-negative number.',
        },
      ]);

      const lastValue = parseFloat(lastValueInput);
      if (isTimeBased) {
        lastMonthsMap[task.id] = currentMonths - lastValue;
      } else {
        lastMilesMap[task.id] = lastValue;
      }
    }

    const scheduled = evaluateDueTasks(
      MAINTENANCE_TASKS,
      currentMiles,
      lastMilesMap,
      currentMonths,
      lastMonthsMap
    );

    this.printScheduleResult(scheduled, currentMiles, currentMonths);
    return scheduled;
  }

  private printScheduleResult(
    scheduled: ScheduledTask[],
    currentMiles: number,
    currentMonths: number
  ): void {
    const dueTasks = scheduled.filter((s) => s.isDue);
    const upcomingTasks = scheduled.filter((s) => !s.isDue);

    console.log(`\n--- MAINTENANCE STATUS (${currentMiles} miles / ${currentMonths} months) ---\n`);

    if (dueTasks.length === 0) {
      console.log('✅ No maintenance tasks are due right now. Keep riding!\n');
    } else {
      console.log(`🔴 ${dueTasks.length} task(s) are due:\n`);
      dueTasks.forEach((s) => {
        const intervalLabel = `every ${s.task.intervalValue} ${s.task.intervalUnit}`;
        console.log(`  ✗ ${s.task.name} (${intervalLabel})`);
        console.log(`    ${s.task.description}`);
      });
      console.log();
    }

    if (upcomingTasks.length > 0) {
      console.log('📋 Upcoming (not yet due):\n');
      upcomingTasks.forEach((s) => {
        const isTimeBased = s.task.intervalType === 'time';
        const current = isTimeBased ? currentMonths : currentMiles;
        const remaining = s.nextDueValue - current;
        const unitLabel = s.task.intervalUnit;
        console.log(
          `  ✓ ${s.task.name} — due in ${remaining.toFixed(0)} ${unitLabel}`
        );
      });
      console.log();
    }
  }

  private printAllTasks(): void {
    console.log('\n--- ALL MAINTENANCE TASKS ---\n');
    MAINTENANCE_TASKS.forEach((task, index) => {
      console.log(
        `${index + 1}. ${task.name} — every ${task.intervalValue} ${task.intervalUnit}`
      );
      console.log(`   ${task.description}`);
      console.log();
    });
  }
}

export default MaintenanceScheduler;
