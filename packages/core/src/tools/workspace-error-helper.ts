/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Generates a user-friendly error message when a file path is outside the workspace.
 */
export function generateWorkspacePathError(
  _filePath: string,
  _workspaceDirectories: readonly string[],
): string {
  return `File path must be within one of the workspace directories`;
}
