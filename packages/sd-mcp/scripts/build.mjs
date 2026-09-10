import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const releaseVersion = process.argv[2];

execFileSync(process.execPath, [path.resolve(packageRoot, 'scripts', 'gen-component-data.mjs')], {
  cwd: packageRoot,
  stdio: 'inherit',
});
execFileSync(
  process.execPath,
  [path.resolve(packageRoot, 'node_modules', 'tsdown', 'dist', 'run.mjs')],
  {
    cwd: packageRoot,
    env: {
      ...process.env,
      ...(releaseVersion ? { SD_MCP_VERSION: releaseVersion } : {}),
    },
    stdio: 'inherit',
  },
);
