import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AlertModule } from './alert';
import { AppScheduleModule } from './app-schedule';

@Module({
  imports: [ScheduleModule.forRoot(), AlertModule, AppScheduleModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
