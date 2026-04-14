import { spawn } from 'node:child_process';
import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

async function runVueTsc() {
  await new Promise((resolve, reject) => {
    const child = spawn('pnpm', ['exec', 'vue-tsc', '-p', 'tsconfig.build.json'], {
      stdio: 'inherit',
      shell: true,
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`vue-tsc exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

async function moveDirectoryContents(sourceDir, targetDir) {
  const entries = await readdir(sourceDir, { withFileTypes: true });

  await mkdir(targetDir, { recursive: true });

  for (const entry of entries) {
    const sourcePath = path.resolve(sourceDir, entry.name);
    const targetPath = path.resolve(targetDir, entry.name);
    await cp(sourcePath, targetPath, { recursive: true, force: true });
  }
}

export default async function buildDts() {
  await rm('.temp-types', { recursive: true, force: true });
  await runVueTsc();
  await moveDirectoryContents(path.resolve('.temp-types', 'components'), path.resolve('es'));
  await rm('.temp-types', { recursive: true, force: true });
  console.log('Generated declaration files.');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await buildDts();
}
