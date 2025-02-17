import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Addressable, Contract, formatUnits } from 'ethers';
import { AlertMessage } from 'src/alert/alert.provider';
import { BicChatAlertProvider } from 'src/alert/providers/bic-chat/bic-chat.provider';
import { balanceMessage, bonusMessage, depositMessage, faucetMessage, gasMessage, MessageData, paymasterMessage, redeemMessage } from 'src/alert/providers/bic-chat/messages/balance/message';
import { IBonusStation, IFaucetStation, IPaymaster, IProvider, IRedeemStation } from 'src/config';
import { ENTRYPOINTABI } from 'src/utils/abis/entrypoint.abi';
import { getBalance } from 'src/utils/balance.util';
import { formatTime } from 'src/utils/timeFormat.util';

@Injectable()
export class FixedTask {
  private readonly logger = new Logger(FixedTask.name);
  private readonly bicChatProvider = new BicChatAlertProvider();
  private readonly provider: IProvider;
  private readonly faucetStation: IFaucetStation;
  private readonly bonusStation: IBonusStation;
  private readonly redeemStation: IRedeemStation;
  private readonly paymasterStation: IPaymaster;
  public constructor(private readonly _configService: ConfigService) {
    this.provider = this._configService.get<IProvider>('provider');
    this.faucetStation = this._configService.get<IFaucetStation>("faucetStation");
    this.bonusStation = this._configService.get<IBonusStation>("bonusStation");
    this.redeemStation = this._configService.get<IRedeemStation>("redeemStation");
    this.paymasterStation = this._configService.get<IPaymaster>("paymaster");
  }

  @Cron('0 0 12 * * *', {
    name: 'Check Balance'
  })
  checkBalance() {
    this.logger.debug('Check Balance');
    const stations = this.faucetStation.operators.concat(this.redeemStation.operators).concat(this.bonusStation.operators);
    
    try {      
      stations.filter((val: Addressable) => val).map(async(operator: Addressable) => {
        let gasBalanceOfOperator = await getBalance(
          this.provider.rpcProvider,
          this.logger,
          operator
        );
        let formatBalance = formatUnits(gasBalanceOfOperator.balance, gasBalanceOfOperator.decimals);
        let messageData: MessageData = {
          title: "Check Gas Balance",
          time: new Date().toLocaleString(),
          network: this.provider.networkName,
          env: this.provider.env,
          msg: '',
          parameters: {
            operator: operator,
            symbol: gasBalanceOfOperator.symbol,
            decimals: gasBalanceOfOperator.decimals,
            balance: formatBalance,
          }
        };
        let alertMessage: AlertMessage = {
          title: 'Gas Monitor',
          message: balanceMessage(messageData),
          level: 'info',
          data: {
            type: 'balance',
          }
        };  
        this.bicChatProvider.send(alertMessage)
      });
  
      this.faucetStation.operators.filter((val: Addressable) => val).map(async(operator: Addressable) => {
        let faucetBalanceOfOperator = await getBalance(
          this.provider.rpcProvider,
          this.logger,
          operator,
          this.faucetStation.monitoredToken
        );
        let formatBalance = formatUnits(faucetBalanceOfOperator.balance, faucetBalanceOfOperator.decimals);
        let messageData: MessageData = {
          title: "Check Faucet Balance",
          time: new Date().toLocaleString(),
          network: this.provider.networkName,
          env: this.provider.env,
          msg: '',
          parameters: {
            operator: operator,
            symbol: faucetBalanceOfOperator.symbol,
            decimals: faucetBalanceOfOperator.decimals.toString(),
            balance: formatBalance,
          }
        };
        let alertMessage: AlertMessage = {
          title: 'Check Faucet Balance',
          message: balanceMessage(messageData),
          level: 'info',
          data: {
            type: 'balance',
          }
        };  
        this.bicChatProvider.send(alertMessage)
      });

      this.bonusStation.operators.filter((val: Addressable) => val).map(async(operator: Addressable) => {
        let bonusBalanceOfOperator = await getBalance(
          this.provider.rpcProvider,
          this.logger,
          operator,
          this.bonusStation.monitoredToken
        );
        let formatBalance = formatUnits(bonusBalanceOfOperator.balance, bonusBalanceOfOperator.decimals);
        let messageData: MessageData = {
          title: "Check Bonus Balance",
          time: new Date().toLocaleString(),
          network: this.provider.networkName,
          env: this.provider.env,
          msg: '',
          parameters: {
            operator: operator,
            symbol: bonusBalanceOfOperator.symbol,
            decimals: bonusBalanceOfOperator.decimals.toString(),
            balance: formatBalance,
          }
        };
        let alertMessage: AlertMessage = {
          title: 'Check Bonus Balance',
          message: balanceMessage(messageData),
          level: 'info',
          data: {
            type: 'balance',
          }
        };  
        this.bicChatProvider.send(alertMessage)
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  @Cron('0 0 12 * * *', {
    name: 'Check paymaster deposit'
  })
  checkPaymasterDeposit() {
    this.logger.debug('Check Paymaster Deposit');    
    try {
      const entrypointContract = new Contract(this.paymasterStation.entrypoint, ENTRYPOINTABI, this.provider.rpcProvider);
      (async() => {
        const depositData = await entrypointContract.deposits(this.paymasterStation.paymaster);
        let formatDeposit = formatUnits(depositData[0], 18);
        let messageData: MessageData = {
          title: "Check Paymaster Deposit",
          time: new Date().toLocaleString(),
          network: this.provider.networkName,
          env: this.provider.env,
          msg: '',
          parameters: {
            paymaster: this.paymasterStation.paymaster,
            entrypoint: this.paymasterStation.entrypoint,
            symbol: 'ETH',
            decimals: 18,
            deposit: formatDeposit,
            stake: formatUnits(depositData[2], 18),
            unstakeDelaySec: depositData[3].toString(),
            withdrawTime: formatTime(Number(depositData[4])),
          }
        };
        let alertMessage: AlertMessage = {
          title: 'Monitor Paymaster Station',
          message: depositMessage(messageData),
          level: 'info',
          data: {
            type: 'balance',
          }
        };    
        this.bicChatProvider.send(alertMessage)
      })()
    } catch (error) {
      this.logger.error(error);
    }
  }

  @Cron('0 * * * * *', {
    name: 'Monitor gas station'
  })
  monitorGasStation() {
    this.logger.debug('Monitor Gas Station');
    const stations = this.faucetStation.operators.concat(this.redeemStation.operators).concat(this.bonusStation.operators);
    
    try {
      stations.filter((val: Addressable) => val).map(async(operator: Addressable) => {
        let gasBalanceOfOperator = await getBalance(
          this.provider.rpcProvider,
          this.logger,
          operator
        );
        const feeData = await this.provider.rpcProvider.getFeeData();
        let operations = gasBalanceOfOperator.balance / BigInt(this.faucetStation.gasLimit * Number(feeData.gasPrice));
        let msg = (operations <= this.faucetStation.emergency * this.faucetStation.threshold / 100) ?
          `**🚨 Emergency Call**
          The native balance of operator ${operator} can handle ${operations} ops which is below than ${this.faucetStation.emergency}% of threshold ${this.faucetStation.threshold}. Please deposit more ETH to the operator ${operator}`
          : '';
        if (msg) {
          let formatBalance = formatUnits(gasBalanceOfOperator.balance, gasBalanceOfOperator.decimals);
          let messageData: MessageData = {
            title: "Monitor Gas Station",
            time: new Date().toLocaleString(),
            network: this.provider.networkName,
            env: this.provider.env,
            msg: msg,
            parameters: {
              operator: operator,
              symbol: gasBalanceOfOperator.symbol,
              decimals: gasBalanceOfOperator.decimals,
              balance: formatBalance,
              tolerance: operations.toString(),
              threshold: this.faucetStation.threshold,
              emergency: this.faucetStation.emergency,
              gasLimit: this.faucetStation.gasLimit,
            }
          };
          let alertMessage: AlertMessage = {
            title: 'Monitor Gas Station',
            message: gasMessage(messageData),
            level: 'warning',
            data: {
              type: 'balance',
            }
          };    
          this.bicChatProvider.send(alertMessage)
        }
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  @Cron('0 * * * * *', {
    name: 'Monitor faucet station'
  })
  monitorFaucetStation() {
    this.logger.debug('Monitor Faucet Station');    
    try {
      this.faucetStation.operators.filter((val: Addressable) => val).map(async(operator: Addressable) => {
        let faucetBalanceOfOperator = await getBalance(
          this.provider.rpcProvider,
          this.logger,
          operator,
          this.faucetStation.monitoredToken
        );
        let operations = faucetBalanceOfOperator.balance / BigInt(this.faucetStation.faucetAmount);
        let msg = (operations <= this.faucetStation.emergency * this.faucetStation.threshold / 100) ?
          `**🚨 Emergency Call**
          The ${faucetBalanceOfOperator.symbol} balance of operator ${operator} can handle ${operations} ops which is below than ${this.faucetStation.emergency}% of threshold ${this.faucetStation.threshold}. Please deposit more ${this.faucetStation.monitoredToken} to the operator ${operator}`
          : '';
        if (msg) {
          let formatBalance = formatUnits(faucetBalanceOfOperator.balance, faucetBalanceOfOperator.decimals);
          let messageData: MessageData = {
            title: "Monitor Faucet Station",
            time: new Date().toLocaleString(),
            network: this.provider.networkName,
            env: this.provider.env,
            msg: msg,
            parameters: {
              operator: operator,
              symbol: faucetBalanceOfOperator.symbol,
              decimals: faucetBalanceOfOperator.decimals.toString(),
              balance: formatBalance,
              faucetAmount: this.faucetStation.faucetAmount,
              tolerance: operations.toString(),
              threshold: this.faucetStation.threshold,
              emergency: this.faucetStation.emergency,
              monitoredToken: this.faucetStation.monitoredToken
            }
          };
          let alertMessage: AlertMessage = {
            title: 'Monitor Faucet Station',
            message: faucetMessage(messageData),
            level: 'warning',
            data: {
              type: 'balance',
            }
          };;    
          this.bicChatProvider.send(alertMessage)
        }
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  @Cron('0 * * * * *', {
    name: 'Monitor bonus station'
  })
  monitorBonusStation() {
    this.logger.debug('Monitor Bonus Station');    
    try {
      this.bonusStation.operators.filter((val: Addressable) => val).map(async(operator: Addressable) => {
        let bonusBalanceOfOperator = await getBalance(
          this.provider.rpcProvider,
          this.logger,
          operator,
          this.bonusStation.monitoredToken
        );
        let operations = bonusBalanceOfOperator.balance / BigInt(this.bonusStation.bonusAmount);
        let msg = (operations <= this.bonusStation.emergency * this.bonusStation.threshold / 100) ?
          `**🚨 Emergency Call**
          The ${bonusBalanceOfOperator.symbol} balance of operator ${operator} can handle ${operations} ops which is below than ${this.bonusStation.emergency}% of threshold ${this.bonusStation.threshold}. Please deposit more ${this.bonusStation.monitoredToken} to the operator ${operator}`
          : '';
        if (msg) {
          let formatBalance = formatUnits(bonusBalanceOfOperator.balance, bonusBalanceOfOperator.decimals);
          let messageData: MessageData = {
            title: "Monitor Bonus Station",
            time: new Date().toLocaleString(),
            network: this.provider.networkName,
            env: this.provider.env,
            msg: msg,
            parameters: {
              operator: operator,
              symbol: bonusBalanceOfOperator.symbol,
              decimals: bonusBalanceOfOperator.decimals.toString(),
              balance: formatBalance,
              bonusAmount: this.bonusStation.bonusAmount,
              tolerance: operations.toString(),
              threshold: this.bonusStation.threshold,
              emergency: this.bonusStation.emergency,
              monitoredToken: this.bonusStation.monitoredToken
            }
          };
          let alertMessage: AlertMessage = {
            title: 'Monitor Bonus Station',
            message: bonusMessage(messageData),
            level: 'warning',
            data: {
              type: 'balance',
            }
          };;    
          this.bicChatProvider.send(alertMessage)
        }
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  @Cron('0 * * * * *', {
    name: 'Monitor redeem station'
  })
  monitorRedeemStation() {
    this.logger.debug('Monitor Redeem Station');    
    try {
      this.redeemStation.operators.filter((val: Addressable) => val).map(async(operator: Addressable) => {
        let gasBalanceOfOperator = await getBalance(
          this.provider.rpcProvider,
          this.logger,
          operator
        );
        const feeData = await this.provider.rpcProvider.getFeeData();
        let operations = gasBalanceOfOperator.balance / BigInt(this.redeemStation.gasLimit * Number(feeData.gasPrice));
        let msg = (operations <= this.redeemStation.emergency * this.redeemStation.threshold / 100) ?
          `**🚨 Emergency Call**
          The native balance of operator ${operator} can handle ${operations} ops which is below than ${this.redeemStation.emergency}% of threshold ${this.redeemStation.threshold}. Please deposit more ETH to the operator ${operator}`
          : '';
        if (msg) {
          let formatBalance = formatUnits(gasBalanceOfOperator.balance, gasBalanceOfOperator.decimals);
          let messageData: MessageData = {
            title: "Monitor Redeem Station",
            time: new Date().toLocaleString(),
            network: this.provider.networkName,
            env: this.provider.env,
            msg: msg,
            parameters: {
              operator: operator,
              symbol: gasBalanceOfOperator.symbol,
              decimals: gasBalanceOfOperator.decimals,
              balance: formatBalance,
              tolerance: operations.toString(),
              threshold: this.redeemStation.threshold,
              emergency: this.redeemStation.emergency,
              gasLimit: this.redeemStation.gasLimit,
            }
          };
          let alertMessage: AlertMessage = {
            title: 'Monitor Redeem Station',
            message: redeemMessage(messageData),
            level: 'warning',
            data: {
              type: 'balance',
            }
          };    
          this.bicChatProvider.send(alertMessage)
        }
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  @Cron('0 * * * * *', {
    name: 'Monitor paymaster station'
  })
  monitorPaymasterStation() {
    this.logger.debug('Monitor Paymaster Station');    
    try {
      const entrypointContract = new Contract(this.paymasterStation.entrypoint, ENTRYPOINTABI, this.provider.rpcProvider);
      (async() => {
        const depositData = await entrypointContract.deposits(this.paymasterStation.paymaster);
        const feeData = await this.provider.rpcProvider.getFeeData();
        const operations = depositData[0] / BigInt(this.paymasterStation.gasLimit * Number(feeData.gasPrice));
        let msg = (operations <= this.paymasterStation.emergency * this.paymasterStation.threshold / 100) ?
          `**🚨 Emergency Call**
          The deposit balance of paymaster ${this.paymasterStation.paymaster} in entrypoint ${this.paymasterStation.entrypoint} can handle ${operations} ops which is below than ${this.paymasterStation.emergency}% of threshold ${this.paymasterStation.threshold}. Please deposit more ETH to the entrypoint ${this.paymasterStation.entrypoint}`
          : '';
        if (msg) {
          let formatDeposit = formatUnits(depositData[0], 18);
          let messageData: MessageData = {
            title: "Monitor Paymaster Station",
            time: new Date().toLocaleString(),
            network: this.provider.networkName,
            env: this.provider.env,
            msg: msg,
            parameters: {
              paymaster: this.paymasterStation.paymaster,
              entrypoint: this.paymasterStation.entrypoint,
              symbol: 'ETH',
              decimals: 18,
              deposit: formatDeposit,
              tolerance: operations.toString(),
              threshold: this.paymasterStation.threshold,
              emergency: this.paymasterStation.emergency,
              gasLimit: this.paymasterStation.gasLimit,
            }
          };
          let alertMessage: AlertMessage = {
            title: 'Monitor Paymaster Station',
            message: paymasterMessage(messageData),
            level: 'warning',
            data: {
              type: 'balance',
            }
          };    
          this.bicChatProvider.send(alertMessage)
        }
      })()
    } catch (error) {
      this.logger.error(error);
    }
  }
}
