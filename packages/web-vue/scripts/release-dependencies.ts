import type { PackageJson } from 'type-fest';

import { parseYAML } from 'confbox/yaml';
import { execFileSync } from 'node:child_process';
import { isDeepStrictEqual } from 'node:util';

interface Workspace {
  catalog?: Record<string, string>;
  catalogs?: Record<string, Record<string, string>>;
}

interface Snapshot {
  dependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

interface Lockfile {
  importers?: Record<string, Record<string, Record<string, { version: string }>>>;
  snapshots?: Record<string, Snapshot>;
  packages?: Record<string, unknown>;
}

const dependencyGroups = [
  'dependencies',
  'optionalDependencies',
  'peerDependencies',
  'devDependencies',
] as const;

export function sharedDependenciesChanged(
  cwd: string,
  hash: string,
  paths: string[],
  base?: string,
) {
  const git = (...args: string[]) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
  const packagePaths = paths.filter(
    (prefix) => prefix === '' || /^packages\/[^/]+\/$/.test(prefix),
  );
  const state = (revision?: string) => {
    const read = (file: string) =>
      revision && git('ls-tree', '--name-only', revision, '--', file)
        ? git('show', `${revision}:${file}`)
        : '{}';
    return packagePaths.map((prefix) => {
      const manifest: PackageJson = JSON.parse(read(`${prefix}package.json`));
      // A package has no dependencies before it exists, regardless of historical config formats.
      if (!manifest.name) return null;
      const workspace = parseYAML<Workspace>(read('pnpm-workspace.yaml'));
      const lock = parseYAML<Lockfile>(read('pnpm-lock.yaml'));
      const catalogs: Record<string, string | undefined> = {};
      for (const group of dependencyGroups) {
        for (const [name, range] of Object.entries(manifest[group] ?? {})) {
          if (range?.startsWith('catalog:')) {
            const catalog = range.slice('catalog:'.length) || 'default';
            catalogs[`${group}/${name}`] = (
              catalog === 'default'
                ? (workspace.catalog ?? workspace.catalogs?.default)
                : workspace.catalogs?.[catalog]
            )?.[name];
          }
        }
      }

      const importer = lock.importers?.[prefix ? prefix.slice(0, -1) : '.'];
      const resolved: Record<string, unknown> = {};
      const visit = (name: string, version: string) => {
        const key = lock.snapshots?.[`${name}@${version}`] ? `${name}@${version}` : version;
        const snapshot = lock.snapshots?.[key];
        if (!snapshot || Object.hasOwn(resolved, key)) return;
        resolved[key] = { snapshot, package: lock.packages?.[key.split('(')[0]] };
        for (const [dependency, reference] of Object.entries({
          ...snapshot.dependencies,
          ...snapshot.optionalDependencies,
        })) {
          visit(dependency, reference);
        }
      };
      for (const group of dependencyGroups) {
        for (const [name, dependency] of Object.entries(importer?.[group] ?? {})) {
          visit(name, dependency.version);
        }
      }
      return {
        dependencies: dependencyGroups.map((group) => manifest[group]),
        engines: manifest.engines,
        packageManager: manifest.packageManager,
        type: manifest.type,
        catalogs,
        importer,
        resolved,
      };
    });
  };

  const parents = base ? [base] : git('rev-list', '--parents', '-n', '1', hash).split(' ').slice(1);
  const current = state(hash);
  return (parents.length ? parents : [undefined]).some(
    (parent) => !isDeepStrictEqual(current, state(parent)),
  );
}
