module.exports = {
  apps: [
    {
      name: 'D2-Vendor-Alert',
      script: 'node',
      args: 'dist/apps/d2-vendor-alert/app.js',
    },
    {
      name: 'Discord-Notifier',
      script: 'node',
      args: 'dist/apps/discord-notifier/app.js',
    },
  ],
};
