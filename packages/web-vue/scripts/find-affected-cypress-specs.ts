import fg from 'fast-glob';
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  affectedBy,
  buildBrowserDependencyGraph,
  coreBrowserFixtureRoots,
} from '../../../scripts/browser-dependency-graph.ts';
import { sharedDependenciesChanged } from './release-dependencies.ts';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(packageRoot, '../..');
const packagePrefix = 'packages/web-vue/';
const dependencyFiles =
  /^(?:package\.json|pnpm-(?:lock|workspace)\.yaml|packages\/(?:web-core|web-vue)\/package\.json)$/;
const globalInvalidators = [
  /^packages\/web-core\/(?:scripts\/|tsconfig\.json$)/,
  /^packages\/web-vue\/(?:cypress\.config\.ts|vite\.config\.ts)$/,
  /^packages\/web-vue\/cypress\/support\//,
  /^packages\/web-vue\/components\/(?:style\/|_components\/|_hooks\/|_utils\/|icon\/)/,
];
// This selector script itself is intentionally NOT a global invalidator: a
// change to it alters no component, so forcing a full run would only punish
// iteration on the selection logic. The logic is validated by the unit tests
// in find-affected-cypress-specs.test.ts (test:affected:unit, run in CI), and
// component regressions are still caught by the scheduled full run.
// Barrel files (components/index.ts, components/index.scss) re-export every
// component, so a non-additive change - a removed or modified export / @use -
// can ripple to other components' tests. But registering a newly added
// component only appends a line (purely additive) and affects just that
// component. We therefore treat barrels as global invalidators only when the
// diff contains removals; `additiveFiles` (from `git diff --numstat`) marks
// files whose diff is purely insertions.
const barrelInvalidators = [/^packages\/web-vue\/components\/index\.(?:ts|scss)$/];
// Root-level web-vue files that never affect Cypress component tests: docs,
// ambient type declarations, and non-test configs (typecheck / release). The
// genuinely test-affecting root configs (cypress.config.ts, vite.config.ts)
// are already in `globalInvalidators`; manifests use dependency comparison. Without this, generated
// docs like CHANGELOG.md - which semantic-release lands alongside features -
// would force a full run on every release commit.
const ignoredRootFiles = [
  /^[^/]+\.md$/, // CHANGELOG.md, README.md, *.md docs
  /^[^/]+\.d\.ts$/, // global.d.ts and other ambient declarations
  /^\.gitignore$/,
  /^tsconfig(?:\.[^/]+)?\.json$/, // tsconfig.json / tsconfig.build.json
  /^release\.config\.[^/]+$/, // release.config.ts
];
const normalizePath = (value: string) => value.replaceAll('\\', '/').replace(/^\.\//, '');

export function selectAffectedSpecs({
  changedFiles,
  componentDependencies,
  componentSpecs,
  forceAll = false,
  additiveFiles = new Set<string>(),
  dependencyChanges = true,
  browserReverse = new Map<string, Iterable<string>>(),
}: {
  changedFiles: string[];
  componentDependencies: Map<string, Iterable<string>>;
  componentSpecs: Map<string, string[]>;
  forceAll?: boolean;
  additiveFiles?: Set<string>;
  dependencyChanges?: boolean;
  browserReverse?: ReadonlyMap<string, Iterable<string>>;
}) {
  const changes = changedFiles.map(normalizePath);
  const additive = new Set([...additiveFiles].map(normalizePath));
  const allSpecs = [...componentSpecs.values()].flat().sort();
  const all = () => ({
    mode: 'all',
    components: [...componentSpecs.keys()].sort(),
    specs: allSpecs,
  });
  if (
    forceAll ||
    (dependencyChanges && changes.some((file) => dependencyFiles.test(file))) ||
    changes.some((file: string) => globalInvalidators.some((rule) => rule.test(file)))
  )
    return all();
  if (
    changes.some(
      (file: string) => barrelInvalidators.some((rule) => rule.test(file)) && !additive.has(file),
    )
  )
    return all();

  const changed = new Set<string>();
  const helpers = changes.filter((file) =>
    coreBrowserFixtureRoots.some((prefix) => file.startsWith(prefix)),
  );
  if (helpers.some((file) => !browserReverse.has(file))) return all();
  const referencedSpecs = new Set<string>();
  const referencedComponents = new Set<string>();
  for (const spec of affectedBy(
    browserReverse,
    changes.filter(
      (file) => !additive.has(file) || !barrelInvalidators.some((rule) => rule.test(file)),
    ),
  )) {
    if (!spec.startsWith(packagePrefix)) continue;
    const relative = spec.slice(packagePrefix.length);
    const owner = relative.split('/')[1];
    if (componentSpecs.get(owner)?.includes(relative)) {
      referencedSpecs.add(relative);
      referencedComponents.add(owner);
    }
  }
  for (const file of changes) {
    const core = file.match(/^packages\/web-core\/(?:src|styles)\/([^/]+)\//);
    if (/^packages\/web-core\/(?:src|styles)\//.test(file)) {
      if (!core || !componentSpecs.has(core[1])) return all();
      changed.add(core[1]);
      continue;
    }
    if (!file.startsWith(packagePrefix)) continue;
    const relative = file.slice(packagePrefix.length);
    if (relative === 'package.json') continue;
    // Existing specs are selected through the file graph without invalidating runtime dependents.
    if (referencedSpecs.has(relative)) continue;
    if (
      relative.startsWith('cypress/e2e/') ||
      /^cypress\.(?:markdown|theme)\.config\.ts$/.test(relative)
    )
      continue;
    const match = relative.match(/^components\/([^/]+)\//);
    if (match && componentSpecs.has(match[1])) changed.add(match[1]);
    else if (
      !relative.startsWith('components/') &&
      !relative.startsWith('scripts/') &&
      !ignoredRootFiles.some((rule) => rule.test(relative))
    )
      return all();
  }

  const reverse = new Map<string, Set<string>>();
  for (const [component, dependencies] of componentDependencies) {
    for (const dependency of dependencies) {
      const dependents = reverse.get(dependency) ?? new Set<string>();
      dependents.add(component);
      reverse.set(dependency, dependents);
    }
  }
  const affectedComponents = [...affectedBy(reverse, changed)];
  const components = [...new Set([...affectedComponents, ...referencedComponents])].sort();
  const specs = [
    ...new Set([
      ...affectedComponents.flatMap((component) => componentSpecs.get(component) ?? []),
      ...referencedSpecs,
    ]),
  ].sort();
  return { mode: specs.length ? 'affected' : 'none', components, specs };
}

export function discoverMetadata(
  root = repositoryRoot,
  graph?: ReturnType<typeof buildBrowserDependencyGraph>,
  tracked = fg.sync(
    [
      'packages/web-vue/components/**/*',
      'packages/web-core/{src,styles}/**/*',
      ...coreBrowserFixtureRoots.map((prefix) => `${prefix}**/*`),
    ],
    { cwd: root },
  ),
) {
  const specFiles = tracked
    .filter((file) =>
      path.posix.matchesGlob(file, `${packagePrefix}components/**/__test__/*.cy.ts`),
    )
    .map((file) => file.slice(packagePrefix.length));
  const componentSpecs = new Map<string, string[]>();
  for (const spec of specFiles) {
    const component = spec.split('/')[1];
    componentSpecs.set(component, [...(componentSpecs.get(component) ?? []), spec]);
  }
  const names = new Set(
    fg
      .sync('components/*', { cwd: path.join(root, packagePrefix), onlyDirectories: true })
      .map(normalizePath)
      .map((directory) => directory.split('/')[1])
      .filter((name) => !name.startsWith('_') && name !== 'style'),
  );
  for (const name of names) {
    if (!componentSpecs.has(name)) componentSpecs.set(name, []);
  }
  const componentDependencies = new Map([...names].map((name) => [name, new Set<string>()]));
  const { reverse } = graph ?? buildBrowserDependencyGraph(tracked, root, true, false);
  // Vue runs each affected component's whole spec group.
  const ownerOf = (file: string) => {
    const [, workspace, directory, name] = file.split('/');
    if (
      (workspace === 'web-vue' && directory === 'components' && !file.includes('/__test__/')) ||
      (workspace === 'web-core' && (directory === 'src' || directory === 'styles'))
    )
      return name;
  };
  for (const [file, importers] of reverse) {
    const dependency = ownerOf(file);
    if (!dependency || !names.has(dependency)) continue;
    for (const importer of importers) {
      const owner = ownerOf(importer);
      if (owner && owner !== dependency) componentDependencies.get(owner)?.add(dependency);
    }
  }
  return { componentDependencies, componentSpecs, browserReverse: reverse };
}

function parseArguments(argv: string[]) {
  const options = { base: '', head: 'HEAD', forceAll: false };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--all') options.forceAll = true;
    else if (argv[index] === '--base') options.base = argv[++index] ?? '';
    else if (argv[index] === '--head') options.head = argv[++index] ?? 'HEAD';
  }
  return options;
}

export function findAffectedSpecs(
  base: string,
  head = 'HEAD',
  all = false,
  graph?: ReturnType<typeof buildBrowserDependencyGraph>,
  tracked?: string[],
) {
  const forceAll = all || !base || /^0+$/.test(base);
  const changedFiles = [];
  const additiveFiles = new Set<string>();
  if (!forceAll) {
    const numstat = execFileSync('git', ['diff', '--numstat', '--no-renames', base, head], {
      cwd: repositoryRoot,
      encoding: 'utf8',
    });
    for (const line of numstat.split(/\r?\n/)) {
      if (!line.trim()) continue;
      const parts = line.split('\t');
      const filePath = parts.slice(2).join('\t');
      changedFiles.push(filePath);
      // parts[1] is the removed-line count; '0' means the diff is purely
      // additive (only insertions). '-' marks a binary file, treated
      // conservatively as non-additive.
      if (parts[1] === '0') additiveFiles.add(normalizePath(filePath));
    }
  }
  return selectAffectedSpecs({
    ...discoverMetadata(repositoryRoot, graph, tracked),
    changedFiles,
    forceAll,
    additiveFiles,
    dependencyChanges:
      !forceAll && changedFiles.some((file) => dependencyFiles.test(file))
        ? sharedDependenciesChanged(
            repositoryRoot,
            head,
            ['', packagePrefix, 'packages/web-core/'],
            base,
          )
        : false,
  });
}

function main() {
  const { base, head, forceAll } = parseArguments(process.argv.slice(2));
  const result = findAffectedSpecs(base, head, forceAll);
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `mode=${result.mode}\nspecs=${result.specs.join(',')}\n`,
    );
  }
  process.stdout.write(`Cypress selection: ${result.mode}\n`);
  process.stdout.write(`Components: ${result.components.join(', ') || '(none)'}\n`);
  process.stdout.write(`Specs: ${result.specs.join(',') || '(none)'}\n`);
}

if (import.meta.main) main();
