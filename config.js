module.exports = {
  platform: 'forgejo',
  endpoint: process.env.RENOVATE_ENDPOINT,
  token: process.env.RENOVATE_TOKEN,

  // Explicitly permit access to our internal Forgejo host
  hostRules: [
    {
      matchHost: new URL(process.env.FORGEJO_SERVER_URL).host,
      hostType: 'forgejo',
      allowInternal: true,
    },
    {
      matchHost: 'github.com',
      hostType: 'github',
      token: process.env.GITHUB_COM_TOKEN, // fine-grained PAT, public read-only is enough
    },
  ],

  // Auto-discover repositories
  autodiscover: true,
  onboarding: true,

  // Default schedule for all repos
  schedule: ['before 5am'],
  timezone: 'Europe/Berlin',

  // Repository caching for performance
  repositoryCache: 'enabled',

  // Git configuration
  gitAuthor: 'Renovate Bot <renovate-bot@noreply.forge.l3x.in>',

  // Labels for PRs and issues
  labels: ['dependencies'],

  // Labels for dependency dashboard issues
  dependencyDashboardLabels: ['dependencies'],

  // Post-upgrade commands (used by repos' renovate.json postUpgradeTasks)
  allowedCommands: ['^just tidy$'],

  // Base configuration to extend
  extends: [
    'config:recommended',
  ],

  // Package rules for common patterns
  packageRules: [
    // Internal shared Go lib between apps in the same repo
    {
      description: 'Ignore internal Go lib shared between apps',
      matchDatasources: ['go'],
      matchPackageNames: ['forge.l3x.in/atprotozoo/platform/libs'],
      enabled: false,
    },
    // Ignore reusable workflow from alex/.profile that cannot be resolved via
    // digest on Forgejo (github-actions manager looks it up as github-digest)
    {
      description: 'Ignore reusable workflow from alex/.profile that cannot be resolved via digest on Forgejo',
      matchManagers: ['github-actions'],
      matchPackageNames: ['alex/.profile'],
      enabled: false,
    },
    // Group minor and patch updates for non-major deps
    {
      matchUpdateTypes: ['minor', 'patch'],
      groupName: 'all non-major dependencies',
      automerge: false,
    },
    // Separate major updates
    {
      matchUpdateTypes: ['major'],
      groupName: 'major updates',
    },
  ],
};
