#!/usr/bin/env node

// Simple startup script for production deployment
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting DialoqBase server...');

// Ensure required environment variables
const requiredEnvVars = ['DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Set default values for optional environment variables
process.env.PORT = process.env.PORT || '3001';
process.env.HOST = process.env.HOST || '0.0.0.0';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Ensure we have Redis URL in expected format
if (!process.env.DB_REDIS_URL && !process.env.REDIS_URL) {
  console.error('Missing Redis URL. Set either DB_REDIS_URL or REDIS_URL');
  process.exit(1);
}

const appPath = path.join(__dirname, 'app.js');

console.log(`Starting Fastify server at ${process.env.HOST}:${process.env.PORT}`);

// Use fastify CLI to start the app with proper port binding
const fastifyProcess = spawn('npx', ['fastify', 'start', appPath, '--port', process.env.PORT, '--address', process.env.HOST], {
  stdio: 'inherit',
  env: {
    ...process.env,
  }
});

fastifyProcess.on('exit', (code) => {
  console.log(`Fastify process exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received, terminating Fastify process...');
  fastifyProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('SIGINT received, terminating Fastify process...');
  fastifyProcess.kill('SIGINT');
});
