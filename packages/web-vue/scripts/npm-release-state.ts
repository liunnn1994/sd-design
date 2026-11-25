import type { PackageJson } from 'type-fest';

import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import type { ReleasePackage } from './release-config.ts';

import { sharedDependenciesChanged } from './release-dependencies.ts';

type NpmReleaseManifest = PackageJson & { dist?: { tarball?: string } };

export async function readReleaseManifest(cwd: string, name: ReleasePackage): Promise<PackageJson> {
  return JSON.parse(await readFile(join(cwd, 'packages', name, 'package.json'), 'utf8'));
}

export async function npmReleaseVersion(name: ReleasePackage, version: string) {
  const packageName = `@sdata/${name}`;
  const response = await fetch(
    `https://registry.npmjs.org/${encodeURIComponent(packageName)}/${encodeURIComponent(version)}`,
    { cache: 'no-cache', signal: AbortSignal.timeout(15_000) },
  );
  if (!response.ok) {
    await response.body?.cancel();
    if (response.status === 404) return undefined;
    throw new Error(`Unable to verify ${packageName}@${version} on npm: HTTP ${response.status}`);
  }
  const manifest: NpmReleaseManifest = await response.json();
  if (manifest.name !== packageName || manifest.version !== version) {
    throw new Error(`Unexpected npm metadata for ${packageName}@${version}`);
  }
  return manifest;
}

export async function waitForNpmTarball(manifest: NpmReleaseManifest, timeout = 300_000) {
  const tarball = new URL(manifest.dist?.tarball ?? '');
  if (tarball.origin !== 'https://registry.npmjs.org') {
    throw new Error(`Unexpected npm tarball URL for ${manifest.name}@${manifest.version}`);
  }
  const deadline = Date.now() + timeout;
  for (;;) {
    const response = await fetch(tarball, {
      method: 'HEAD',
      cache: 'no-cache',
      signal: AbortSignal.timeout(15_000),
    });
    if (response.ok) return;
    if (response.status !== 404 || Date.now() >= deadline) {
      throw new Error(
        `npm tarball for ${manifest.name}@${manifest.version} returned HTTP ${response.status}`,
      );
    }
    await setTimeout(10_000);
  }
}

export function npmReleaseState(name: ReleasePackage, coreVersion?: string): [string, object] {
  return [fileURLToPath(import.meta.url), { name, coreVersion }];
}

export function coreDependencyRange(manifest: PackageJson, coreVersion?: string) {
  if (!coreVersion || manifest.dependencies?.['@sdata/web-core'] !== 'workspace:^') {
    throw new Error(`Cannot determine the Core dependency for ${manifest.name}`);
  }
  return `^${coreVersion}`;
}

export async function analyzeCommits(
  { name, coreVersion }: { name: ReleasePackage; coreVersion?: string },
  {
    cwd,
    lastRelease,
    logger,
  }: {
    cwd: string;
    lastRelease: { version?: string; gitHead?: string };
    logger: { log: (message: string) => void };
  },
) {
  const version = lastRelease.version;
  if (!version) return;
  const published = await npmReleaseVersion(name, version);
  const manifest = await readReleaseManifest(cwd, name);
  if (name !== 'web-core') {
    const expected = coreDependencyRange(manifest, coreVersion);
    if (published && published.dependencies?.['@sdata/web-core'] !== expected) {
      logger.log(`Releasing @sdata/${name} with Core dependency ${expected}.`);
      return 'patch';
    }
  } else if (published) {
    const changed = execFileSync(
      'git',
      [
        'diff',
        '--name-only',
        lastRelease.gitHead ?? 'HEAD',
        'HEAD',
        '--',
        'packages/web-core/src',
        'packages/web-core/styles',
        'packages/web-core/package.json',
        'packages/web-core/tsconfig.json',
        'pnpm-workspace.yaml',
        'pnpm-lock.yaml',
      ],
      { cwd, encoding: 'utf8' },
    )
      .trim()
      .split(/\r?\n/);
    if (
      manifest.version !== version ||
      changed.some((file) => file.startsWith('packages/web-core/')) ||
      (changed.some((file) => file.startsWith('pnpm-')) &&
        sharedDependenciesChanged(cwd, 'HEAD', ['packages/web-core/'], lastRelease.gitHead))
    ) {
      logger.log(`Core workspace differs from npm release ${version}.`);
      return 'patch';
    }
  }
  if (!published) {
    logger.log(`@sdata/${name}@${version} is absent from npm. Publishing a successor.`);
    return 'patch';
  }
}
