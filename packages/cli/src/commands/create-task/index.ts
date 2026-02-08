/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  CommandModule,
  Argv,
} from 'yargs';
import {
  createTask,
  type CreateTaskRequest,
} from '@blackbox_ai/blackbox-cli-core';
import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline';
import { getBlackboxCloudApiKey } from '../../config/auth.js';
import { validateCreateTaskRequest } from './validation.js';

const rl = readline.createInterface({ input, output });

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function runCreateTask(): Promise<void> {
  try {
    // Get API key from environment or prompt user
    let apiKey = getBlackboxCloudApiKey();
    if (!apiKey) {
      console.log('Blackbox Cloud API key not found.');
      apiKey = await question(
        'Please enter your Blackbox Cloud API key (starting with bb_): '
      );
    }

    if (!apiKey || !apiKey.startsWith('bb_')) {
      throw new Error('Invalid API key format. API key should start with "bb_"');
    }

    // Get task details from user
    console.log('\n--- Create Task ---\n');

    const prompt = await question('What would you like the agent to do? ');
    const repoUrl = await question(
      'Enter your repository URL (e.g., https://github.com/user/repo): '
    );
    const selectedAgent = await question(
      'Select agent (default: blackbox): '
    ) || 'blackbox';
    const selectedModel = await question(
      'Select model (default: blackboxai/blackbox-pro): '
    ) || 'blackboxai/blackbox-pro';

    const taskRequest: CreateTaskRequest = {
      prompt,
      repoUrl,
      selectedAgent,
      selectedModel,
    };

    // Validate request
    const validationError = validateCreateTaskRequest(taskRequest);
    if (validationError) {
      throw new Error(validationError);
    }

    console.log('\nCreating task...');

    // Call API
    const response = await createTask(apiKey, taskRequest);

    console.log('\n✓ Task created successfully!');
    console.log(`Task ID: ${response.id || 'N/A'}`);
    console.log(`Status: ${response.status || 'N/A'}`);
    if (response.taskUrl) {
      console.log(`View task: ${response.taskUrl}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`✗ Error: ${error.message}`);
    } else {
      console.error('An unexpected error occurred');
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

export const createTaskCommand: CommandModule = {
  command: 'create-task',
  describe: 'Create a new Blackbox Cloud task',
  builder: (yargs: Argv) =>
    yargs
      .option('prompt', {
        alias: 'p',
        type: 'string',
        description: 'Task prompt/description',
      })
      .option('repo', {
        alias: 'r',
        type: 'string',
        description: 'Repository URL',
      })
      .option('agent', {
        alias: 'a',
        type: 'string',
        description: 'AI agent to use (default: blackbox)',
        default: 'blackbox',
      })
      .option('model', {
        alias: 'm',
        type: 'string',
        description: 'Model to use (default: blackboxai/blackbox-pro)',
        default: 'blackboxai/blackbox-pro',
      })
      .option('api-key', {
        type: 'string',
        description: 'Blackbox Cloud API key (or set BB_API_KEY env variable)',
      })
      .usage('Usage: blackbox create-task [options]')
      .example(
        'blackbox create-task -p "Add Stripe integration" -r "https://github.com/user/repo"',
        'Create a task with inline options'
      )
      .help(),
  handler: async (argv) => {
    try {
      // If all required options are provided, use them directly
      const prompt = argv['prompt'] as string | undefined;
      const repo = argv['repo'] as string | undefined;
      const agent = argv['agent'] as string | undefined;
      const model = argv['model'] as string | undefined;
      const apiKeyArg = argv['api-key'] as string | undefined;

      if (prompt && repo) {
        const apiKey = apiKeyArg || getBlackboxCloudApiKey();
        if (!apiKey) {
          throw new Error('API key not found. Set BB_API_KEY environment variable or use --api-key');
        }

        const taskRequest: CreateTaskRequest = {
          prompt,
          repoUrl: repo,
          selectedAgent: agent || 'blackbox',
          selectedModel: model || 'blackboxai/blackbox-pro',
        };

        const validationError = validateCreateTaskRequest(taskRequest);
        if (validationError) {
          throw new Error(validationError);
        }

        console.log('Creating task...');
        const response = await createTask(apiKey, taskRequest);

        console.log('\n✓ Task created successfully!');
        console.log(`Task ID: ${response.id || 'N/A'}`);
        console.log(`Status: ${response.status || 'N/A'}`);
        if (response.taskUrl) {
          console.log(`View task: ${response.taskUrl}`);
        }
      } else {
        // Interactive mode
        await runCreateTask();
      }
      process.exit(0);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`✗ Error: ${error.message}`);
      } else {
        console.error('An unexpected error occurred');
      }
      process.exit(1);
    }
  },
};
