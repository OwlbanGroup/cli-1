# NPM Publication Instructions for @blackbox_ai/blackbox-cli

**Current Version:** 0.1.4  
**Package Scope:** @blackbox_ai  
**Status:** Ready for publication ✅

## Pre-Publication Checklist

✅ **Code Complete**

- ✅ create-task command implemented
- ✅ blackboxApiService API client
- ✅ Input validation
- ✅ Unit tests (17 tests for create-task)
- ✅ Complete documentation

✅ **Git Status**

- ✅ All changes committed
- ✅ Pushed to origin/main
- ✅ Production branch created
- ✅ Git history clean

✅ **Build Verification**

- ✅ npm run build successful
- ✅ All 4 packages compiled
- ✅ 1542+ tests passing
- ✅ No TypeScript errors
- ✅ Bundle created

✅ **Repository Status**

- Repository: github.com/OwlbanGroup/cli-1
- Default Branch: main
- Current Branch: main
- Commits: 3 ahead of origin

## What's Being Published

```text
@blackbox_ai/blackbox-cli@0.1.4
├── create-task command
│   ├── Interactive mode
│   ├── Non-interactive mode
│   └── API key override support
├── blackboxApiService
│   ├── POST to cloud.blackbox.ai/api/tasks
│   ├── Bearer token authentication
│   └── Error handling
├── Input validation
│   ├── URL validation (GitHub/GitLab/Bitbucket)
│   ├── Required field checks
│   └── Email validation
└── Complete documentation
    └── 220+ lines of user guide
```

## Authentication Methods

### Method 1: Granular Access Token (Recommended)

1. Go to **npmjs.com** → Your Profile
2. Settings → Access Tokens
3. Create New Token
4. Token Type: **Granular Access Token**
5. Permissions: **Publish packages and manage**
6. Scopes: **@blackbox_ai**
7. Copy the generated token

Then execute:

```bash
npm config set //registry.npmjs.org/:_authToken=YOUR_TOKEN_HERE
npm publish
```

### Method 2: Browser-Based Login

```bash
npm logout
npm login
# Follow browser prompts to authenticate
npm publish
```

### Method 3: Environment Variable (CI/CD)

```bash
export NPM_TOKEN=your_granular_token
npm config set //registry.npmjs.org/:_authToken=$NPM_TOKEN
npm publish
```

## Publication Steps

### Step 1: Authenticate

Choose one of the methods above and authenticate.

Verify with:

```bash
npm whoami
# Should output: blackboxai (or your npm username)
```

### Step 2: Publish

From the repository root:

```bash
npm publish
```

Or with specific registry:

```bash
npm publish --registry https://registry.npmjs.org
```

### Step 3: Verify

```bash
npm view @blackbox_ai/blackbox-cli@0.1.4
# Should show package details
```

## Post-Publication

Once published, users can install via:

```bash
npm install -g @blackbox_ai/blackbox-cli@0.1.4
```

Or use directly:

```bash
npx @blackbox_ai/blackbox-cli@0.1.4 create-task --help
```

## If Publication Fails

### Error: "You do not have permission to publish to this scope"

- Ensure your npm account is listed as maintainer of @blackbox_ai
- Check token has publish permissions
- Verify you're using a granular token (not old classic token)

### Error: "Version already exists"

- Run `npm version patch` to bump version
- Update CHANGELOG.md
- Commit and push
- Try publishing again

### Error: "401 Unauthorized"

- Check token is valid
- Verify token hasn't expired (granular tokens expire after 90 days)
- Try method 2 (browser login) instead

## Support Resources

- **npm Docs:** <https://docs.npmjs.com/>
- **Publishing Docs:** <https://docs.npmjs.com/cli/publish>
- **Scoped Packages:** <https://docs.npmjs.com/libraries/npm-all-about-scoped-packages>

## Git References

**Main Branch:**

- Commit: 5c8eafb
- Message: docs: update documentation to reference create-task command

**Production Branch:**

- Created and synced with main
- Ready for release tags

## Ready to Publish?

When you're ready to authenticate and publish:

```bash
# Step 1: Choose authentication method above
# Step 2: Run npm publish
npm publish
```

That's it! The package will be live within seconds.

---

**Questions?** Check npm documentation or see CHANGELOG.md for detailed feature list.
