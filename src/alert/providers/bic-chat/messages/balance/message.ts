export type MessageData = {
  title: string;
  time: string;
  parameters: any;
  network: string;
  env: string;
  msg: string;
};

export const balanceMessage = (data: MessageData) =>
  `** ✅ ${data.title}**

| Detail   | Value                                      |
|----------|--------------------------------------------|
| ENV      | ${data.env}|
| Network  | ${data.network}|
| Time     | ${data.time}|
| Operator     | ${data.parameters.operator}|
| Token     | ${data.parameters.symbol}|
| Balance     | ${data.parameters.balance}|

**Parameters Detail**
\`\`\`json
${JSON.stringify(data.parameters, null, 4)}
\`\`\`
`;

export const depositMessage = (data: MessageData) =>
  `** ✅ ${data.title}**

| Detail   | Value                                      |
|----------|--------------------------------------------|
| ENV      | ${data.env}|
| Network  | ${data.network}|
| Time     | ${data.time}|
| Paymaster     | ${data.parameters.paymaster}|
| Entrypoint     | ${data.parameters.entrypoint}|
| Deposit     | ${data.parameters.deposit}|
| Stake     | ${data.parameters.stake}|
| Unstake Delay Second     | ${data.parameters.unstakeDelaySec}|
| Withdraw Time     | ${data.parameters.withdrawTime}|

**Parameters Detail**
\`\`\`json
${JSON.stringify(data.parameters, null, 4)}
\`\`\`
`;

export const gasMessage = (data: MessageData) =>
  `** ✅ ${data.title}**

| Detail   | Value                                      |
|----------|--------------------------------------------|
| ENV      | ${data.env}|
| Network  | ${data.network}|
| Time     | ${data.time}|
| Operator     | ${data.parameters.operator}|
| Token     | ${data.parameters.symbol}|
| Balance     | ${data.parameters.balance}|
| Tolerance     | ${data.parameters.tolerance}|
| Threshold     | ${data.parameters.threshold}|
| Emergency     | ${data.parameters.emergency}|

**Emergency Message**:
${data.msg}
**Parameters Detail**
\`\`\`json
${JSON.stringify(data.parameters, null, 4)}
\`\`\`
`;

export const faucetMessage = (data: MessageData) =>
  `** ✅ ${data.title}**

| Detail   | Value                                      |
|----------|--------------------------------------------|
| ENV      | ${data.env}|
| Network  | ${data.network}|
| Time     | ${data.time}|
| Operator     | ${data.parameters.operator}|
| Token     | ${data.parameters.symbol}|
| Balance     | ${data.parameters.balance}|
| faucetAmount     | ${data.parameters.faucetAmount}|
| Tolerance     | ${data.parameters.tolerance}|
| Threshold     | ${data.parameters.threshold}|
| Emergency     | ${data.parameters.emergency}|

**Emergency Message**:
${data.msg}
**Parameters Detail**
\`\`\`json
${JSON.stringify(data.parameters, null, 4)}
\`\`\`
`;

export const bonusMessage = (data: MessageData) =>
  `** ✅ ${data.title}**

| Detail   | Value                                      |
|----------|--------------------------------------------|
| ENV      | ${data.env}|
| Network  | ${data.network}|
| Time     | ${data.time}|
| Operator     | ${data.parameters.operator}|
| Token     | ${data.parameters.symbol}|
| Balance     | ${data.parameters.balance}|
| bonusAmount     | ${data.parameters.bonusAmount}|
| Tolerance     | ${data.parameters.tolerance}|
| Threshold     | ${data.parameters.threshold}|
| Emergency     | ${data.parameters.emergency}|

**Emergency Message**:
${data.msg}
**Parameters Detail**
\`\`\`json
${JSON.stringify(data.parameters, null, 4)}
\`\`\`
`;

export const redeemMessage = (data: MessageData) =>
  `** ✅ ${data.title}**

| Detail   | Value                                      |
|----------|--------------------------------------------|
| ENV      | ${data.env}|
| Network  | ${data.network}|
| Time     | ${data.time}|
| Operator     | ${data.parameters.operator}|
| Token     | ${data.parameters.symbol}|
| Balance     | ${data.parameters.balance}|
| Tolerance     | ${data.parameters.tolerance}|
| Threshold     | ${data.parameters.threshold}|
| Emergency     | ${data.parameters.emergency}|

**Emergency Message**:
${data.msg}
**Parameters Detail**
\`\`\`json
${JSON.stringify(data.parameters, null, 4)}
\`\`\`
`;

export const paymasterMessage = (data: MessageData) =>
  `** ✅ ${data.title}**

| Detail   | Value                                      |
|----------|--------------------------------------------|
| ENV      | ${data.env}|
| Network  | ${data.network}|
| Time     | ${data.time}|
| Paymaster     | ${data.parameters.paymaster}|
| Entrypoint     | ${data.parameters.entrypoint}|
| Deposit     | ${data.parameters.deposit}|
| Tolerance     | ${data.parameters.tolerance}|
| Threshold     | ${data.parameters.threshold}|
| Emergency     | ${data.parameters.emergency}|

**Emergency Message**:
${data.msg}
**Parameters Detail**
\`\`\`json
${JSON.stringify(data.parameters, null, 4)}
\`\`\`
`;