# Renovate Bot

Centralized Renovate bot for managing dependencies across all repositories on `forge.l3x.in`.

## What it does

- Automatically scans all repositories under the `alex` namespace
- Detects dependency files (package.json, requirements.txt, requirements.yml, etc.)
- Creates pull requests for updates
- Groups non-major updates together

## Setup

### 1. Create a Personal Access Token

On your Forgejo instance:
1. Go to Settings → Applications → Generate New Token
2. Name it `Renovate Bot`
3. Select scopes:
   - `repo` (Read and Write)
   - `user` (Read)
4. Copy the token

### 2. Add the token to this repository

1. Go to this repository's Settings → Secrets
2. Add a new secret named `RENOVATE_TOKEN`
3. Paste the token value

### 3. Enable the workflow

The workflow will run automatically every Sunday. To run manually:

1. Go to Actions → Renovate Bot
2. Click "Run workflow"
3. Optionally enable "Dry run" to test without creating PRs

## Per-repository configuration

Add a `renovate.json` to customize behavior for a specific repository:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:base"],
  "schedule": ["before 3am on Monday"],
  "automerge": true,
  "automergeType": "pr",
  "major": {
    "automerge": false
  }
}
```

See [Renovate Configuration Options](https://docs.renovatebot.com/configuration-options/) for all available options.

## Filtering by topics (alternative to namespaces)

To use topics instead of namespaces, edit:
1. `.forgejo/workflows/renovate.yml` - comment out `AUTODISCOVER_NAMESPACES`
2. `config.js` - change to use `autodiscoverTopics`

```javascript
// config.js
autodiscover: true,
autodiscoverTopics: ['dependencies'],
```

Then tag repositories with the `dependencies` topic on Forgejo.

## Monitoring

View the workflow run logs to see:
- Which repositories were scanned
- What updates were found
- Any errors that occurred

## Troubleshooting

### No PRs being created

1. Check the workflow logs for errors
2. Verify the `RENOVATE_TOKEN` secret is set correctly
3. Run with `dry_run: true` to see what would happen
4. Check that repositories have detectable dependency files

### Too many PRs

Adjust the schedule in `config.js`:
```javascript
schedule: ['every weekend'],  // less frequent
```

Or require manual approval for major updates:
```javascript
packageRules: [
  {
    matchUpdateTypes: ['major'],
    automerge: false,
  },
]
```

### Specific repository not being scanned

- Ensure it's under the `alex` namespace
- Check it has at least one dependency file
- Verify the bot token has read access to the repository

## Resources

- [Renovate Documentation](https://docs.renovatebot.com/)
- [Forgejo Platform Support](https://docs.renovatebot.com/modules/platform/forgejo/)
- [Self-Hosted Configuration](https://docs.renovatebot.com/self-hosted-configuration/)
