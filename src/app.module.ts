import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AlertModule } from './alert';
import { AppScheduleModule } from './app-schedule';
import { ConfigModule } from '@nestjs/config';
import { getConfigs } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [getConfigs],
    }),
    ScheduleModule.forRoot(),
    AlertModule,
    AppScheduleModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
