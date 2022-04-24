module.exports = {
  apps: [
    {
      name: 'videoconf-backend-dev',
      script: 'yarn',
      args: 'develop',
      interpreter: 'none',
    },
    {
      name: 'videoconf-backend',
      script: 'yarn',
      args: 'start',
      interpreter: 'none',
      error_file: './pm2_outputs/prod/err.log',
      out_file: './pm2_outputs/prod/out.log',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
