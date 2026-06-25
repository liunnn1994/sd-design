/**
 * @type {import('semantic-release').GlobalConfig}
 */
const githubReleaseBodyTemplate =
  "<% const notes = nextRelease.notes || ''; const maxLength = 120000; const suffix = '\\n\\n...\\n\\nRelease notes were truncated to fit the GitHub Release body limit. See CHANGELOG.md for the full entry.'; %><%= notes.length > maxLength ? notes.slice(0, maxLength - suffix.length) + suffix : notes %>";

export default {
  branches: ['main'],
  // 与 auto-import-resolver 的发布 tag 隔离命名空间，避免两个包共享 `v${version}`
  // 导致 resolver 的 tag 被本包误判为「最后一次发布」而跳过发布。
  tagFormat: 'web-vue-v${version}',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
      },
    ],
    [
      '@semantic-release/exec',
      {
        prepareCmd: 'node ./scripts/prepare-release-package.mjs ${nextRelease.version}',
        publishCmd: 'pnpm publish --no-git-checks --access public',
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json'],
        message: 'chore(release): ${nextRelease.version} [skip ci]',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: [],
        releaseBodyTemplate: githubReleaseBodyTemplate,
      },
    ],
  ],
};
