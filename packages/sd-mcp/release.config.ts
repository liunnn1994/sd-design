export default {
  branches: ['main'],
  // 与 web-vue / auto-import-resolver 的发布 tag 隔离命名空间，
  // 避免共享 `v${version}` 导致对方的 tag 被本包误判为「最后一次发布」而跳过发布。
  tagFormat: 'mcp-v${version}',
  plugins: [
    [
      '../web-vue/scripts/path-scoped-release.ts',
      {
        paths: [
          'packages/sd-mcp/',
          'packages/web-core/src/',
          'packages/web-vue/components/',
          'packages/sd-vue-docs/src/generated/docs-sidebar.ts',
          'packages/sd-vue-docs/src/content/docs/components/',
        ],
      },
    ],
    [
      '@semantic-release/exec',
      {
        prepareCmd: 'node ./scripts/prepare-release-package.ts ${nextRelease.version}',
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
