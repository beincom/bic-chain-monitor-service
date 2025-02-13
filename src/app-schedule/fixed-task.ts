import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Addressable, Contract, formatUnits, JsonRpcProvider } from 'ethers';
import { AlertMessage } from 'src/alert/alert.provider';
import { BicChatAlertProvider } from 'src/alert/providers/bic-chat/bic-chat.provider';
import { balanceMessage, depositMessage, faucetMessage, gasMessage, MessageData, paymasterMessage, redeemMessage } from 'src/alert/providers/bic-chat/messages/balance/message';
import { IFaucetStation, IPaymaster, IProvider, IRedeemStation } from 'src/config';
import { ENTRYPOINTABI } from 'src/utils/abis/entrypoint.abi';
import { getBalance } from 'src/utils/balance.util';
import { formatTime } from 'src/utils/timeFormat.util';

@Injectable()
export class FixedTask {
  private readonly logger = new Logger(FixedTask.name);
  private readonly bicChatProvider = new BicChatAlertProvider();
  public constructor(private readonly _configService: ConfigService) {}

  @Cron('* * 12 * * *', {
    name: 'Check Balance'
  })
  checkBalance() {
    this.logger.debug('Check Balance');
    const provider = this._configService.get<IProvider>("provider");
    const faucetStation = this._configService.get<IFaucetStation>("faucetStation");
    const redeemStation = this._configService.get<IRedeemStation>("redeemStation");
    const stations = faucetStation.operators.concat(redeemStation.operators);
    
    try {
      const rpcProvider = new JsonRpcProvider(provider.rpc, provider.chainId);
      
      stations.filter((val: Addressable) => val).map(async(operator: Addressable) => {
        let gasBalanceOfOperator = await getBalance(
          rpcProvider,
          this.logger,
          operator
        );
        let formatBalance = formatUnits(gasBalanceOfOperator.balance, gasBalanceOfOperator.decimals);
        let messageData: MessageData = {
          title: "Check Balance",
          time: new Date().toLocaleString(),
          network: provider.networkName,
          env: provider.env,
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
  
      faucetStation.operators.filter((val: Addressable) => val).map(async(operator: Addressable) => {
        let faucetBalanceOfOperator = await getBalance(
          rpcProvider,
          this.logger,
          operator,
          faucetStation.monitoredToken
        );
        let formatBalance = formatUnits(faucetBalanceOfOperator.balance, faucetBalanceOfOperator.decimals);
        let messageData: MessageData = {
          title: "Check Balance",
          time: new Date().toLocaleString(),
          network: provider.networkName,
          env: provider.env,
          msg: '',
          parameters: {
            operator: operator,
            symbol: faucetBalanceOfOperator.symbol,
            decimals: faucetBalanceOfOperator.decimals.toString(),
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
    } catch (error) {
      this.logger.error(error);
    }
  }

  @Cron('* * 12 * * *', {
    name: 'Check paymaster deposit'
  })
  checkPaymasterDeposit() {
    this.logger.debug('Check Paymaster Deposit');
    const provider = this._configService.get<IProvider>("provider");
    const paymasterStation = this._configService.get<IPaymaster>("paymaster");
    
    try {
      const rpcProvider = new JsonRpcProvider(provider.rpc, provider.chainId);

      const entrypointContract = new Contract(paymasterStation.entrypoint, ENTRYPOINTABI, rpcProvider);
      (async() => {
        const depositData = await entrypointContract.deposits(paymasterStation.paymaster);
        let formatDeposit = formatUnits(depositData[0], 18);
        let messageData: MessageData = {
          title: "Check Paymaster Deposit",
          time: new Date().toLocaleString(),
          network: provider.networkName,
          env: provider.env,
          msg: '',
          parameters: {
            paymaster: paymasterStation.paymaster,
            entrypoint: paymasterStation.entrypoint,
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
    const provider = this._configService.get<IProvider>("provider");
    const faucetStation = this._configService.get<IFaucetStation>("faucetStation");
    const redeemStation = this._configService.get<IRedeemStation>("redeemStation");
    const stations = faucetStation.operators.concat(redeemStation.operators);
    
    try {
      const rpcProvider = new JsonRpcProvider(provider.rpc, provider.chainId);

      stations.filter((val: Addressable) => val).map(async(operator: Addressable) => {
        let gasBalanceOfOperator = await getBalance(
          rpcProvider,
          this.logger,
          operator
        );
        const feeData = await rpcProvider.getFeeData();
        let operations = gasBalanceOfOperator.balance / BigInt(faucetStation.gasLimit * Number(feeData.gasPrice));
        let msg = (operations <= faucetStation.emergency * faucetStation.threshold / 100) ?
          `**🚨 Emergency Call**
          The native balance of operator ${operator} can handle ${operations} ops which is below than ${faucetStation.emergency}% of threshold ${faucetStation.threshold}. Please deposit more ETH to the operator ${operator}`
          : '';
        if (msg) {
          let formatBalance = formatUnits(gasBalanceOfOperator.balance, gasBalanceOfOperator.decimals);
          let messageData: MessageData = {
            title: "Monitor Gas Station",
            time: new Date().toLocaleString(),
            network: provider.networkName,
            env: provider.env,
            msg: msg,
            parameters: {
              operator: operator,
              symbol: gasBalanceOfOperator.symbol,
              decimals: gasBalanceOfOperator.decimals,
              balance: formatBalance,
              tolerance: operations.toString(),
              threshold: faucetStation.threshold,
              emergency: faucetStation.emergency,
              gasLimit: faucetStation.gasLimit,
            }
          };
          let alertMessage: AlertMessage = {
            title: 'Gas Monitor',
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
    const provider = this._configService.get<IProvider>("provider");
    const faucetStation = this._configService.get<IFaucetStation>("faucetStation");
    
    try {
      const rpcProvider = new JsonRpcProvider(provider.rpc, provider.chainId);

      faucetStation.operators.filter((val: Addressable) => val).map(async(operator: Addressable) => {
        let faucetBalanceOfOperator = await getBalance(
          rpcProvider,
          this.logger,
          operator,
          faucetStation.monitoredToken
        );
        let operations = faucetBalanceOfOperator.balance / BigInt(faucetStation.faucetAmount);
        let msg = (operations <= faucetStation.emergency * faucetStation.threshold / 100) ?
          `**🚨 Emergency Call**
          The ${faucetBalanceOfOperator.symbol} balance of operator ${operator} can handle ${operations} ops which is below than ${faucetStation.emergency}% of threshold ${faucetStation.threshold}. Please deposit more ${faucetStation.monitoredToken} to the operator ${operator}`
          : '';
        if (msg) {
          let formatBalance = formatUnits(faucetBalanceOfOperator.balance, faucetBalanceOfOperator.decimals);
          let messageData: MessageData = {
            title: "Monitor Faucet Station",
            time: new Date().toLocaleString(),
            network: provider.networkName,
            env: provider.env,
            msg: msg,
            parameters: {
              operator: operator,
              symbol: faucetBalanceOfOperator.symbol,
              decimals: faucetBalanceOfOperator.decimals.toString(),
              balance: formatBalance,
              faucetAmount: faucetStation.faucetAmount,
              tolerance: operations.toString(),
              threshold: faucetStation.threshold,
              emergency: faucetStation.emergency,
              monitoredToken: faucetStation.monitoredToken
            }
          };
          let alertMessage: AlertMessage = {
            title: 'Gas Monitor',
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
    name: 'Monitor redeem station'
  })
  monitorRedeemStation() {
    this.logger.debug('Monitor Redeem Station');
    const provider = this._configService.get<IProvider>("provider");
    const redeemStation = this._configService.get<IRedeemStation>("redeemStation");
    
    try {
      const rpcProvider = new JsonRpcProvider(provider.rpc, provider.chainId);

      redeemStation.operators.filter((val: Addressable) => val).map(async(operator: Addressable) => {
        let gasBalanceOfOperator = await getBalance(
          rpcProvider,
          this.logger,
          operator
        );
        const feeData = await rpcProvider.getFeeData();
        let operations = gasBalanceOfOperator.balance / BigInt(redeemStation.gasLimit * Number(feeData.gasPrice));
        let msg = (operations <= redeemStation.emergency * redeemStation.threshold / 100) ?
          `**🚨 Emergency Call**
          The native balance of operator ${operator} can handle ${operations} ops which is below than ${redeemStation.emergency}% of threshold ${redeemStation.threshold}. Please deposit more ETH to the operator ${operator}`
          : '';
        if (msg) {
          let formatBalance = formatUnits(gasBalanceOfOperator.balance, gasBalanceOfOperator.decimals);
          let messageData: MessageData = {
            title: "Monitor Redeem Station",
            time: new Date().toLocaleString(),
            network: provider.networkName,
            env: provider.env,
            msg: msg,
            parameters: {
              operator: operator,
              symbol: gasBalanceOfOperator.symbol,
              decimals: gasBalanceOfOperator.decimals,
              balance: formatBalance,
              tolerance: operations.toString(),
              threshold: redeemStation.threshold,
              emergency: redeemStation.emergency,
              gasLimit: redeemStation.gasLimit,
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
    const provider = this._configService.get<IProvider>("provider");
    const paymasterStation = this._configService.get<IPaymaster>("paymaster");
    
    try {
      const rpcProvider = new JsonRpcProvider(provider.rpc, provider.chainId);

      const entrypointContract = new Contract(paymasterStation.entrypoint, ENTRYPOINTABI, rpcProvider);
      (async() => {
        const depositData = await entrypointContract.deposits(paymasterStation.paymaster);
        const feeData = await rpcProvider.getFeeData();
        const operations = depositData[0] / BigInt(paymasterStation.gasLimit * Number(feeData.gasPrice));
        let msg = (operations <= paymasterStation.emergency * paymasterStation.threshold / 100) ?
          `**🚨 Emergency Call**
          The deposit balance of paymaster ${paymasterStation.paymaster} in entrypoint ${paymasterStation.entrypoint} can handle ${operations} ops which is below than ${paymasterStation.emergency}% of threshold ${paymasterStation.threshold}. Please deposit more ETH to the entrypoint ${paymasterStation.entrypoint}`
          : '';
        if (msg) {
          let formatDeposit = formatUnits(depositData[0], 18);
          let messageData: MessageData = {
            title: "Monitor Paymaster Station",
            time: new Date().toLocaleString(),
            network: provider.networkName,
            env: provider.env,
            msg: msg,
            parameters: {
              paymaster: paymasterStation.paymaster,
              entrypoint: paymasterStation.entrypoint,
              symbol: 'ETH',
              decimals: 18,
              deposit: formatDeposit,
              tolerance: operations.toString(),
              threshold: paymasterStation.threshold,
              emergency: paymasterStation.emergency,
              gasLimit: paymasterStation.gasLimit,
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
