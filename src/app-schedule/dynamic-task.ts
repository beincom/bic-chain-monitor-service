import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class DynamicTask {
  private readonly _logger = new Logger(DynamicTask.name);

  constructor(private readonly _schedulerRegistry: SchedulerRegistry) {}

  addCronJob(name: string, seconds: string) {
    const job = new CronJob(`${seconds} * * * * *`, () => {
      this._logger.warn(`time (${seconds}) for job ${name} to run!`);
    });

    this._schedulerRegistry.addCronJob(name, job);
    job.start();
    this._logger.warn(
      `job ${name} added for each minute at ${seconds} seconds!`,
    );
  }

  deleteCron(name: string) {
    this._schedulerRegistry.deleteCronJob(name);
    this._logger.warn(`job ${name} deleted!`);
  }

  getCrons() {
    const jobs = this._schedulerRegistry.getCronJobs();
    jobs.forEach((value, key, map) => {
      let next;
      try {
        next = value.nextDate().toJSDate();
      } catch (e) {
        next = 'error: next fire date is in the past!';
      }
      this._logger.log(`job: ${key} -> next: ${next}`);
    });
  }
}
