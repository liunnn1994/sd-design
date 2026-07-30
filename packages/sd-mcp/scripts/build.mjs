import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const releaseVersion = process.argv[2];
const pnpmCli = process.env.npm_execpath;
const pnpmCommand = pnpmCli ? process.execPath : 'pnpm';
const pnpmArgs = (args) => (pnpmCli ? [pnpmCli, ...args] : args);

execFileSync(pnpmCommand, pnpmArgs(['run', 'gen']), {
  cwd: packageRoot,
  stdio: 'inherit',
});
execFileSync(pnpmCommand, pnpmArgs(['exec', 'tsdown']), {
  cwd: packageRoot,
  env: {
    ...process.env,
    ...(releaseVersion ? { SD_MCP_VERSION: releaseVersion } : {}),
  },
  stdio: 'inherit',
});
