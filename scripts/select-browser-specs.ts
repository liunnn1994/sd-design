import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { posix as path } from 'node:path';

import { docsE2eSpecs } from '../packages/web-react/scripts/docs-e2e-specs.ts';

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
let docsPreviewSpecs = new Set(react);
const vueDocs = DOCS === 'true';
const reactDocsSpecs = docsE2eSpecs.map((file) => reactRoot + file);

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
    docsPreviewSpecs = selected.docsPreviewSpecs;
  }
}
const reactDocs = vueDocs ? reactDocsSpecs : reactDocsSpecs.filter((file) => react.includes(file));
const reactShards = react.filter((file) => !reactDocsSpecs.includes(file));

function shards(
  groups: string[],
  specs: string[],
  root: string,
  firstLetter: (file: string) => string,
) {
  const result = groups.map((initials) => ({ initials, specs: [] as string[] }));
  for (const spec of specs) {
    const file = spec.slice(root.length);
    const initial = firstLetter(file).toLowerCase();
    const shard = initial && result.find(({ initials }) => initials.includes(initial));
    if (!shard) throw new Error(`No browser test shard for ${spec}`);
    shard.specs.push(file);
  }
  return result
    .filter(({ specs }) => specs.length)
    .map(({ initials, specs }) => ({ initials, specs: specs.join(',') }));
}

const vueMatrix = shards(
  ['c', 't', 'abs', 'dgi', 'fklmw', 'ehjnopqruvxyz'],
  vue,
  vueRoot,
  (file) => Array.from(file.split('/')[1]).find((character) => character !== '_') ?? '',
);
const reactMatrix = shards(
  ['c', 't', 'dfmp', 'abeghijklnoqrsuvwxyz'],
  reactShards,
  reactRoot,
  (file) => file.split('/').at(-1)?.[0] ?? '',
).map((shard) => ({
  ...shard,
  docsPreview: shard.specs.split(',').some((file) => docsPreviewSpecs.has(reactRoot + file)),
  vueDocs: false,
}));
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
  `Selected ${vue.length} Vue specs, ${reactShards.length} React specs, docs suite: ${DOCS === 'true'}`,
);
if (GITHUB_OUTPUT) {
  appendFileSync(
    GITHUB_OUTPUT,
    `vue=${JSON.stringify(vueMatrix)}\nbrowser=${JSON.stringify(reactMatrix)}\ndocsPages=${docsPages.join('|')}\ndocsPreview=${docsPreview}\n`,
  );
}
