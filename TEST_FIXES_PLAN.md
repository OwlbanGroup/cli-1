# Test Fixes Implementation Plan

## Overview
This document outlines the plan to fix 52 failing tests across multiple test files in the CLI and Core packages.

## Test Failure Categories

### 1. Settings Tests (packages/cli/src/config/settings.test.ts)
**Issue**: Tests expect empty `security: {}` but getting `security.auth` with nested provider objects (openai, blackbox, openrouter)

**Root Cause**: The `mergeSettings` function in `settings.ts` now explicitly merges `security.auth` with provider credentials (openai, blackbox, openrouter), but tests expect an empty security object when no settings are provided.

**Fix Strategy**:
- Update `mergeSettings` function to only include `security.auth` providers if they have actual values
- Modify the merge logic to return empty objects for auth providers when no credentials are set
- Update test expectations to match the new structure

**Files to Modify**:
- `packages/cli/src/config/settings.ts` - Fix mergeSettings function
- `packages/cli/src/config/settings.test.ts` - Update test expectations

**Specific Changes**:
```typescript
// In mergeSettings function, change from:
security: {
  ...(systemDefaults.security || {}),
  ...(user.security || {}),
  ...(safeWorkspaceWithoutFolderTrust.security || {}),
  ...(system.security || {}),
  auth: {
    ...(systemDefaults.security?.auth || {}),
    ...(user.security?.auth || {}),
    ...(safeWorkspaceWithoutFolderTrust.security?.auth || {}),
    ...(system.security?.auth || {}),
    openai: {
      ...(systemDefaults.security?.auth?.openai || {}),
      ...(user.security?.auth?.openai || {}),
      ...(safeWorkspaceWithoutFolderTrust.security?.auth?.openai || {}),
      ...(system.security?.auth?.openai || {}),
    },
    blackbox: { /* ... */ },
    openrouter: { /* ... */ },
  },
},

// To:
security: {
  ...(systemDefaults.security || {}),
  ...(user.security || {}),
  ...(safeWorkspaceWithoutFolderTrust.security || {}),
  ...(system.security || {}),
  // Only include auth if there are actual values
  ...(hasAuthValues(systemDefaults, user, safeWorkspaceWithoutFolderTrust, system) 
    ? {
        auth: {
          ...(systemDefaults.security?.auth || {}),
          ...(user.security?.auth || {}),
          ...(safeWorkspaceWithoutFolderTrust.security?.auth || {}),
          ...(system.security?.auth || {}),
          // Only include provider objects if they have values
          ...(hasProviderValues('openai', ...) ? { openai: { /* merge */ } } : {}),
          ...(hasProviderValues('blackbox', ...) ? { blackbox: { /* merge */ } } : {}),
          ...(hasProviderValues('openrouter', ...) ? { openrouter: { /* merge */ } } : {}),
        }
      }
    : {}),
},
```

### 2. MCP Command Test (packages/cli/src/commands/mcp.test.ts)
**Issue**: Test expects command `'add <name> <commandOrUrl> [args...]'` but not finding it

**Root Cause**: The command registration format may have changed or the test is checking the wrong property

**Fix Strategy**:
- Review the actual mcp command implementation
- Update test to match the actual command format
- Verify command registration is working correctly

**Files to Modify**:
- `packages/cli/src/commands/mcp.test.ts`

### 3. Installation Info Test (packages/cli/src/utils/installationInfo.test.ts)
**Issue**: Expected message "Running from a local git clone..." but got "Please run: blackbox update..."

**Root Cause**: The update message logic has changed

**Fix Strategy**:
- Review `getInstallationInfo` function
- Update test expectations or fix the function logic

**Files to Modify**:
- `packages/cli/src/utils/installationInfo.test.ts`

### 4. Slash Command Processor Tests (packages/cli/src/ui/hooks/slashCommandProcessor.test.ts)
**Issue**: Multiple tests failing with "Cannot read properties of null (reading 'slashCommands')"

**Root Cause**: The hook is returning null instead of the expected object structure. This suggests the hook isn't initializing properly in tests.

**Fix Strategy**:
- Review the `useSlashCommandProcessor` hook implementation
- Check if there's a missing provider or context in the test setup
- Ensure the hook returns a valid object even during initialization
- Add proper null checks or default values

**Files to Modify**:
- `packages/cli/src/ui/hooks/slashCommandProcessor.ts` - Add null safety
- `packages/cli/src/ui/hooks/slashCommandProcessor.test.ts` - Fix test setup

**Specific Changes**:
```typescript
// In useSlashCommandProcessor hook, ensure it returns a valid object:
const [slashCommands, setSlashCommands] = useState<SlashCommand[]>([]);

// Instead of potentially returning null, always return an object:
return {
  slashCommands: slashCommands || [],
  // ... other properties
};
```

### 5. Update Check Tests (packages/cli/src/ui/utils/updateCheck.test.ts)
**Issue**: Tests failing with "the given combination of arguments (undefined and string) is invalid"

**Root Cause**: `result?.message` is undefined, but test is trying to use `.toContain()` on it

**Fix Strategy**:
- Check why `checkForUpdates()` is returning undefined message
- Fix the function or update test expectations

**Files to Modify**:
- `packages/cli/src/ui/utils/updateCheck.test.ts`

### 6. Edit Tool Test (packages/core/src/tools/edit.test.ts)
**Issue**: Error message doesn't contain the expected root directory path

**Root Cause**: Error message format has changed

**Fix Strategy**:
- Update error message to include the root directory path
- Or update test expectation to match new format

**Files to Modify**:
- `packages/core/src/tools/edit.test.ts`

## Implementation Order

### Phase 1: Critical Fixes (Settings & Slash Command Processor)
1. Fix `mergeSettings` function in `settings.ts` to conditionally include auth providers
2. Fix `useSlashCommandProcessor` hook to ensure it never returns null
3. Update settings tests to match new structure

### Phase 2: Command & Utility Fixes
4. Fix MCP command test
5. Fix installation info test
6. Fix update check tests

### Phase 3: Tool Tests
7. Fix edit tool test

## Detailed Implementation Steps

### Step 1: Fix Settings Merge Function
```typescript
// Add helper function to check if auth has values
function hasAuthProviderValues(
  provider: 'openai' | 'blackbox' | 'openrouter',
  ...settings: Settings[]
): boolean {
  return settings.some(s => {
    const auth = s.security?.auth?.[provider];
    return auth && Object.keys(auth).length > 0;
  });
}

// Update mergeSettings to conditionally include providers
```

### Step 2: Fix Slash Command Processor Hook
```typescript
// Ensure hook always returns valid structure
export function useSlashCommandProcessor(...) {
  const [slashCommands, setSlashCommands] = useState<SlashCommand[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  // ... other state
  
  // Always return valid object, never null
  return {
    slashCommands: slashCommands ?? [],
    isProcessing: isProcessing ?? false,
    // ... other properties with null coalescing
  };
}
```

### Step 3: Update Test Expectations
- Update all settings tests to expect the new structure
- Add proper null checks in slash command processor tests
- Fix assertion methods in update check tests

## Testing Strategy

1. Run tests incrementally after each fix
2. Verify no regressions in passing tests
3. Run full test suite before committing

## Success Criteria

- All 52 failing tests pass
- No new test failures introduced
- No regressions in existing passing tests
- Code maintains backward compatibility where possible

## Estimated Effort

- Phase 1: 2-3 hours
- Phase 2: 1-2 hours  
- Phase 3: 30 minutes
- Testing & Verification: 1 hour

**Total: 4-6 hours**
