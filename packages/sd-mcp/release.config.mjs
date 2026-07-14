/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: ['main'],
  // 与 web-vue / auto-import-resolver 的发布 tag 隔离命名空间，
  // 避免共享 `v${version}` 导致对方的 tag 被本包误判为「最后一次发布」而跳过发布。
  tagFormat: 'mcp-v${version}',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
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
        assets: ['package.json'],
        message: 'chore(release): ${nextRelease.version} [skip ci]',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: [],
      },
    ],
  ],
};
