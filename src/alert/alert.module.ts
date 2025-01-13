import { Module } from '@nestjs/common';
import { AlertService } from './alert.service';
import { AlertFactory } from './provider.factory';
import { BicChatAlertProvider } from './providers/bic-chat/bic-chat.provider';

@Module({
  providers: [
    {
      provide: AlertFactory,
      useFactory: (bicChatProvider: BicChatAlertProvider) => {
        return new AlertFactory([bicChatProvider]);
      },
      inject: [BicChatAlertProvider],
    },
    BicChatAlertProvider,
    AlertService,
  ],
  exports: [AlertService],
})
export class AlertModule {}
