/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthType } from '@blackbox_ai/blackbox-cli-core';
import { loadEnvironment, type LoadedSettings, SettingScope } from './settings.js';

const validateGeminiAuth = (): string | null => {
  if (!process.env['GEMINI_API_KEY']) {
    return 'GEMINI_API_KEY environment variable not found. Add that to your environment and try again (no reload needed if using .env)!';
  }
  return null;
};

const validateVertexAIAuth = (): string | null => {
  const hasVertexProjectLocationConfig =
    !!process.env['GOOGLE_CLOUD_PROJECT'] &&
    !!process.env['GOOGLE_CLOUD_LOCATION'];
  const hasGoogleApiKey = !!process.env['GOOGLE_API_KEY'];
  if (!hasVertexProjectLocationConfig && !hasGoogleApiKey) {
    return (
      'When using Vertex AI, you must specify either:\n' +
      '• GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION environment variables.\n' +
      '• GOOGLE_API_KEY environment variable (if using express mode).\n' +
      'Update your environment and try again (no reload needed if using .env)!'
    );
  }
  return null;
};

const validateOpenAIAuth = (): string | null => {
  if (!process.env['OPENAI_API_KEY']) {
    return 'OPENAI_API_KEY environment variable not found. You can enter it interactively or add it to your .env file.';
  }
  return null;
};

const validateBlackboxAPIAuth = (): string | null => {
  if (!process.env['BLACKBOX_API_KEY']) {
    return 'BLACKBOX_API_KEY environment variable not found. You can enter it interactively or add it to your .env file.';
  }
  return null;
};

export const validateAuthMethod = (authMethod: string): string | null => {
  loadEnvironment();
  switch (authMethod) {
    case AuthType.LOGIN_WITH_GOOGLE:
    case AuthType.CLOUD_SHELL:
    case AuthType.BLACKBOX_OAUTH:
    case AuthType.OWL_BAN_UNLIMITED:
      return null;
    case AuthType.USE_GEMINI:
      return validateGeminiAuth();
    case AuthType.USE_VERTEX_AI:
      return validateVertexAIAuth();
    case AuthType.USE_OPENAI:
      return validateOpenAIAuth();
    case AuthType.USE_BLACKBOX_API:
      return validateBlackboxAPIAuth();
    default:
      return 'Invalid auth method selected.';
  }
};

export const setOpenAIApiKey = (apiKey: string): void => {
  process.env['OPENAI_API_KEY'] = apiKey;
};

export const setOpenAIBaseUrl = (baseUrl: string): void => {
  process.env['OPENAI_BASE_URL'] = baseUrl;
};

export const setOpenAIModel = (model: string): void => {
  process.env['OPENAI_MODEL'] = model;
};

export const setBlackboxApiKey = (apiKey: string): void => {
  process.env['BLACKBOX_API_KEY'] = apiKey;
};

export const setBlackboxApiBaseUrl = (baseUrl: string): void => {
  process.env['BLACKBOX_API_BASE_URL'] = baseUrl;
};

export const setBlackboxApiModel = (model: string): void => {
  process.env['BLACKBOX_API_MODEL'] = model;
};

export const setOpenRouterApiKey = (apiKey: string): void => {
  process.env['OPENROUTER_API_KEY'] = apiKey;
};

export const setOpenRouterBaseUrl = (baseUrl: string): void => {
  process.env['OPENROUTER_BASE_URL'] = baseUrl;
};

export const setOpenRouterModel = (model: string): void => {
  process.env['OPENROUTER_MODEL'] = model;
};

export const setCustomApiKey = (apiKey: string): void => {
  process.env['CUSTOM_API_KEY'] = apiKey;
};

export const setCustomBaseUrl = (baseUrl: string): void => {
  process.env['CUSTOM_BASE_URL'] = baseUrl;
};

export const setCustomModel = (model: string): void => {
  process.env['CUSTOM_MODEL'] = model;
};

export const setAnthropicApiKey = (apiKey: string): void => {
  process.env['ANTHROPIC_API_KEY'] = apiKey;
};

export const setAnthropicBaseUrl = (baseUrl: string): void => {
  process.env['ANTHROPIC_BASE_URL'] = baseUrl;
};

export const setAnthropicModel = (model: string): void => {
  process.env['ANTHROPIC_MODEL'] = model;
};

export const setGoogleApiKey = (apiKey: string): void => {
  process.env['GOOGLE_API_KEY'] = apiKey;
};

export const setGoogleBaseUrl = (baseUrl: string): void => {
  process.env['GOOGLE_HOST'] = baseUrl;
};

export const setGoogleModel = (model: string): void => {
  process.env['GOOGLE_MODEL'] = model;
};

export const setXaiApiKey = (apiKey: string): void => {
  process.env['XAI_API_KEY'] = apiKey;
};

export const setXaiBaseUrl = (baseUrl: string): void => {
  process.env['XAI_HOST'] = baseUrl;
};

export const setXaiModel = (model: string): void => {
  process.env['XAI_MODEL'] = model;
};

export const getBlackboxCloudApiKey = (): string | undefined =>
  process.env['BB_API_KEY'];

export const setBlackboxCloudApiKey = (apiKey: string): void => {
  process.env['BB_API_KEY'] = apiKey;
};

const getCredentialFieldName = (
  credentialType: 'apiKey' | 'baseUrl' | 'model'
): string =>
  credentialType === 'apiKey' ? 'apiKey' : 
  credentialType === 'baseUrl' ? 'baseUrl' : 
  'model';

const setSingleCredential = (
  settings: LoadedSettings,
  provider: string,
  credentialType: 'apiKey' | 'baseUrl' | 'model',
  value: string | undefined
): void => {
  if (!value) return;
  const fieldName = getCredentialFieldName(credentialType);
  settings.setValue(SettingScope.User, `security.auth.${provider}.${fieldName}`, value);
};

/**
 * Save provider credentials to settings file for persistence across sessions
 */
export const saveProviderCredentials = (
  settings: LoadedSettings,
  provider: 'openai' | 'blackbox' | 'openrouter' | 'custom' | 'anthropic' | 'google' | 'xai',
  credentials: {
    apiKey?: string;
    baseUrl?: string;
    model?: string;
  },
): void => {
  const { apiKey, baseUrl, model } = credentials;
  setSingleCredential(settings, provider, 'apiKey', apiKey);
  setSingleCredential(settings, provider, 'baseUrl', baseUrl);
  setSingleCredential(settings, provider, 'model', model);
};


const loadProviderEnvVars = (
  config: Record<string, unknown> | undefined,
  envVarPrefix: 'OPENAI' | 'BLACKBOX_API'
): void => {
  if (!config) return;
  const apiKey = config['apiKey'];
  const baseUrl = config['baseUrl'];
  const model = config['model'];

  if (apiKey && typeof apiKey === 'string') {
    const apiKeyVar = envVarPrefix === 'BLACKBOX_API' ? 'BLACKBOX_API_KEY' : 'OPENAI_API_KEY';
    if (!process.env[apiKeyVar]) process.env[apiKeyVar] = apiKey;
  }
  if (baseUrl && typeof baseUrl === 'string') {
    const baseUrlVar = envVarPrefix === 'BLACKBOX_API' ? 'BLACKBOX_API_BASE_URL' : 'OPENAI_BASE_URL';
    if (!process.env[baseUrlVar]) process.env[baseUrlVar] = baseUrl;
  }
  if (model && typeof model === 'string') {
    const modelVar = envVarPrefix === 'BLACKBOX_API' ? 'BLACKBOX_API_MODEL' : 'OPENAI_MODEL';
    if (!process.env[modelVar]) process.env[modelVar] = model;
  }
};

const loadOpenAICredentials = (config: Record<string, unknown> | undefined): void => {
  loadProviderEnvVars(config, 'OPENAI');
};

const loadBlackboxCredentials = (config: Record<string, unknown> | undefined): void => {
  loadProviderEnvVars(config, 'BLACKBOX_API');
};

/**
 * Load provider credentials from settings and set them as environment variables
 * This ensures credentials persist across sessions
 */
export const loadProviderCredentialsFromSettings = (
  settings: LoadedSettings,
): void => {
  const merged = settings.merged;
  const selectedProvider = merged.security?.auth?.selectedProvider;
  const auth = merged.security?.auth as Record<string, unknown> | undefined;

  switch (selectedProvider) {
    case 'openai':
      loadOpenAICredentials(auth?.['openai'] as Record<string, unknown> | undefined);
      break;
    case 'openrouter':
      loadProviderEnvVars(auth?.['openrouter'] as Record<string, unknown> | undefined, 'OPENAI');
      break;
    case 'blackbox':
      loadBlackboxCredentials(auth?.['blackbox'] as Record<string, unknown> | undefined);
      break;
    case 'custom':
    case 'anthropic':
    case 'google':
    case 'xai':
      if (selectedProvider) {
        loadProviderEnvVars(auth?.[selectedProvider] as Record<string, unknown> | undefined, 'OPENAI');
      }
      break;
    default: {
      const selectedType = auth?.['selectedType'];
      if (selectedType === AuthType.USE_OPENAI) {
        loadOpenAICredentials(auth?.['openai'] as Record<string, unknown> | undefined);
      } else if (selectedType === AuthType.USE_BLACKBOX_API) {
        loadBlackboxCredentials(auth?.['blackbox'] as Record<string, unknown> | undefined);
      }
    }
  }
};
