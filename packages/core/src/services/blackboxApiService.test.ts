/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTask, type CreateTaskRequest, type CreateTaskResponse } from './blackboxApiService.js';

// Mock fetch globally
globalThis.fetch = vi.fn(() => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({}),
} as Response));

describe('blackboxApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createTask', () => {
    it('should successfully create a task with valid parameters', async () => {
      const mockResponse: CreateTaskResponse = {
        id: 'task-123',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const apiKey = 'test-api-key';
      const request: CreateTaskRequest = {
        prompt: 'Add Stripe Payment Integration',
        repoUrl: 'https://github.com/user/repo',
        selectedAgent: 'blackbox',
        selectedModel: 'blackboxai/blackbox-pro',
      };

      const result = await createTask(apiKey, request);

      expect(result).toEqual(mockResponse);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://cloud.blackbox.ai/api/tasks',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        })
      );
    });

    it('should throw an error when API returns non-OK status', async () => {
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      });

      const apiKey = 'invalid-api-key';
      const request: CreateTaskRequest = {
        prompt: 'Test',
        repoUrl: 'https://github.com/user/repo',
        selectedAgent: 'blackbox',
        selectedModel: 'blackboxai/blackbox-pro',
      };

      await expect(createTask(apiKey, request)).rejects.toThrow(
        'Failed to create task: Unauthorized'
      );
    });

    it('should throw an error when fetch fails', async () => {
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Network error')
      );

      const apiKey = 'test-api-key';
      const request: CreateTaskRequest = {
        prompt: 'Test',
        repoUrl: 'https://github.com/user/repo',
        selectedAgent: 'blackbox',
        selectedModel: 'blackboxai/blackbox-pro',
      };

      await expect(createTask(apiKey, request)).rejects.toThrow('Network error');
    });

    it('should include correct authorization header format', async () => {
      const mockResponse: CreateTaskResponse = {
        id: 'task-456',
        status: 'pending',
      };

      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const apiKey = 'bb_test_key_123';
      const request: CreateTaskRequest = {
        prompt: 'Add feature',
        repoUrl: 'https://github.com/user/repo',
        selectedAgent: 'blackbox',
        selectedModel: 'blackboxai/blackbox-pro',
      };

      await createTask(apiKey, request);

      const callArgs = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(callArgs[1].headers['Authorization']).toBe(`Bearer ${apiKey}`);
    });
  });
});
