const http = require('http');
const { promisify } = require('util');
const sleep = promisify(setTimeout);

class HealthCheck {
  static async check(retries = 3, delay = 2000) {
    const options = {
      host: process.env.HOST || 'localhost',
      port: process.env.PORT || 8080,
      timeout: 5000,
      path: '/health'
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const healthy = await this.makeRequest(options);
        if (healthy) {
          console.log('Health check passed');
          process.exit(0);
        }
      } catch (error) {
        console.error(`Health check attempt ${attempt} failed:`, error.message);
        
        if (attempt === retries) {
          console.error('Health check failed after all retries');
          process.exit(1);
        }
        
        await sleep(delay * attempt); // Exponential backoff
      }
    }
  }

  static makeRequest(options) {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve(response.status === 'healthy');
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }
}

HealthCheck.check().catch(console.error);