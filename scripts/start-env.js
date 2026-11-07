#!/usr/bin/env node
/**
 * Starts Expo against one backend: node scripts/start-env.js <prod|dev|local> [expo start flags]
 * (npm run start:prod / start:dev / start:local). Works the same on Windows, macOS and Linux.
 *
 * Clears EXPO_PUBLIC_API_URL so an old override in .env cannot silently win, and clears the Metro
 * cache so the inlined backend address really changes. The dev address comes from
 * EXPO_PUBLIC_DEV_API_URL in .env (the value of `terraform output -raw dev_api_url`).
 */
const { spawn } = require('child_process');

const target = process.argv[2];
if (!['prod', 'dev', 'local'].includes(target)) {
  console.error('Usage: node scripts/start-env.js <prod|dev|local> [expo start flags]');
  process.exit(1);
}

const env = { ...process.env, EXPO_PUBLIC_APP_ENV: target, EXPO_PUBLIC_API_URL: '' };
console.log(`Starting Expo against the ${target.toUpperCase()} backend.`);

const child = spawn('npx', ['expo', 'start', '--clear', ...process.argv.slice(3)], { stdio: 'inherit', env, shell: process.platform === 'win32' });
child.on('exit', (code) => process.exit(code ?? 0));
