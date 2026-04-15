import { spawn } from 'node:child_process';
import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';

const packageRoot = path.resolve(import.meta.dirname, '..');

const resolveFromRoot = (...segments) => path.resolve(packageRoot, ...segments);

await rm(resolveFromRoot('.temp-types'), { recursive: true, force: true });

try {
  await runVueTsc();
  await moveDirectoryContents(resolveFromRoot('.temp-types', 'components'), resolveFromRoot('es'));
} finally {
  await rm(resolveFromRoot('.temp-types'), { recursive: true, force: true });
}

async function runVueTsc() {
  await new Promise((resolve, reject) => {
    const child = spawn('pnpm', ['exec', 'vue-tsc', '-p', 'tsconfig.build.json'], {
      cwd: packageRoot,
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