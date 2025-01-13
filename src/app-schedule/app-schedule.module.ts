import { Module } from '@nestjs/common';
import { AppScheduleService } from './app-schedule.service';
import { FixedTask } from './fixed-task';
import { DynamicTask } from './dynamic-task';

@Module({
  providers: [AppScheduleService, FixedTask, DynamicTask],
})
export class AppScheduleModule {}
