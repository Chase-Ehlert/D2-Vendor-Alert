import { Configuration } from 'pm2';

const config: Configuration = {
  apps: [
    {
      name: 'D2-Vendor-Alert',
      script: 'ts-node-esm',
      args: 'src/app.ts',
    },
  ],
};

export default config;

