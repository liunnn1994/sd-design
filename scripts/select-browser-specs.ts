import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { posix as path } from 'node:path';

import { isDocsE2eSpec } from '../packages/web-react/scripts/docs-e2e-specs.ts';

const vueRoot = 'packages/web-vue/';
const reactRoot = 'packages/web-react/';
const git = (...args: string[]) =>
  execFileSync('git', args, { encoding: 'utf8' }).split('\0').filter(Boolean);
const tracked = git(
  'ls-files',
  '-z',
  'packages/web-vue',
  'packages/web-react',
  'packages/web-core',
);
const { BASE, VUE, REACT, DOCS, GITHUB_OUTPUT } = process.env;
const vueSpecs = tracked.filter((file) =>
  path.matchesGlob(file, vueRoot + 'components/**/__test__/*.cy.ts'),
);
const reactSpecs = tracked.filter((file) =>
  path.matchesGlob(file, reactRoot + 'tests/browser/*.cy.ts'),
);
let vue = VUE === 'true' ? vueSpecs : [];
let react = REACT === 'true' ? reactSpecs : [];
let docsPages: string[] = [];
const vueDocs = DOCS === 'true';
const reactDocsSpecs = reactSpecs.filter((file) => isDocsE2eSpec(file.slice(reactRoot.length)));

if (BASE && (vue.length || react.length)) {
  const { buildBrowserDependencyGraph, selectReactSpecs } =
    await import('./browser-dependency-graph.ts');
  const graph = buildBrowserDependencyGraph(
    tracked,
    process.cwd(),
    Boolean(vue.length),
    Boolean(react.length),
  );
  if (vue.length) {
    const { findAffectedSpecs } =
      await import('../packages/web-vue/scripts/find-affected-cypress-specs.ts');
    const selected = new Set(
      findAffectedSpecs(BASE, 'HEAD', false, graph, tracked).specs.map((spec) => vueRoot + spec),
    );
    vue = vue.filter((spec) => selected.has(spec));
  }
  if (react.length) {
    const selected = selectReactSpecs(
      graph,
      git('diff', '--name-only', '--no-renames', '-z', BASE, 'HEAD'),
      process.cwd(),
    );
    react = selected.specs;
    docsPages = selected.docsPages;
  }
}
const reactDocs = vueDocs ? reactDocsSpecs : reactDocsSpecs.filter((file) => react.includes(file));
const reactShards = react.filter((file) => !reactDocsSpecs.includes(file));

function shards(specs: string[], root: string, firstLetter: (file: string) => string) {
  const files = specs.map((spec) => spec.slice(root.length));
  const groups = Map.groupBy(files, (file) => firstLetter(file).toLowerCase());
  return [...groups.keys()].sort().map((initials) => ({
    initials,
    specs: groups.get(initials)!.join(','),
  }));
}

const vueMatrix = shards(
  vue,
  vueRoot,
  (file) => Array.from(file.split('/')[1]).find((character) => character !== '_') ?? '',
);
const reactMatrix = shards(reactShards, reactRoot, (file) => file.split('/').at(-1)?.[0] ?? '').map(
  (shard) => ({
    ...shard,
    docsPreview: false,
    vueDocs: false,
  }),
);
if (reactDocs.length) {
  reactMatrix.push({
    initials: 'docs',
    specs: reactDocs.map((file) => file.slice(reactRoot.length)).join(','),
    docsPreview: true,
    vueDocs,
  });
}
const docsPreview = reactMatrix.some((shard) => shard.docsPreview);

console.log(
  `Selected ${vue.length} Vue specs, ${reactShards.length} React specs, docs suite: ${docsPreview}`,
);
if (GITHUB_OUTPUT) {
  appendFileSync(
    GITHUB_OUTPUT,
    `vue=${JSON.stringify(vueMatrix)}\nbrowser=${JSON.stringify(reactMatrix)}\ndocsPages=${docsPages.join('|')}\n`,
  );
}
