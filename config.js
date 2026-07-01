module.exports = {
  platform: 'gitea',
  endpoint: process.env.RENOVATE_ENDPOINT,
  token: process.env.RENOVATE_TOKEN,

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

  // Labels for PRs
  labels: ['dependencies'],

  // Base configuration to extend
  extends: [
    'config:recommended',
  ],

  // Package rules for common patterns
  packageRules: [
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
