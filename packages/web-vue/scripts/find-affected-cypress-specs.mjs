import fg from 'fast-glob';
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(packageRoot, '../..');
const componentsRoot = path.join(packageRoot, 'components');
const packagePrefix = 'packages/web-vue/';
const globalInvalidators = [
  /^package\.json$/,
  /^pnpm-(?:lock|workspace)\.yaml$/,
  /^packages\/web-vue\/(?:package\.json|cypress\.config\.ts|vite\.config\.ts)$/,
  /^packages\/web-vue\/cypress\/support\//,
  /^packages\/web-vue\/components\/(?:index\.(?:ts|scss)|style\/|_components\/|_hooks\/|_utils\/|icon\/)/,
  /^packages\/web-vue\/scripts\/find-affected-cypress-specs(?:\.test)?\.mjs$/,
];
const normalizePath = (value) => value.replaceAll('\\', '/').replace(/^\.\//, '');

export function selectAffectedSpecs({
  changedFiles,
  componentDependencies,
  componentSpecs,
  forceAll = false,
}) {
  const changes = changedFiles.map(normalizePath);
  const allSpecs = [...componentSpecs.values()].flat().sort();
  const all = () => ({
    mode: 'all',
    components: [...componentSpecs.keys()].sort(),
    specs: allSpecs,
  });
  if (forceAll || changes.some((file) => globalInvalidators.some((rule) => rule.test(file))))
    return all();

  const changed = new Set();
  for (const file of changes) {
    if (!file.startsWith(packagePrefix)) continue;
    const relative = file.slice(packagePrefix.length);
    const match = relative.match(/^components\/([^/]+)\//);
    if (match && componentSpecs.has(match[1])) changed.add(match[1]);
    else if (!relative.startsWith('components/') && !relative.startsWith('scripts/')) return all();
  }

  const reverse = new Map();
  for (const [component, dependencies] of componentDependencies) {
    for (const dependency of dependencies) {
      const dependents = reverse.get(dependency) ?? new Set();
      dependents.add(component);
      reverse.set(dependency, dependents);
    }
  }
  const affected = new Set(changed);
  const queue = [...changed];
  while (queue.length) {
    for (const dependent of reverse.get(queue.shift()) ?? []) {
      if (affected.has(dependent)) continue;
      affected.add(dependent);
      queue.push(dependent);
    }
  }
  const components = [...affected].sort();
  const specs = components.flatMap((component) => componentSpecs.get(component) ?? []).sort();
  return { mode: specs.length ? 'affected' : 'none', components, specs };
}

function discoverMetadata() {
  const specFiles = fg
    .sync('components/*/__test__/*.cy.ts', { cwd: packageRoot })
    .map(normalizePath);
  const componentSpecs = new Map();
  for (const spec of specFiles) {
    const component = spec.split('/')[1];
    componentSpecs.set(component, [...(componentSpecs.get(component) ?? []), spec]);
  }
  const names = new Set(
    fg
      .sync('components/*', { cwd: packageRoot, onlyDirectories: true })
      .map(normalizePath)
      .map((directory) => directory.split('/')[1])
      .filter((name) => !name.startsWith('_') && name !== 'style'),
  );
  for (const name of names) {
    if (!componentSpecs.has(name)) componentSpecs.set(name, []);
  }
  const componentDependencies = new Map([...names].map((name) => [name, new Set()]));
  const files = fg.sync('components/**/*.{js,ts,tsx,vue,scss}', {
    cwd: packageRoot,
    ignore: ['components/**/__test__/**'],
  });
  const importPattern = /(?:from\s+|import\s*\(|import\s+|@use\s+|@forward\s+)["']([^"']+)["']/g;
  for (const file of files) {
    const owner = normalizePath(file).split('/')[1];
    if (!names.has(owner)) continue;
    const absoluteFile = path.join(packageRoot, file);
    for (const match of readFileSync(absoluteFile, 'utf8').matchAll(importPattern)) {
      let dependency = null;
      if (match[1].startsWith('@components/')) dependency = match[1].split('/')[1];
      else if (match[1].startsWith('.')) {
        dependency = normalizePath(
          path.relative(componentsRoot, path.resolve(path.dirname(absoluteFile), match[1])),
        ).split('/')[0];
      }
      if (names.has(dependency) && dependency !== owner)
        componentDependencies.get(owner).add(dependency);
    }
  }
  return { componentDependencies, componentSpecs };
}

function parseArguments(argv) {
  const options = { base: '', head: 'HEAD', forceAll: false };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--all') options.forceAll = true;
    else if (argv[index] === '--base') options.base = argv[++index] ?? '';
    else if (argv[index] === '--head') options.head = argv[++index] ?? 'HEAD';
  }
  return options;
}

function main() {
  const options = parseArguments(process.argv.slice(2));
  const forceAll = options.forceAll || !options.base || /^0+$/.test(options.base);
  const changedFiles = forceAll
    ? []
    : execFileSync(
        'git',
        ['diff', '--name-only', '--diff-filter=ACMRT', options.base, options.head],
        {
          cwd: repositoryRoot,
          encoding: 'utf8',
        },
      )
        .split(/\r?\n/)
        .filter(Boolean);
  const result = selectAffectedSpecs({ ...discoverMetadata(), changedFiles, forceAll });
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

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
