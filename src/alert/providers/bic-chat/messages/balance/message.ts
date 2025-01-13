export type MessageData = {
  time: string;
  parameters: string;
  network: string;
  env: string;
  msg: string;
  error: string;
};

export const message = (data: MessageData) =>
  `** ✅ Balance status**

| Detail   | Value                                      |
|----------|--------------------------------------------|
| ENV      | ${data.env}|
| Network  | ${data.network}|
| Time     | ${data.time}|

**Error**:
\`\`\`json
${data.msg}
\`\`\`
**Error Detail**
\`\`\`json
${data.error}
\`\`\`
`;
