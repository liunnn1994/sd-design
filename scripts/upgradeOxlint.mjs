import { merge } from 'es-toolkit';
import { execSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { platform, tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { format as oxfmtFormat } from 'oxfmt';

const CONFIG_FILE = '.oxlintrc.json';
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(SCRIPT_DIR, '..');

function resolveOxlintPath(isWindows) {
  const oxlintPath = join(
    PROJECT_ROOT,
    'node_modules',
    '.bin',
    isWindows ? 'oxlint.CMD' : 'oxlint',
  );

  if (!existsSync(oxlintPath)) {
    throw new Error(`未找到本地 oxlint 可执行文件: ${oxlintPath}`);
  }

  return oxlintPath;
}

function loadConfig(filePath = CONFIG_FILE, { warnIfMissing = true } = {}) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8').toString());
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      if (warnIfMissing) {
        console.warn(`未找到 ${filePath} 文件`);
      }
      return null;
    }

    throw error;
  }
}

function generateNextConfig(oxlintPath, shell) {
  const tempDir = mkdtempSync(join(tmpdir(), 'oxlint-init-'));

  try {
    console.log('生成新配置...');
    console.log(execSync(`"${oxlintPath}" --init`, { cwd: tempDir, shell }).toString());

    const nextConfig = loadConfig(join(tempDir, CONFIG_FILE), { warnIfMissing: false });

    if (!nextConfig) {
      throw new Error('未读取到新生成的 oxlint 配置');
    }

    return nextConfig;
  } finally {
    rmSync(tempDir, { force: true, recursive: true });
  }
}

async function main() {
  const isWindows = platform() === 'win32';
  const shell = isWindows ? 'cmd.exe' : '/bin/bash';
  const oxlintPath = resolveOxlintPath(isWindows);

  const currentConfig = loadConfig();
  const nextConfig = generateNextConfig(oxlintPath, shell);
  const mergedConfig = currentConfig ? merge({}, currentConfig, nextConfig) : nextConfig;
  const configStr = JSON.stringify(mergedConfig);

  if (!configStr) {
    return;
  }

  console.log(currentConfig ? '合并新旧配置...' : '写入新配置...');
  console.log('格式化配置...');
  const result = await oxfmtFormat(CONFIG_FILE, configStr);

  if (result.errors.length > 0) {
    console.warn('oxfmt 格式化失败，保留原始配置');
    for (const error of result.errors) {
      console.warn(error.message);
    }
    return;
  }

  writeFileSync(CONFIG_FILE, result.code);
}

await main();
