# Deployment Guide - Limbo Game

This guide provides instructions for deploying the Limbo Game application to various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Production Deployment](#production-deployment)
4. [Cloud Deployment Options](#cloud-deployment-options)
   - [Heroku](#heroku)
   - [AWS](#aws)
   - [Google Cloud Platform](#google-cloud-platform)
   - [DigitalOcean](#digitalocean)
5. [Docker Deployment](#docker-deployment)
6. [Environment Configuration](#environment-configuration)
7. [SSL/HTTPS Setup](#sslhttps-setup)
8. [Monitoring and Logging](#monitoring-and-logging)
9. [Scaling Considerations](#scaling-considerations)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying the Limbo Game, ensure you have:

- Node.js (v14 or higher)
- npm or yarn
- Git
- A code editor (e.g., VS Code)
- A terminal or command line interface

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/limbo-game.git
cd limbo-game
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Production Deployment

### Basic Production Setup

1. **Install Production Dependencies**

```bash
npm install --production
```

2. **Set Environment Variables**

Create a `.env` file in the project root:

```env
NODE_ENV=production
PORT=3000
```

3. **Start the Application**

```bash
npm start
```

### Using Process Manager

For production, it's recommended to use a process manager like PM2:

1. **Install PM2**

```bash
npm install -g pm2
```

2. **Start the Application with PM2**

```bash
pm2 start server.js --name "limbo-game"
```

3. **Configure PM2 for Auto-Restart**

Create an `ecosystem.config.js` file:

```javascript
module.exports = {
  apps: [{
    name: 'limbo-game',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

Start with:

```bash
pm2 start ecosystem.config.js
```

## Cloud Deployment Options

### Heroku

1. **Prepare for Heroku Deployment**

Create a `Procfile` in the project root:

```
web: npm start
```

2. **Deploy to Heroku**

```bash
# Login to Heroku CLI
heroku login

# Create a new Heroku app
heroku create

# Add Node.js buildpack
heroku buildpacks:set heroku/nodejs

# Deploy to Heroku
git push heroku main

# Open the application
heroku open
```

### AWS

#### Using AWS Elastic Beanstalk

1. **Install EB CLI**

```bash
pip install awsebcli
```

2. **Initialize EB Repository**

```bash
eb init
```

3. **Create Environment**

```bash
eb create production
```

4. **Deploy**

```bash
eb deploy
```

#### Using AWS EC2

1. **Launch an EC2 Instance**

- Choose an Amazon Linux 2 AMI
- Configure security groups to allow HTTP (port 80) and HTTPS (port 443)
- Launch the instance

2. **Connect to the Instance**

```bash
ssh -i your-key.pem ec2-user@your-ec2-public-dns
```

3. **Install Node.js**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.bashrc
nvm install 16
```

4. **Deploy the Application**

```bash
# Clone the repository
git clone https://github.com/yourusername/limbo-game.git
cd limbo-game

# Install dependencies
npm install

# Start the application
npm start
```

### Google Cloud Platform

#### Using Google App Engine

1. **Create app.yaml**

```yaml
runtime: nodejs16
instance_class: F2
env: standard

handlers:
  - url: /.*
    secure: always
    redirect_http_response_code: 301
    script: auto
```

2. **Deploy to App Engine**

```bash
gcloud app deploy
```

#### Using Google Cloud Run

1. **Create Dockerfile**

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

2. **Build and Deploy**

```bash
# Build the Docker image
gcloud builds submit --tag gcr.io/PROJECT-ID/limbo-game

# Deploy to Cloud Run
gcloud run deploy --image gcr.io/PROJECT-ID/limbo-game --platform managed
```

### DigitalOcean

#### Using DigitalOcean App Platform

1. **Connect Your GitHub Repository**

- In the DigitalOcean control panel, go to App Platform
- Connect your GitHub account
- Select the limbo-game repository

2. **Configure the App**

- Choose the "Node.js" runtime
- Set the build command to `npm install`
- Set the run command to `npm start`
- Configure environment variables

3. **Deploy**

Click "Create Resources" to deploy the application.

#### Using DigitalOcean Droplet

1. **Create a Droplet**

- Choose a Node.js image
- Select your plan and region
- Create the Droplet

2. **Connect to the Droplet**

```bash
ssh root@your-droplet-ip
```

3. **Deploy the Application**

```bash
# Clone the repository
git clone https://github.com/yourusername/limbo-game.git
cd limbo-game

# Install dependencies
npm install

# Start the application
npm start
```

## Docker Deployment

### 1. Create a Dockerfile

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. Build the Docker Image

```bash
docker build -t limbo-game .
```

### 3. Run the Docker Container

```bash
docker run -p 3000:3000 -d limbo-game
```

### 4. Using Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3'

services:
  limbo-game:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

Run with:

```bash
docker-compose up -d
```

## Environment Configuration

### Environment Variables

The application can be configured using environment variables:

```env
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
```

### Configuration File

For more complex configurations, create a `config.js` file:

```javascript
module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  // Add other configuration options as needed
};
```

## SSL/HTTPS Setup

### Using Let's Encrypt with Certbot

1. **Install Certbot**

```bash
# For Ubuntu/Debian
sudo apt update
sudo apt install certbot

# For CentOS/RHEL
sudo yum install certbot
```

2. **Obtain SSL Certificate**

```bash
sudo certbot certonly --standalone -d yourdomain.com
```

3. **Configure the Application to Use HTTPS**

Update `server.js`:

```javascript
const https = require('https');
const fs = require('fs');
const path = require('path');

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/fullchain.pem')
};

https.createServer(options, app).listen(443, () => {
  console.log('HTTPS Server running on port 443');
});
```

### Using Cloudflare

1. **Sign up for Cloudflare**

2. **Add Your Domain**

3. **Update DNS Records**

4. **Enable SSL/TLS**

In the Cloudflare dashboard, go to SSL/TLS and choose "Full" or "Full (strict)" mode.

## Monitoring and Logging

### Application Logging

1. **Configure Logging**

Update `server.js` to include logging:

```javascript
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create a write stream for logs
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), { flags: 'a' });

// Use morgan middleware for HTTP request logging
app.use(morgan('combined', { stream: accessLogStream }));
```

2. **Error Logging**

```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
```

### Monitoring with PM2

PM2 provides built-in monitoring:

```bash
# Monitor all processes
pm2 monit

# View logs
pm2 logs

# Check status
pm2 status
```

### External Monitoring Services

Consider using external monitoring services like:

- **Datadog**: Full-stack monitoring
- **New Relic**: Application performance monitoring
- **Sentry**: Error tracking and reporting

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancing**

Use a load balancer to distribute traffic across multiple instances:

```javascript
// Example using Node.js cluster module
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Restart the worker
  });
} else {
  // Workers can share any TCP connection
  // In this case, it's an HTTP server
  const app = express();
  app.listen(3000, () => {
    console.log(`Worker ${process.pid} started`);
  });
}
```

2. **Database Scaling**

If you add a database to your application, consider:

- Read replicas for read-heavy workloads
- Sharding for write-heavy workloads
- Connection pooling for efficient database connections

### Vertical Scaling

1. **Increase Server Resources**

- CPU: More cores for better parallel processing
- RAM: More memory for caching and session storage
- Storage: Faster SSDs for quicker data access

2. **Optimize Application Performance**

- Use caching strategies (Redis, Memcached)
- Optimize database queries
- Implement content delivery networks (CDNs)

## Troubleshooting

### Common Issues

1. **Application Won't Start**

Check the error logs:

```bash
# If using PM2
pm2 logs limbo-game

# If using systemd
journalctl -u limbo-game
```

2. **High Memory Usage**

- Check for memory leaks
- Optimize data structures
- Implement proper garbage collection

3. **Slow Response Times**

- Profile the application to identify bottlenecks
- Optimize database queries
- Consider implementing caching

### Debugging Tips

1. **Enable Debug Logging**

Set the LOG_LEVEL environment variable to 'debug':

```env
LOG_LEVEL=debug
```

2. **Use Node.js Inspector**

Start the application with the inspect flag:

```bash
node --inspect server.js
```

Then connect using Chrome DevTools or VS Code debugger.

3. **Monitor System Resources**

```bash
# Check CPU usage
top

# Check memory usage
free -m

# Check disk usage
df -h
```

### Performance Optimization

1. **Enable Compression**

```javascript
const compression = require('compression');
app.use(compression());
```

2. **Implement Caching**

```javascript
const apicache = require('apicache');
const cache = apicache.middleware;

app.get('/api/data', cache('10 minutes'), (req, res) => {
  // Your API endpoint
});
```

3. **Optimize Static File Serving**

```javascript
app.use(express.static('public', {
  maxAge: '1y',
  etag: false,
  lastModified: false
}));
```

## Backup and Recovery

### Backup Strategy

1. **Code Repository**

Ensure your code is stored in a version control system like Git.

2. **Database Backups**

If you add a database, implement regular backups:

```bash
# Example for MongoDB
mongodump --db limbo-game --out /backups/$(date +%Y%m%d)
```

3. **Configuration Backups**

Backup configuration files and environment variables:

```bash
# Backup .env file
cp .env /backups/.env.$(date +%Y%m%d)
```

### Recovery Process

1. **Restore from Backup**

```bash
# Restore code
git clone https://github.com/yourusername/limbo-game.git
cd limbo-game

# Restore database
mongorestore --db limbo-game /backups/$(date +%Y%m%d)/limbo-game

# Restore configuration
cp /backups/.env.$(date +%Y%m%d) .env
```

2. **Start the Application**

```bash
npm install
npm start
```

## Conclusion

This deployment guide covers various methods for deploying the Limbo Game application, from local development to cloud platforms. Choose the deployment method that best fits your needs and resources.

For additional support or questions, refer to the project's GitHub repository or contact the development team.