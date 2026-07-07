# Renovate Bot

Centralized Renovate bot for managing dependencies across all repositories on `forge.l3x.in`.

## What it does

- Automatically scans all repositories under the `alex` namespace
- Detects dependency files (package.json, requirements.txt, requirements.yml, etc.)
- Creates pull requests for updates
- Groups non-major updates together

## Setup

### 1. Create a Personal Access Token

Renovate uses `autodiscover: true`, which means it calls the Forgejo `/api/v1/repos/search` endpoint with the provided token and iterates over **every repository the token can access**. If the token only grants access to a single repository, autodiscover will only find that one repo — even if the account owns dozens more. The token must therefore have **instance-wide (account-wide) repository access**, not be scoped to a single repository.

#### Required scopes

| Scope | Permission | Required since | Why it's needed |
|---|---|---|---|
| `repo` | **Read & Write** | all versions | Clone repositories, create branches, commit, and push |
| `issue` | **Read & Write** | Forgejo ≥ 1.20 | Create and update pull requests and issues |
| `organization` | **Read** | Forgejo ≥ 1.20 | Read organization labels and team membership |
| `user` | **Read** | all versions | Identify the bot account (used by autodiscover) |

> **Why `issue` and `organization`?**
> In Forgejo/Gitea, pull requests are modeled as issues, so the `issue` scope (read **and** write) is required to open and update PRs. The `organization` scope lets Renovate read org-level labels and teams. These were not needed on very old Gitea versions but are mandatory on any modern Forgejo (≥ 1.20).

See the official Renovate Forgejo platform docs for the authoritative scope list:
- [Renovate — Forgejo Platform](https://docs.renovatebot.com/modules/platform/forgejo/)

#### Classic PAT vs fine-grained PAT

Forgejo offers two token types. **The choice matters for autodiscovery.**

**Classic PAT** (recommended for this bot)

1. Go to **Settings → Applications → Generate New Token**
2. Name it `Renovate Bot`
3. Select the scopes listed in the table above
4. Copy the token

A classic PAT implicitly grants access to **every repository the account owns or is a collaborator on** — exactly what `autodiscover` needs to enumerate all repos.

**Fine-grained PAT** (Forgejo ≥ 9.0)

If you prefer a fine-grained token, you **must** set repository access to **"All repositories"** (or at minimum every repo Renovate should manage). A fine-grained token scoped to a single repository will cause autodiscover to find only that one repo — this is the most common cause of "Renovate only discovers one repository." Grant these permissions:

- **Repository contents** — Read & Write
- **Issues** — Read & Write
- **Pull requests** — Read & Write
- **Organization** (labels/teams) — Read
- **User** — Read

For more details on creating tokens and available scopes, see the official Forgejo docs:
- [Forgejo — Access Tokens](https://forgejo.org/docs/latest/user/access-tokens/)
- [Forgejo — OAuth2 / Token Scopes](https://forgejo.org/docs/latest/user/oauth2-provider/)

#### Troubleshooting: only one repository discovered

If Renovate finds just a single repository, the token is almost certainly **repo-scoped** rather than account-wide. Verify that:
1. You are using a **classic PAT** (or a fine-grained PAT with "All repositories" access), not a token scoped to one repo.
2. The token has at minimum `repo` (RW) + `issue` (RW) scopes — without **write** on a repository, Renovate silently skips it.
3. The token's owner account has access to all the repositories you want Renovate to manage.

### 2. Add the token to this repository

1. Go to this repository's **Settings → Secrets**
2. Add a new secret named `PI_TOKEN`
3. Paste the token value

> The workflow file (`.forgejo/workflows/renovate.yml`) maps this secret to Renovate's `RENOVATE_TOKEN` environment variable internally, so the secret must be named `PI_TOKEN`.

### 3. Enable the workflow

The workflow runs automatically every day at 2 AM. To run manually:

1. Go to **Actions → Renovate Bot**
2. Click **"Run workflow"**
3. Optionally enable **"Dry run"** to test without creating PRs

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
2. Verify the `PI_TOKEN` secret is set correctly with the required [scopes](#1-create-a-personal-access-token)
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

- Ensure the token has **write** access to the repository (Renovate silently skips repos where the token lacks push permission)
- Check it has at least one dependency file
- Verify the token was created with account-wide access, not scoped to specific repos (see [Token permissions](#1-create-a-personal-access-token))

## Resources

- [Renovate Documentation](https://docs.renovatebot.com/)
- [Renovate — Forgejo Platform](https://docs.renovatebot.com/modules/platform/forgejo/)
- [Renovate — Self-Hosted Configuration](https://docs.renovatebot.com/self-hosted-configuration/)
- [Forgejo — Access Tokens](https://forgejo.org/docs/latest/user/access-tokens/)
- [Forgejo — OAuth2 / Token Scopes](https://forgejo.org/docs/latest/user/oauth2-provider/)
