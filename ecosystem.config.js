module.exports = {
  apps: [
    {
      name: 'pgpoint-web',
      script: 'npm',
      args: 'start', // Next.js production start
      interpreter: 'none',
      cwd: './',
      env: {
        NODE_ENV: 'production',
        PORT: 3000, 
        // DATABASE_URL is in .env, PM2 loads it automatically or we can specify
      },
      instances: 1, // Or 'max' for cluster mode
      autorestart: true,
      watch: false, // Don't watch in production
      max_memory_restart: '1G',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      combine_logs: true,
      merge_logs: true,
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
    },
  ],
};
