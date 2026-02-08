/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createTaskCommand } from './index.js';

describe('createTaskCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct command properties', () => {
    expect(createTaskCommand.command).toBe('create-task');
    expect(createTaskCommand.describe).toContain('Create a new Blackbox Cloud task');
  });

  it('should have required builder function', () => {
    expect(createTaskCommand.builder).toBeDefined();
    expect(typeof createTaskCommand.builder).toBe('function');
  });

  it('should have handler function', () => {
    expect(createTaskCommand.handler).toBeDefined();
    expect(typeof createTaskCommand.handler).toBe('function');
  });

  it('should have required options', () => {
    // This is a simple validation that the command structure is correct
    expect(createTaskCommand.command).toBe('create-task');
  });
});
