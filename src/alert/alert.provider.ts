export type AlertMessage<T = Record<string, any>> = {
  title?: string;
  message?: string;
  level?: 'info' | 'warning' | 'error' | 'critical';
  data?: T;
};

export interface IAlertProvider {
  send(message: AlertMessage): Promise<boolean>;
  name(): string;
}

export const PROVIDERS = {
  SLACK: 'slack',
  BIC_CHAT: 'bic_chat',
};
