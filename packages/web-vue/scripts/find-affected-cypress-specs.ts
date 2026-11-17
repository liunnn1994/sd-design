import { parseJSON5 } from 'confbox/json5';
import fg from 'fast-glob';
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { list } from 'postcss';
import { parse as parseScss } from 'postcss-scss';
import { parseSync, Visitor } from 'vite';
import { parse as parseSfc } from 'vue/compiler-sfc';

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

function imports(file: string, source: string): string[] {
  if (file.endsWith('.vue')) {
    const { descriptor, errors } = parseSfc(source, { filename: file });
    if (errors.length) throw new Error(`Cannot parse ${file}: ${errors.join(', ')}`);
    return [descriptor.script, descriptor.scriptSetup, ...descriptor.styles].flatMap((block) =>
      block
        ? block.src
          ? [block.src]
          : imports(
              `${file}.${block.lang ?? (block.type === 'style' ? 'css' : 'js')}`,
              block.content,
            )
        : [],
    );
  }
  if (file.endsWith('.scss') || file.endsWith('.css')) {
    const dependencies: string[] = [];
    parseScss(source, { from: file }).walkAtRules((rule) => {
      if (!['use', 'forward', 'import'].includes(rule.name)) return;
      for (const value of list.comma(rule.params)) {
        const specifier = list.space(value)[0];
        if (specifier?.startsWith('"') || specifier?.startsWith("'"))
          dependencies.push(parseJSON5<string>(specifier));
      }
    });
    return dependencies;
  }
  const result = parseSync(file, source);
  if (result.errors.length)
    throw new Error(
      `Cannot parse ${file}: ${result.errors.map((error) => error.message).join(', ')}`,
    );
  const dependencies = [
    ...result.module.staticImports
      .filter((entry) => !entry.entries.length || entry.entries.some((item) => !item.isType))
      .map((entry) => entry.moduleRequest.value),
    ...result.module.staticExports.flatMap((entry) =>
      entry.entries
        .filter((item) => !item.isType && item.moduleRequest)
        .map((item) => item.moduleRequest!.value),
    ),
  ];
  new Visitor({
    ImportExpression(node) {
      if (node.source.type === 'Literal' && typeof node.source.value === 'string')
        dependencies.push(node.source.value);
      else if (node.source.type === 'TemplateLiteral' && !node.source.expressions.length)
        dependencies.push(node.source.quasis[0].value.cooked!);
    },
  }).visit(result.program);
  return dependencies;
}

export function selectAffectedSpecs({
  changedFiles,
  componentDependencies,
  componentSpecs,
  forceAll = false,
  additiveFiles = new Set<string>(),
  dependencyChanges = true,
}: {
  changedFiles: string[];
  componentDependencies: Map<string, Iterable<string>>;
  componentSpecs: Map<string, string[]>;
  forceAll?: boolean;
  additiveFiles?: Set<string>;
  dependencyChanges?: boolean;
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
  const affected = new Set(changed);
  const queue = [...changed];
  while (queue.length) {
    for (const dependent of reverse.get(queue.shift()!) ?? []) {
      if (affected.has(dependent)) continue;
      affected.add(dependent);
      queue.push(dependent);
    }
  }
  const components = [...affected].sort();
  const specs = components.flatMap((component) => componentSpecs.get(component) ?? []).sort();
  return { mode: specs.length ? 'affected' : 'none', components, specs };
}

export function discoverMetadata(root = packageRoot) {
  const componentsRoot = path.join(root, 'components');
  const specFiles = fg.sync('components/*/__test__/*.cy.ts', { cwd: root }).map(normalizePath);
  const componentSpecs = new Map<string, string[]>();
  for (const spec of specFiles) {
    const component = spec.split('/')[1];
    componentSpecs.set(component, [...(componentSpecs.get(component) ?? []), spec]);
  }
  const names = new Set(
    fg
      .sync('components/*', { cwd: root, onlyDirectories: true })
      .map(normalizePath)
      .map((directory) => directory.split('/')[1])
      .filter((name) => !name.startsWith('_') && name !== 'style'),
  );
  for (const name of names) {
    if (!componentSpecs.has(name)) componentSpecs.set(name, []);
  }
  const componentDependencies = new Map([...names].map((name) => [name, new Set<string>()]));
  for (const sourceRoot of [
    componentsRoot,
    path.resolve(root, '../web-core/src'),
    path.resolve(root, '../web-core/styles'),
  ]) {
    const files = fg.sync('**/*.{js,ts,tsx,vue,scss}', {
      cwd: sourceRoot,
      ignore: ['**/__test__/**'],
    });
    for (const file of files) {
      const owner = normalizePath(file).split('/')[0];
      if (!names.has(owner)) continue;
      const absoluteFile = path.join(sourceRoot, file);
      for (const specifier of imports(absoluteFile, readFileSync(absoluteFile, 'utf8'))) {
        let dependency = null;
        if (specifier.startsWith('@components/')) dependency = specifier.split('/')[1];
        else if (specifier.startsWith('@sdata/web-core/'))
          dependency = specifier.replace(/^@sdata\/web-core\/(?:styles\/)?/, '').split('/')[0];
        else if (specifier.startsWith('.')) {
          dependency = normalizePath(
            path.relative(sourceRoot, path.resolve(path.dirname(absoluteFile), specifier)),
          ).split('/')[0];
        }
        if (dependency !== null && names.has(dependency) && dependency !== owner)
          componentDependencies.get(owner)!.add(dependency);
      }
    }
  }
  return { componentDependencies, componentSpecs };
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

function main() {
  const options = parseArguments(process.argv.slice(2));
  const forceAll = options.forceAll || !options.base || /^0+$/.test(options.base);
  const changedFiles = [];
  const additiveFiles = new Set<string>();
  if (!forceAll) {
    const numstat = execFileSync(
      'git',
      ['diff', '--numstat', '--no-renames', options.base, options.head],
      { cwd: repositoryRoot, encoding: 'utf8' },
    );
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
  const result = selectAffectedSpecs({
    ...discoverMetadata(),
    changedFiles,
    forceAll,
    additiveFiles,
    dependencyChanges:
      !forceAll && changedFiles.some((file) => dependencyFiles.test(file))
        ? sharedDependenciesChanged(
            repositoryRoot,
            options.head,
            ['', packagePrefix, 'packages/web-core/'],
            options.base,
          )
        : false,
  });
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
