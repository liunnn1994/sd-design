/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: ['main'],
  // 与 web-vue 的发布 tag 隔离命名空间，避免两个包共享 `v${version}`
  // 导致对方的 tag 被本包误判为「最后一次发布」而跳过发布。
  tagFormat: 'resolver-v${version}',
  plugins: [
    './scripts/path-scoped-release.mjs',
    [
      '@semantic-release/exec',
      {
        prepareCmd: 'node ./scripts/prepare-release-package.mjs ${nextRelease.version}',
        publishCmd: 'pnpm publish --no-git-checks --access public',
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
