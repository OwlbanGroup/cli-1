#!/usr/bin/env node

/**
 * NPM Publishing Script for @blackbox_ai/blackbox-cli
 * 
 * Usage:
 *   node scripts/publish.js --token YOUR_GRANULAR_TOKEN
 *   OR
 *   npm config set //registry.npmjs.org/:_authToken=YOUR_TOKEN && npm publish
 * 
 * This script verifies the package is ready for publication
 * and provides detailed feedback on the publication process.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

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

function checkReady() {
  log('cyan', '\n📦 Publication Readiness Check\n');

  const checks = [
    {
      name: 'Git Status Clean',
      fn: () => {
        try {
          const status = execSync('git status --porcelain', { encoding: 'utf8' });
          return !status.trim();
        } catch {
          return false;
        }
      },
    },
    {
      name: 'Build Successful',
      fn: () => fs.existsSync(path.join(__dirname, '../packages/cli/dist')),
    },
    {
      name: 'package.json Exists',
      fn: () => fs.existsSync(path.join(__dirname, '../package.json')),
    },
    {
      name: 'Authenticated with npm',
      fn: () => {
        try {
          execSync('npm whoami', { stdio: 'pipe', encoding: 'utf8' });
          return true;
        } catch {
          return false;
        }
      },
    },
  ];

  let passed = 0;
  for (const check of checks) {
    if (check.fn()) {
      log('green', `✅ ${check.name}`);
      passed++;
    } else {
      log('red', `❌ ${check.name}`);
    }
  }

  log('cyan', `\n${passed}/${checks.length} checks passed`);
  return passed === checks.length;
}

function getVersion() {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
  );
  return pkg.version;
}

function publish() {
  log('cyan', '\n🚀 Publishing to npm registry...\n');

  try {
    const version = getVersion();
    log('yellow', `Version: @blackbox_ai/blackbox-cli@${version}`);

    // Run npm publish
    execSync('npm publish', { stdio: 'inherit' });

    log('green', '\n✅ Publication successful!\n');
    log('cyan', 'View your package:');
    log('blue', `https://www.npmjs.com/package/@blackbox_ai/blackbox-cli\n`);

    log('cyan', 'Install with:');
    log('blue', `npm install -g @blackbox_ai/blackbox-cli@${version}\n`);

    return true;
  } catch (err) {
    log('red', `\n❌ Publication failed!\n`);
    log('red', err.message);
    return false;
  }
}

function main() {
  log('blue', '\n========================================');
  log('blue', '  @blackbox_ai/blackbox-cli Publisher  ');
  log('blue', '========================================\n');

  // Check if authenticated
  try {
    const user = execSync('npm whoami', { encoding: 'utf8', stdio: 'pipe' }).trim();
    log('green', `✅ Authenticated as: ${user}`);
  } catch {
    log('red', '❌ Not authenticated with npm registry');
    log('yellow', '\nRun one of these to authenticate:\n');
    log('blue', '  Option 1 (Granular Token):');
    log('reset', '    npm config set //registry.npmjs.org/:_authToken=YOUR_TOKEN\n');
    log('blue', '  Option 2 (Browser Login):');
    log('reset', '    npm login\n');
    process.exit(1);
  }

  if (!checkReady()) {
    log('red', '\n⚠️  Not ready to publish. Fix issues above.\n');
    process.exit(1);
  }

  const version = getVersion();
  log('cyan', `\nReady to publish: @blackbox_ai/blackbox-cli@${version}`);
  log('yellow', '\n⚠️  This will upload the package to npm registry.\n');

  // Proceed with publication
  if (publish()) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main();
