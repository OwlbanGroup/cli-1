/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { checkForUpdates } from './updateCheck.js';

const isShellScriptInstallation = vi.hoisted(() => vi.fn());
const getCurrentVersion = vi.hoisted(() => vi.fn());
const fetchLatestVersionFromAPI = vi.hoisted(() => vi.fn());
const getPlatformString = vi.hoisted(() => vi.fn());

vi.mock('../../utils/versionStorage.js', () => ({
  isShellScriptInstallation,
  getCurrentVersion,
  fetchLatestVersionFromAPI,
  getPlatformString,
}));

describe('checkForUpdates', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Clear DEV environment variable before each test
    delete process.env['DEV'];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return null when running from source (DEV=true)', async () => {
    process.env['DEV'] = 'true';
    const result = await checkForUpdates();
    expect(result).toBeNull();
    expect(isShellScriptInstallation).not.toHaveBeenCalled();
  });

  it('should return null for npm installations (deprecated)', async () => {
    isShellScriptInstallation.mockReturnValue(false);
    const result = await checkForUpdates();
    expect(result).toBeNull();
  });

  it('should return null if current version cannot be determined', async () => {
    isShellScriptInstallation.mockReturnValue(true);
    getCurrentVersion.mockResolvedValue(null);
    const result = await checkForUpdates();
    expect(result).toBeNull();
  });

  it('should return null if latest version cannot be fetched', async () => {
    isShellScriptInstallation.mockReturnValue(true);
    getCurrentVersion.mockResolvedValue('1.0.0');
    getPlatformString.mockReturnValue('linux-x64');
    fetchLatestVersionFromAPI.mockResolvedValue(null);
    const result = await checkForUpdates();
    expect(result).toBeNull();
  });

  it('should return a message if a newer version is available', async () => {
    isShellScriptInstallation.mockReturnValue(true);
    getCurrentVersion.mockResolvedValue('1.0.0');
    getPlatformString.mockReturnValue('linux-x64');
    fetchLatestVersionFromAPI.mockResolvedValue('1.1.0');

    const result = await checkForUpdates();
    expect(result).not.toBeNull();
    expect(result?.message).toContain('1.0.0 → 1.1.0');
    expect(result?.message).toContain('blackbox update');
    expect(result?.update.current).toBe('1.0.0');
    expect(result?.update.latest).toBe('1.1.0');
  });

  it('should return null if the latest version is the same as the current version', async () => {
    isShellScriptInstallation.mockReturnValue(true);
    getCurrentVersion.mockResolvedValue('1.0.0');
    getPlatformString.mockReturnValue('linux-x64');
    fetchLatestVersionFromAPI.mockResolvedValue('1.0.0');
    const result = await checkForUpdates();
    expect(result).toBeNull();
  });

  it('should return null if the latest version is older than the current version', async () => {
    isShellScriptInstallation.mockReturnValue(true);
    getCurrentVersion.mockResolvedValue('1.1.0');
    getPlatformString.mockReturnValue('linux-x64');
    fetchLatestVersionFromAPI.mockResolvedValue('1.0.0');
    const result = await checkForUpdates();
    expect(result).toBeNull();
  });

  it('should handle errors gracefully', async () => {
    isShellScriptInstallation.mockReturnValue(true);
    getCurrentVersion.mockRejectedValue(new Error('test error'));
    const result = await checkForUpdates();
    expect(result).toBeNull();
  });

  describe('nightly updates', () => {
    it('should notify for a newer nightly version when current is nightly', async () => {
      isShellScriptInstallation.mockReturnValue(true);
      getCurrentVersion.mockResolvedValue('1.2.3-nightly.1');
      getPlatformString.mockReturnValue('linux-x64');
      fetchLatestVersionFromAPI.mockResolvedValue('1.2.3-nightly.2');

      const result = await checkForUpdates();
      expect(result).not.toBeNull();
      expect(result?.message).toContain('1.2.3-nightly.1 → 1.2.3-nightly.2');
      expect(result?.update.latest).toBe('1.2.3-nightly.2');
    });
  });
});
