import {
  Addressable,
  Contract,
  isAddress,
  JsonRpcProvider,
  ZeroAddress,
} from 'ethers';
import { ERC20ABI } from './erc20.abi';
import { Logger } from '@nestjs/common';

type Balance = {
  balance: bigint;
  decimals: number;
  symbol: string;
};

export const getBalance = async (
  provider: JsonRpcProvider,
  logger: Logger,
  owner: Addressable | string,
  tokenAddress?: Addressable | string,
): Promise<Balance> => {
  let balance: bigint = BigInt(0);
  let decimals: number = 18;
  let symbol: string = 'ETH';

  if ((tokenAddress && !isAddress(tokenAddress)) || !isAddress(owner)) {
    logger.error('Invalid addresses');
    return {
      balance,
      decimals,
      symbol,
    };
  } else if (tokenAddress && tokenAddress != ZeroAddress) {
    const byteCode = await provider.getCode(tokenAddress);
    if (byteCode.length <= 2) {
      logger.error('Invalid token address');
      return {
        balance,
        decimals,
        symbol,
      };
    }
  }

  try {
    if (tokenAddress && tokenAddress != ZeroAddress) {
      const erc20 = new Contract(tokenAddress, ERC20ABI, provider);
      [balance, symbol, decimals] = await Promise.all([
        erc20.balanceOf(owner),
        erc20.symbol(),
        erc20.decimals()
      ]);
    } else {
      balance = await provider.getBalance(owner);
    }
  } catch (error) {
    logger.error('Error: Get balance', error);
  }

  return {
    balance,
    decimals,
    symbol,
  };
};
