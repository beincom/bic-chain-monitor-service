import { Injectable } from '@nestjs/common';
import { AlertMessage, PROVIDERS } from './alert.provider';
import { AlertFactory } from './provider.factory';

@Injectable()
export class AlertService {
  constructor(private readonly alertFactory: AlertFactory) {}

  async sendAlert(
    message: AlertMessage,
    providers: string[] = [PROVIDERS.BIC_CHAT],
  ): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    await Promise.all(
      providers.map(async (providerName) => {
        try {
          const provider = this.alertFactory.getProvider(providerName);
          const result = await provider.send(message);
          results.set(providerName, result);
        } catch (error) {
          results.set(providerName, false);
        }
      }),
    );

    return results;
  }

  async broadcast(message: AlertMessage): Promise<Map<string, boolean>> {
    const providers = this.alertFactory.getAllProviders();
    const results = new Map<string, boolean>();

    await Promise.all(
      providers.map(async (provider) => {
        try {
          const result = await provider.send(message);
          results.set(provider.name(), result);
        } catch (error) {
          results.set(provider.name(), false);
        }
      }),
    );

    return results;
  }
}
