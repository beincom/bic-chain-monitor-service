import { Injectable, Logger } from '@nestjs/common';

import { AlertMessage, IAlertProvider, PROVIDERS } from '../../alert.provider';
import { BALANCE_BOT } from './sender';

@Injectable()
export class BicChatAlertProvider implements IAlertProvider {
  private readonly _logger: Logger = new Logger(BicChatAlertProvider.name);

  private readonly _bicChatWebhookUrl: string;
  constructor() {
    this._bicChatWebhookUrl = process.env.BIC_CHAT_WEBHOOK_URL;
  }

  private _buildMessage(message: AlertMessage) {
    const type = message.data.type;
    if (type === 'balance') {
      // TODO
      return {
        ...BALANCE_BOT,
        text: '', // create msg here , support markdown
      };
    }
    return {
      username: 'Unknown',
      icon_url: 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg',
      text: 'Unknown',
    };
  }

  async send(message: AlertMessage): Promise<boolean> {
    if (!this._bicChatWebhookUrl) {
      return false;
    }

    try {
      const res = await fetch(this._bicChatWebhookUrl, {
        method: 'POST',
        body: JSON.stringify(this._buildMessage(message)),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        this._logger.log(await res.text());
        return true;
      }
    } catch (ex) {
      this._logger.warn(ex.message);
    }
    return false;
  }

  name(): string {
    return PROVIDERS.BIC_CHAT;
  }
}
