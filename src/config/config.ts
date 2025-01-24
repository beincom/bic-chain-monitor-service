import { Addressable } from "ethers";

export interface IConfig {
    faucetStation: IFaucetStation;
    gasStation: IGasStation;
    paymasterStation: IPaymasterStation;
}

export interface IFaucetStation {
    operators: Addressable[],
    threshold: number;
}

export interface IGasStation {
    operators: Addressable[],
    threshold: number;
}

export interface IPaymasterStation {
    operators: Addressable[],
    threshold: number;
}