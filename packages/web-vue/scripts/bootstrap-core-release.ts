import { execFileSync } from 'node:child_process';

export function bootstrapCoreRelease(cwd: string) {
  const git = (...args: string[]) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
  if (git('tag', '--list', 'web-core-v*')) return;

  const baseline = git(
    'tag',
    '--merged',
    'HEAD',
    '--list',
    'web-vue-v*',
    '--sort=-version:refname',
  ).split(/\r?\n/)[0];
  if (!baseline) throw new Error('Missing historical Core/Vue release tag.');
  const core = JSON.parse(git('show', `${baseline}:packages/web-core/package.json`));
  if (core.name !== '@sdata/web-core' || baseline !== `web-vue-v${core.version}`) {
    throw new Error('Historical Core version does not match the coordinated Vue release.');
  }
  git('tag', `web-core-v${core.version}`, `${baseline}^{commit}`);
}

if (import.meta.main) bootstrapCoreRelease(process.cwd());
