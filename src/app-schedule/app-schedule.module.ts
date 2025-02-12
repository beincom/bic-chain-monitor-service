import { Module } from '@nestjs/common';
import { AppScheduleService } from './app-schedule.service';
import { FixedTask } from './fixed-task';
import { DynamicTask } from './dynamic-task';
import { AlertModule } from 'src/alert';

@Module({
  imports: [AlertModule],
  providers: [AppScheduleService, FixedTask, DynamicTask],
})
export class AppScheduleModule {}
