import { execFileSync } from 'node:child_process';
import semanticRelease from 'semantic-release';

import { bootstrapCoreRelease } from './bootstrap-core-release.ts';
import {
  coreDependencyRange,
  npmReleaseState,
  npmReleaseVersion,
  readReleaseManifest,
} from './npm-release-state.ts';
import { releasePackages } from './release-config.ts';

const [flag, ...extra] = process.argv.slice(2);
if ((flag !== undefined && flag !== '--dry-run') || extra.length) {
  throw new Error('Expected no arguments or --dry-run.');
}

function checkMainTip() {
  if (process.env.GITHUB_REF !== 'refs/heads/main') return;
  const git = (...args: string[]) => execFileSync('git', args, { encoding: 'utf8' }).trim();
  const head = git('rev-parse', 'HEAD');
  const remote = git('ls-remote', '--exit-code', 'origin', 'refs/heads/main').split('\t')[0];
  if (head !== remote) throw new Error(`Release checkout ${head} is stale. Main is at ${remote}.`);
}

const dryRun = flag === '--dry-run';
const cwd = process.cwd();
checkMainTip();
bootstrapCoreRelease(cwd);
let coreVersion: string | undefined;
for (const name of releasePackages) {
  const { default: config } = await import(`../../${name}/release.config.ts`);
  // semantic-release 26.0.1 lets default plugins override plugins loaded through extends.
  const result = await semanticRelease({
    ...config,
    plugins: [...config.plugins, npmReleaseState(name, coreVersion)],
    dryRun,
  });
  checkMainTip();
  const nextVersion = (result && result.nextRelease?.version) || undefined;
  if (name === 'web-core') {
    const manifest = await readReleaseManifest(cwd, name);
    coreVersion = nextVersion || manifest.version;
    if (
      !coreVersion ||
      (!dryRun &&
        (manifest.version !== coreVersion || !(await npmReleaseVersion(name, coreVersion))))
    ) {
      throw new Error(
        `Core ${coreVersion} must be available on npm before releasing Vue or React.`,
      );
    }
  } else if (!dryRun && nextVersion) {
    const expected = coreDependencyRange(await readReleaseManifest(cwd, name), coreVersion);
    const published = await npmReleaseVersion(name, nextVersion);
    if (published?.dependencies?.['@sdata/web-core'] !== expected) {
      throw new Error(
        `@sdata/${name}@${nextVersion} must be available on npm with Core ${expected}.`,
      );
    }
  }
}
