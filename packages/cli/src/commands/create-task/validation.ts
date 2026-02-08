/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { CreateTaskRequest } from '@blackbox_ai/blackbox-cli-core';

/**
 * Validates that a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates a create task request
 */
export function validateCreateTaskRequest(request: CreateTaskRequest): string | null {
  if (!request.prompt || request.prompt.trim().length === 0) {
    return 'Prompt is required and cannot be empty';
  }

  if (!request.repoUrl || request.repoUrl.trim().length === 0) {
    return 'Repository URL is required';
  }

  if (!isValidUrl(request.repoUrl)) {
    return 'Repository URL is not a valid URL';
  }

  if (!request.selectedAgent || request.selectedAgent.trim().length === 0) {
    return 'Agent is required';
  }

  if (!request.selectedModel || request.selectedModel.trim().length === 0) {
    return 'Model is required';
  }

  // Validate repo URL is a GitHub URL or similar
  if (!request.repoUrl.includes('github.com') && !request.repoUrl.includes('gitlab.com') && !request.repoUrl.includes('bitbucket.')) {
    return 'Repository URL should be from GitHub, GitLab, or Bitbucket';
  }

  return null;
}
