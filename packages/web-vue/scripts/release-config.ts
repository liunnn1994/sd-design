import type { Options } from 'semantic-release';

import { fileURLToPath } from 'node:url';

export const releasePackages = ['web-core', 'web-vue', 'web-react'] as const;
export type ReleasePackage = (typeof releasePackages)[number];

// Resolve plugins beside the existing release tooling, including for Core and React.
const plugin = (name: string) => fileURLToPath(import.meta.resolve(name));

export const createReleaseConfig = (name: ReleasePackage) =>
  ({
    branches: ['main'],
    tagFormat: `${name}-v\${version}`,
    plugins: [
      [
        fileURLToPath(new URL('./path-scoped-release.ts', import.meta.url)),
        { paths: [`packages/${name}/`, ...(name === 'web-core' ? [] : ['packages/web-core/'])] },
      ],
      [plugin('@semantic-release/changelog'), { changelogFile: `packages/${name}/CHANGELOG.md` }],
      [
        plugin('@semantic-release/exec'),
        {
          prepareCmd: `node packages/web-vue/scripts/prepare-release-package.ts ${name} \${nextRelease.version}`,
          // npm scans uploads before making versions installable, which can take 15 minutes or more.
          publishCmd: `pnpm --filter @sdata/${name} publish --no-git-checks --access public --publish-wait-timeout 1200000`,
        },
      ],
      [
        plugin('@semantic-release/git'),
        {
          assets: [`packages/${name}/CHANGELOG.md`, `packages/${name}/package.json`],
          message: `chore(release): ${name}@\${nextRelease.version} [skip ci]`,
        },
      ],
      [
        plugin('@semantic-release/github'),
        {
          assets: [],
          releaseBodyTemplate:
            "<% const notes = nextRelease.notes || ''; const maxLength = 120000; const suffix = '\\n\\n...\\n\\nRelease notes were truncated to fit the GitHub Release body limit. See CHANGELOG.md for the full entry.'; %><%= notes.length > maxLength ? notes.slice(0, maxLength - suffix.length) + suffix : notes %>",
        },
      ],
    ],
  }) satisfies Options;
