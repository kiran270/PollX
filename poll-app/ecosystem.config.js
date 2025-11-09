// PM2 Configuration File
// This file configures how PM2 manages your application

module.exports = {
  apps: [
    {
      name: 'poll-app',
      script: 'npm',
      args: 'start',
      cwd: '/home/ubuntu/poll-app',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/home/ubuntu/logs/poll-app-error.log',
      out_file: '/home/ubuntu/logs/poll-app-out.log',
      log_file: '/home/ubuntu/logs/poll-app-combined.log',
      time: true,
    },
  ],
};
