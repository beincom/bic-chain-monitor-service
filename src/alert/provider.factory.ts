import { IAlertProvider } from './alert.provider';

export class AlertFactory {
  private readonly providers: Map<string, IAlertProvider>;

  constructor(providers: IAlertProvider[]) {
    this.providers = new Map();
    providers.forEach((provider) => {
      this.providers.set(provider.name(), provider);
    });
  }

  getProvider(name: string): IAlertProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Alert provider ${name} not found`);
    }
    return provider;
  }

  getAllProviders(): IAlertProvider[] {
    return Array.from(this.providers.values());
  }
}
