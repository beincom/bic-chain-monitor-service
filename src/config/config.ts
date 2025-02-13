import { Addressable, AddressLike, getAddress, isAddress, JsonRpcProvider } from "ethers";

export interface IConfig {
    provider: IProvider;
    faucetStation: IFaucetStation;
    bonusStation: IBonusStation;
    redeemStation: IRedeemStation;
    paymaster: IPaymaster;
}

export interface IProvider {
    rpc: string;
    chainId: number;
    networkName: string;
    env: string;
    rpcProvider: JsonRpcProvider;
}

export interface IFaucetStation {
    operators: Addressable[];
    gasLimit: number;
    monitoredToken: Addressable;
    faucetAmount: number;
    threshold: number;
    emergency: number;
}

export interface IBonusStation {
    operators: Addressable[];
    gasLimit: number;
    monitoredToken: Addressable;
    bonusAmount: number;
    threshold: number;
    emergency: number;
}

export interface IRedeemStation {
    operators: Addressable[];
    gasLimit: number;
    threshold: number;
    emergency: number;
}

export interface IPaymaster {
    entrypoint: Addressable,
    paymaster: Addressable,
    gasLimit: number;
    threshold: number;
    emergency: number;
}

export function getConfigs(): IConfig {
    return {
        provider: {
            rpc: process.env.RPC_PROVIDER,
            chainId: parseInt(process.env.CHAINID),
            networkName: process.env.NETWORK_NAME,
            env: process.env.ENV,
            rpcProvider: new JsonRpcProvider(process.env.RPC_PROVIDER, parseInt(process.env.CHAINID))
        },
        faucetStation: {
            operators: (process.env.FAUCET_OPERATORS || '')
            .split(',')
            .filter((val: string) => {
                if (!isAddress(val)) {
                    throw new Error(`Invalid faucet operator: ${val}`);
                }
                return val
            }) as unknown[] as Addressable[],
            gasLimit: parseInt(process.env.FAUCET_GAS_LIMIT),
            monitoredToken: process.env.FAUCET_MONITORED_TOKEN as unknown as Addressable,
            faucetAmount: parseInt(process.env.FAUCET_AMOUNT),
            threshold: parseInt(process.env.FAUCET_THRESHOLD),
            emergency: parseInt(process.env.FAUCET_EMERGENCY)
        },
        bonusStation: {
            operators: (process.env.BONUS_OPERATORS || '')
            .split(',')
            .filter((val: string) => {
                if (!isAddress(val)) {
                    throw new Error(`Invalid faucet operator: ${val}`);
                }
                return val
            }) as unknown[] as Addressable[],
            gasLimit: parseInt(process.env.BONUS_GAS_LIMIT),
            monitoredToken: process.env.BONUS_MONITORED_TOKEN as unknown as Addressable,
            bonusAmount: parseInt(process.env.BONUS_AMOUNT),
            threshold: parseInt(process.env.BONUS_THRESHOLD),
            emergency: parseInt(process.env.BONUS_EMERGENCY)
        },
        redeemStation: {
            operators: (process.env.REDEEM_OPERATORS || '')
            .split(',')
            .filter((val: string) => {
                if (!isAddress(val)) {
                    throw new Error(`Invalid redeem operator: ${val}`);
                }
                return val
            })as unknown[] as Addressable[],
            gasLimit: parseInt(process.env.REDEEM_GAS_LIMIT),
            threshold: parseInt(process.env.REDEEM_THRESHOLD),
            emergency: parseInt(process.env.REDEEM_EMERGENCY)
        },
        paymaster: {
            entrypoint: process.env.PAYMASTER_ENTRYPOINT as unknown as Addressable,
            paymaster: process.env.PAYMASTER_PAYMASTER as unknown as Addressable,
            gasLimit: parseInt(process.env.PAYMASTER_GAS_LIMIT),
            threshold: parseInt(process.env.PAYMASTER_THRESHOLD),
            emergency: parseInt(process.env.PAYMASTER_EMERGENCY)
        }
    }
}