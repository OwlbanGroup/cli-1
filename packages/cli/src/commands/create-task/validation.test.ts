/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { isValidUrl, validateCreateTaskRequest } from './validation.js';
import type { CreateTaskRequest } from '@blackbox_ai/blackbox-cli-core';

describe('validation', () => {
  describe('isValidUrl', () => {
    it('should return true for valid URLs', () => {
      expect(isValidUrl('https://github.com/user/repo')).toBe(true);
      expect(isValidUrl('https://gitlab.com/user/repo')).toBe(true);
      expect(isValidUrl('https://bitbucket.org/user/repo')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('github.com/user/repo')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('validateCreateTaskRequest', () => {
    const validRequest: CreateTaskRequest = {
      prompt: 'Add Stripe Integration',
      repoUrl: 'https://github.com/user/repo',
      selectedAgent: 'blackbox',
      selectedModel: 'blackboxai/blackbox-pro',
    };

    it('should return null for valid requests', () => {
      expect(validateCreateTaskRequest(validRequest)).toBeNull();
    });

    it('should return error for empty prompt', () => {
      const request = { ...validRequest, prompt: '' };
      expect(validateCreateTaskRequest(request)).toMatch(/Prompt is required/);
    });

    it('should return error for missing repoUrl', () => {
      const request = { ...validRequest, repoUrl: '' };
      expect(validateCreateTaskRequest(request)).toMatch(/Repository URL is required/);
    });

    it('should return error for invalid repoUrl', () => {
      const request = { ...validRequest, repoUrl: 'not-a-url' };
      expect(validateCreateTaskRequest(request)).toMatch(/not a valid URL/);
    });

    it('should return error for missing selectedAgent', () => {
      const request = { ...validRequest, selectedAgent: '' };
      expect(validateCreateTaskRequest(request)).toMatch(/Agent is required/);
    });

    it('should return error for missing selectedModel', () => {
      const request = { ...validRequest, selectedModel: '' };
      expect(validateCreateTaskRequest(request)).toMatch(/Model is required/);
    });

    it('should return error for non-git repository URL', () => {
      const request = { ...validRequest, repoUrl: 'https://example.com/repo' };
      expect(validateCreateTaskRequest(request)).toMatch(/should be from GitHub, GitLab, or Bitbucket/);
    });
  });
});
