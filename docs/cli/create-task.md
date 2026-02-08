# Create Task Command

The `create-task` command allows you to create new tasks in Blackbox Cloud directly from the CLI. This enables you to submit code improvement requests to be processed by Blackbox AI agents.

## Prerequisites

- A Blackbox Cloud API key (starts with `bb_`)
- Access to a Git repository (GitHub, GitLab, or Bitbucket)

## Setup

### 1. Get Your API Key

1. Go to [Blackbox Cloud](https://cloud.blackbox.ai)
2. Navigate to your account settings
3. Generate a new API key
4. Copy the key (starts with `bb_`)

### 2. Set Environment Variable

Set your API key as an environment variable:

**Linux/macOS:**

```bash
export BB_API_KEY=bb_your_api_key_here
```

**Windows (PowerShell):**

```powershell
$env:BB_API_KEY = "bb_your_api_key_here"
```

Or add it to your `.env` file:

```bash
BB_API_KEY=bb_your_api_key_here
```

## Usage

### Interactive Mode

Run the command without arguments to be prompted for all required information:

```bash
blackbox create-task
```

You'll be asked for:

- Task prompt/description (what you want the agent to do)
- Repository URL (where the code is)
- Agent to use (default: `blackbox`)
- Model to use (default: `blackboxai/blackbox-pro`)

### Non-Interactive Mode

Provide all options as arguments:

```bash
blackbox create-task \
  --prompt "Add Stripe payment integration" \
  --repo https://github.com/user/repo \
  --agent blackbox \
  --model blackboxai/blackbox-pro
```

Or use short options:

```bash
blackbox create-task \
  -p "Add Stripe payment integration" \
  -r https://github.com/user/repo \
  -a blackbox \
  -m blackboxai/blackbox-pro
```

### With API Key Override

If you need to use a different API key than the one in your environment:

```bash
blackbox create-task \
  --api-key bb_your_api_key \
  --prompt "Your task description" \
  --repo https://github.com/user/repo
```

## Options

| Option | Short | Type | Required | Default | Description |
| --- | --- | --- | --- | --- | --- |
| `--prompt` | `-p` | string | ✓ | - | Task description or prompt |
| `--repo` | `-r` | string | ✓ | - | Repository URL (GitHub, GitLab, or Bitbucket) |
| `--agent` | `-a` | string | ✗ | `blackbox` | AI agent to use |
| `--model` | `-m` | string | ✗ | `blackboxai/blackbox-pro` | Model to use |
| `--api-key` | - | string | ✗ | `$BB_API_KEY` | Blackbox Cloud API key |

## Examples

### Example 1: Add Payment Processing

```bash
blackbox create-task \
  -p "Add Stripe payment integration with subscription support" \
  -r https://github.com/myorg/ecommerce-app
```

### Example 2: Migrate Database

```bash
blackbox create-task \
  -p "Migrate from MongoDB to PostgreSQL" \
  -r https://github.com/myorg/backend-api \
  -m blackboxai/blackbox-pro
```

### Example 3: Security Audit

```bash
blackbox create-task \
  -p "Audit codebase for security vulnerabilities and suggest fixes" \
  -r https://github.com/myorg/api \
  -a blackbox
```

## Response

After successful task creation, you'll see:

```text
✓ Task created successfully!
Task ID: task-abc123def456
Status: pending
View task: https://cloud.blackbox.ai/tasks/task-abc123def456
```

## Error Handling

### Missing API Key

```text
✗ Error: API key not found. Set BB_API_KEY environment variable or use --api-key
```

**Solution:** Set the `BB_API_KEY` environment variable or use `--api-key` option.

### Invalid Repository URL

```text
✗ Error: Repository URL should be from GitHub, GitLab, or Bitbucket
```

**Solution:** Use a valid GitHub, GitLab, or Bitbucket URL.

### Empty Prompt

```text
✗ Error: Prompt is required and cannot be empty
```

**Solution:** Provide a task description with `--prompt` or `-p`.

### API Errors

```text
✗ Error: Failed to create task: Unauthorized
```

**Solution:** Check that your API key is valid and not expired.

## Troubleshooting

### Command not found

Make sure Blackbox CLI is properly installed:

```bash
npm install -g @blackbox_ai/cli
```

Or clone and install from source:

```bash
git clone https://github.com/blackboxaicode/cli
cd cli
npm install
npm run build
npm link
```

### Invalid API key format

API keys should start with `bb_`. Double-check your key and ensure it's valid by logging in to [Blackbox Cloud](https://cloud.blackbox.ai).

### Network errors

If you're behind a corporate proxy, configure the proxy:

```bash
blackbox configure --proxy https://proxy.company.com:3128
```

## Integration with Other Tools

You can pipe output or use this in scripts:

```bash
#!/bin/bash

# Create a task from a TODO comment
blackbox create-task \
  -p "Implement the TODO item in main.js" \
  -r $(git config --get remote.origin.url)
```

## See Also

- [Blackbox Cloud Documentation](https://docs.blackbox.ai)
- [API Reference](https://docs.blackbox.ai/api)
- [Available Models](https://docs.blackbox.ai/models)
