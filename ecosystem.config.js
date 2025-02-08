module.exports = {
  apps: [{
    name: 'revisao-api',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    env_staging: {
      NODE_ENV: 'staging',
      PORT: 8080
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: 'logs/error.log',
    out_file: 'logs/out.log',
    merge_logs: true,
    time: true
  }],
  deploy: {
    production: {
      user: 'node',
      host: 'production-server',
      ref: 'origin/main',
      repo: 'git@github.com:YohanPlaquesOliveira/revis-o.git',
      path: '/var/www/production',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production',
        CURRENT_USER: process.env.CURRENT_USER,
        CURRENT_TIMESTAMP: new Date().toISOString()
      }
    },
    staging: {
      user: 'node',
      host: 'staging-server',
      ref: 'origin/develop',
      repo: 'git@github.com:YohanPlaquesOliveira/revis-o.git',
      path: '/var/www/staging',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging',
      env: {
        NODE_ENV: 'staging',
        CURRENT_USER: process.env.CURRENT_USER,
        CURRENT_TIMESTAMP: new Date().toISOString()
      }
    }
  }
};