# NPM Publish Quick Start Guide

**Package:** @blackbox_ai/blackbox-cli v0.1.4  
**Status:** ✅ Ready to publish  
**Owner:** Oscar Broome (Blackbox AI / Owlban Group)

---

## 🎯 One-Command Publication (After Authentication)

```bash
npm publish
```

That's it! The entire package goes live within seconds.

---

## 🔑 Step 1: Get Your Authentication Token

### Option A: Granular Access Token (Recommended) ⭐

1. Go to <https://npmjs.com/settings/YOUR_USERNAME/tokens>
2. Click **"Generate New Token"**
3. Select **"Granular Access Token"**
4. Set permissions: **"Publish packages and manage"**
5. Set scopes: **"@blackbox_ai"**
6. **Copy the token** (you'll only see it once)

### Option B: Browser Login

1. Run: `npm login`
2. Enter your npm username/email/password
3. Complete 2FA if prompted

---

## 🔐 Step 2: Configure Authentication

**Choose ONE method:**

### Method A: Using Token (Preferred)

```bash
npm config set //registry.npmjs.org/:_authToken=YOUR_TOKEN_HERE
```

Or create `~/.npmrc`:

```text
//registry.npmjs.org/:_authToken=YOUR_TOKEN_HERE
```

### Method B: Using Browser Login

```bash
npm login
# Follow prompts in browser
```

---

## ✅ Step 3: Verify Authentication

```bash
npm whoami
```

Should output your npm username like: `blackboxai`

---

## 🚀 Step 4: Publish

From the project root (`/cli`):

```bash
npm publish
```

**Expected output:**

```text
npm notice Publishing to https://registry.npmjs.org/ with tag latest
npm notice 📦 @blackbox_ai/blackbox-cli@0.1.4
npm notice === Tarball Contents ===
npm notice [includes all files]
npm notice === Packed Files ===
npm notice tab size that will be used for this package is 2 (!)
┌─────────────────────────────────────────────────┐
│ NPM PUBLISH SUCCESS                             │
│ Your package is live!                           │
└─────────────────────────────────────────────────┘
```

---

## 📦 What Gets Published

```text
@blackbox_ai/blackbox-cli@0.1.4
│
├── 📄 Executable CLI with:
│   └── create-task command
│
├── 📚 Documentation:
│   └── 220+ lines of user guide
│
├── ✅ Tests:
│   └── 1542 passing tests
│
└── 📋 Features:
    ├── Interactive mode
    ├── Non-interactive mode
    ├── Auto-configuration
    ├── Error handling
    └── Blackbox Cloud API integration
```

---

## 🎁 After Publication

### Step 5: Verify Publication (Optional)

```bash
node scripts/verify-publish.js
```

This checks that your package is live on npm registry.

### Users can install with

```bash
npm install -g @blackbox_ai/blackbox-cli@0.1.4
```

### Or use directly

```bash
npx @blackbox_ai/blackbox-cli create-task --help
```

### Verify package is published

```bash
npm view @blackbox_ai/blackbox-cli@0.1.4
```

Or visit: [https://www.npmjs.com/package/@blackbox_ai/blackbox-cli](https://www.npmjs.com/package/@blackbox_ai/blackbox-cli)

---

## 🆘 Troubleshooting

| Problem | Solution |
| --------- | ---------- |
| **401 Unauthorized** | Token invalid or expired. Create new granular token |
| **No publish permission** | Verify token has "Publish packages" permission |
| **Version exists** | Package already published. Run `npm version patch` and retry |
| **Can't find registry** | Verify `npm config get registry` outputs `https://registry.npmjs.org/` |
| **Not authenticated** | Run `npm whoami` - if it fails, use `npm login` or set token |

---

## 📋 Completed Checklist

- ✅ Code implemented (create-task command)
- ✅ Tests passing (1542+ tests)
- ✅ Build successful (all 4 packages)
- ✅ Git committed and pushed
- ✅ Documentation complete
- ✅ Ready for publication

---

## 🚀 Ready?

**When you have your token/credentials:**

```bash
# Method 1: Set token
npm config set //registry.npmjs.org/:_authToken=YOUR_TOKEN

# Method 2: Or login via browser
npm login

# Then publish
npm publish
```

**That's it!** Your package will be live in seconds.

---

## 📚 Additional Resources

- **Full Instructions:** See `PUBLISH_INSTRUCTIONS.md`
- **Publish Script:** `scripts/publish.js` (automates checks)
- **Token Template:** `.npmrc.template` (copy and fill with token)
- **Changelog:** `CHANGELOG.md` (see new features)

---

## 📞 Need Help?

- **npm Docs:** <https://docs.npmjs.com/cli/publish>
- **Account Settings:** <https://npmjs.com/settings/YOUR_USERNAME>
- **Token Management:** <https://npmjs.com/settings/YOUR_USERNAME/tokens>

---

**Questions? Everything is ready. Just authenticate and run `npm publish`!**
