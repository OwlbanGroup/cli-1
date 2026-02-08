#!/usr/bin/env node

/**
 * Verify NPM Publication
 * 
 * Confirms that @blackbox_ai/blackbox-cli has been successfully published to npm registry.
 * Run this after `npm publish` to verify the package is live.
 * 
 * Usage:
 *   node scripts/verify-publish.js
 *   OR
 *   npm run verify:publish
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, msg) {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function getVersion() {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')
  );
  return pkg.version;
}

function getPackageName() {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')
  );
  return pkg.name;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  log('blue', '\n========================================');
  log('blue', '  NPM Publication Verification Tool    ');
  log('blue', '========================================\n');

  const packageName = getPackageName();
  const version = getVersion();
  const fullName = `${packageName}@${version}`;

  log('cyan', `Verifying publication of: ${fullName}\n`);

  try {
    // Try to fetch package info from npm registry
    log('yellow', '⏳ Checking npm registry (this may take a few seconds)...\n');

    // Give npm registry time to sync (usually < 5 seconds)
    await delay(2000);

    const info = execSync(`npm info ${fullName} --json`, {
      encoding: 'utf8',
      stdio: 'pipe',
    });

    const pkgInfo = JSON.parse(info);

    log('green', '✅ Package Found on npm Registry!\n');

    // Display key information
    log('cyan', 'Package Details:');
    log('blue', `  Name: ${pkgInfo.name}`);
    log('blue', `  Version: ${pkgInfo.version}`);
    log('blue', `  Published: ${pkgInfo.time.modified}`);
    log('blue', `  License: ${pkgInfo.license || 'Not specified'}`);
    log('blue', `  Homepage: ${pkgInfo.homepage || 'Not specified'}\n`);

    // Installation instructions
    log('cyan', 'Installation Instructions:');
    log('blue', `  npm install ${packageName}`);
    log('blue', `  npm install -g ${packageName}\n`);

    // Verification links
    log('cyan', 'Verification Links:');
    log('blue', `  npm: https://www.npmjs.com/package/${packageName}`);
    log('blue', `  npx: npx ${packageName}@latest`);
    log('blue', `  Data: npm info ${fullName}\n`);

    // Success message
    log('green', '🎉 Publication verified successfully!\n');
    log('cyan', 'Your package is now available to download from npm registry.\n');

    process.exit(0);
  } catch (error) {
    log('red', '❌ Package not found on npm registry\n');

    const err = error.message || String(error);
    if (err.includes('404')) {
      log('yellow', 'Possible reasons:');
      log('reset', '  • Package hasn\'t synced to registry yet (wait 5-10 seconds)');
      log('reset', '  • Publication failed (check `npm publish` output)');
      log('reset', '  • Wrong package name or version\n');

      log('cyan', 'Try again in a few seconds:');
      log('blue', '  npm run verify:publish\n');
    } else {
      log('red', `Error: ${err}\n`);
    }

    process.exit(1);
  }
}

main();
