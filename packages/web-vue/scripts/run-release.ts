import semanticRelease from 'semantic-release';

import { releasePackages } from './release-config.ts';

const [name, flag, ...extra] = process.argv.slice(2);
const releasePackage = releasePackages.find((entry) => entry === name);
if (!releasePackage || (flag !== undefined && flag !== '--dry-run') || extra.length) {
  throw new Error('Expected web-core, web-vue or web-react, optionally followed by --dry-run.');
}

const { default: config } = await import(`../../${releasePackage}/release.config.ts`);
// semantic-release 26.0.1 lets default plugins override plugins loaded through extends.
await semanticRelease({ ...config, dryRun: flag === '--dry-run' });
