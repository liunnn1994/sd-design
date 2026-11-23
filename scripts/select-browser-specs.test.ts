import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, posix as path } from 'node:path';
import { test, type TestContext } from 'node:test';

import { isDocsE2eSpec } from '../packages/web-react/scripts/docs-e2e-specs.ts';
import { selectAffectedSpecs } from '../packages/web-vue/scripts/find-affected-cypress-specs.ts';
import { buildBrowserDependencyGraph, selectReactSpecs } from './browser-dependency-graph.ts';

const root = join(import.meta.dirname, '..');
const tracked = execFileSync(
  'git',
  ['ls-files', '-z', 'packages/web-vue', 'packages/web-react', 'packages/web-core'],
  { cwd: root, encoding: 'utf8' },
)
  .split('\0')
  .filter(Boolean);
const vueRoot = 'packages/web-vue/';
const reactRoot = 'packages/web-react/';
const docsE2eSpecs = tracked
  .filter((file) => file.startsWith(reactRoot))
  .map((file) => file.slice(reactRoot.length))
  .filter(isDocsE2eSpec);

type Shard = { initials: string; specs: string; docsPreview?: boolean; vueDocs?: boolean };

function workflowMatrix(t: TestContext, suites: { VUE: string; REACT: string; DOCS: string }) {
  const directory = mkdtempSync(join(tmpdir(), 'sd-browser-matrix-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const output = join(directory, 'github-output');
  execFileSync(process.execPath, ['scripts/select-browser-specs.ts'], {
    cwd: root,
    env: {
      ...process.env,
      BASE: '',
      ...suites,
      GITHUB_OUTPUT: output,
    },
  });
  const rows = new Map(
    readFileSync(output, 'utf8')
      .trim()
      .split('\n')
      .map((line) => {
        const delimiter = line.indexOf('=');
        return [line.slice(0, delimiter), line.slice(delimiter + 1)];
      }),
  );
  return {
    vue: JSON.parse(rows.get('vue')!) as Shard[],
    react: JSON.parse(rows.get('browser')!) as Shard[],
  };
}

test('the scheduled matrix covers each spec once and uses nonempty initial groups', (t) => {
  const { vue, react } = workflowMatrix(t, { VUE: 'true', REACT: 'true', DOCS: 'true' });
  const files = (shards: Shard[]) => shards.flatMap(({ specs }) => specs.split(',')).sort();
  assert.deepEqual(
    files(vue),
    tracked
      .filter((file) => path.matchesGlob(file, vueRoot + 'components/**/__test__/*.cy.ts'))
      .map((file) => file.slice(vueRoot.length))
      .sort(),
  );
  assert.deepEqual(
    files(react),
    tracked
      .filter((file) => path.matchesGlob(file, reactRoot + 'tests/browser/*.cy.ts'))
      .map((file) => file.slice(reactRoot.length))
      .sort(),
  );
  assert.equal(new Set(vue.map(({ initials }) => initials)).size, vue.length);
  assert.equal(new Set(react.map(({ initials }) => initials)).size, react.length);
  for (const { initials, specs } of vue)
    for (const spec of specs.split(','))
      assert.equal(initials, spec.split('/')[1].replace(/^_+/, '')[0].toLowerCase());
  for (const { initials, specs } of react.filter(({ initials }) => initials !== 'docs'))
    for (const spec of specs.split(','))
      assert.equal(initials, path.basename(spec)[0].toLowerCase());
  const docs = react.find(({ initials }) => initials === 'docs')!;
  assert.deepEqual(docs.specs.split(','), docsE2eSpecs);
  assert.equal(docs.vueDocs, true);
  assert.equal(docs.docsPreview, true);
  assert.ok(react.every((shard) => shard.docsPreview === (shard.initials === 'docs')));
});

test('documentation changes use a single job with both frameworks', (t) => {
  const { vue, react } = workflowMatrix(t, {
    VUE: 'false',
    REACT: 'false',
    DOCS: 'true',
  });
  assert.deepEqual(vue, []);
  assert.deepEqual(react, [
    {
      initials: 'docs',
      specs: docsE2eSpecs.join(','),
      docsPreview: true,
      vueDocs: true,
    },
  ]);
});

test('shared browser helper and fixture changes select their Vue and React consumers', () => {
  const changedFiles = ['packages/web-core/tests/browser/drag-sort.ts'];
  const graph = buildBrowserDependencyGraph(tracked, root, true, true);
  const vueSpecs = tracked
    .filter((file) => path.matchesGlob(file, vueRoot + 'components/**/__test__/*.cy.ts'))
    .map((file) => file.slice(vueRoot.length));
  const componentSpecs = Map.groupBy(vueSpecs, (spec) => spec.split('/')[1]);
  const affectedVue = selectAffectedSpecs({
    changedFiles,
    componentDependencies: new Map(),
    componentSpecs,
    browserReverse: graph.reverse,
  });
  assert.equal(affectedVue.mode, 'affected');
  assert.deepEqual(affectedVue.specs, [
    'components/kv-list/__test__/drag-lifecycle.cy.ts',
    'components/kv-list/__test__/index.cy.ts',
    'components/table/__test__/drag-sort.cy.ts',
    'components/table/__test__/review-boundaries.cy.ts',
    'components/tree/__test__/drag-sort.cy.ts',
    'components/tree/__test__/index.cy.ts',
  ]);
  const affectedReact = selectReactSpecs(graph, changedFiles, root);
  assert.deepEqual(
    affectedReact.specs,
    ['table-docs', 'table-drag', 'tree-drag', 'tree-events', 'tree-virtual'].map(
      (name) => reactRoot + `tests/browser/${name}.cy.ts`,
    ),
  );
  const presets = ['packages/web-core/tests/fixtures/input-mask-presets.ts'];
  assert.deepEqual(
    selectAffectedSpecs({
      changedFiles: presets,
      componentDependencies: new Map(),
      componentSpecs,
      browserReverse: graph.reverse,
    }).specs,
    ['components/input-mask/__test__/preset-lifecycle.cy.ts'],
  );
  assert.deepEqual(selectReactSpecs(graph, presets, root).specs, [
    reactRoot + 'tests/browser/input-mask.cy.ts',
  ]);
});

test('React fixture dependencies select connected specs and deleted sources fall back to full coverage', () => {
  const graph = buildBrowserDependencyGraph(tracked, root, false, true);
  assert.deepEqual(
    [...graph.docsPreviewSpecs].sort(),
    docsE2eSpecs.map((spec) => reactRoot + spec).sort(),
  );
  for (const [entry, component] of [
    ['hover-intent-main', 'hover-intent'],
    ['dropdown-fixture', 'dropdown'],
    ['drawer-fixture', 'drawer'],
    ['date-picker-root-main', 'date-picker-root'],
    ['date-picker-range-root-main', 'date-picker-root'],
    ['form-fixture', 'form'],
    ['tooltip-main', 'tooltip'],
    ['layout-fixture', 'layout'],
    ['input-number-fixture', 'input-number'],
    ['input-tag-fixture', 'input-tag'],
    ['input-mask-fixture', 'input-mask'],
    ['image-fixture', 'image'],
    ['kv-list-fixture', 'kv-list'],
    ['pagination-fixture', 'pagination'],
    ['popconfirm-fixture', 'popconfirm'],
    ['popover-fixture', 'popover'],
    ['progress-fixture', 'progress'],
    ['config-provider-main', 'config-provider'],
    ['bloom-menu-fixture', 'bloom-menu'],
    ['avatar-group-fixture', 'avatar'],
    ['cascader-data-main', 'cascader-data'],
    ['cascader-options-main', 'cascader-options'],
    ['cascader-panel-main', 'cascader-panel'],
    ['select-fixture', 'select'],
    ['select-option-tooltip-main', 'select-option-tooltip'],
    ['table-root-main', 'table-root'],
    ['tabs-fixture', 'tabs'],
    ['tag-main', 'tag'],
    ['timeline-fixture', 'timeline'],
    ['transfer-fixture', 'transfer'],
    ['affix-fixture', 'affix'],
    ['alert-fixture', 'alert'],
    ['anchor-fixture', 'anchor'],
    ['back-top-fixture', 'back-top'],
    ['border-beam-fixture', 'border-beam'],
    ['breadcrumb-fixture', 'breadcrumb'],
    ['card-fixture', 'card'],
    ['carousel-fixture', 'carousel'],
    ['calendar-root-fixture', 'calendar-view-root'],
    ['collapse-fixture', 'collapse'],
    ['descriptions-fixture', 'descriptions'],
    ['grid-fixture', 'grid'],
    ['icon-fixture', 'icon'],
    ['liquid-glass-logo-fixture', 'liquid-glass-logo'],
    ['list-fixture', 'list'],
    ['menu-fixture', 'menu'],
    ['menu-collector-fixture', 'menu'],
    ['modal-fixture', 'modal'],
    ['page-header-fixture', 'page-header'],
    ['panel-group-fixture', 'panel-group'],
    ['qr-code-fixture', 'qr-code'],
    ['result-fixture', 'result'],
    ['scrollbar-fixture', 'scrollbar'],
    ['select-view-fixture', 'select-view'],
    ['selectable-card-fixture', 'selectable-card'],
    ['skeleton-fixture', 'skeleton'],
    ['skeleton-reveal-fixture', 'skeleton-reveal'],
    ['spin-main', 'spin'],
    ['statistic-fixture', 'statistic'],
    ['tag-group-fixture', 'tag-group'],
    ['thinking-orb-fixture', 'thinking-orb'],
    ['trigger-fixture', 'trigger'],
    ['tree-select-parity-main', 'tree-select-parity'],
    ['typography-fixture', 'typography'],
    ['upload-list-main', 'upload-list'],
    ['verification-code-fixture', 'verification-code'],
    ['virtual-list-fixture', 'virtual-list'],
    ['voice-glow-fixture', 'voice-glow'],
    ['watermark-fixture', 'watermark'],
  ]) {
    const fixture = selectReactSpecs(
      graph,
      [reactRoot + `tests/browser/${entry}.tsx`, 'packages/web-core/tests/trigger.test.ts'],
      root,
    );
    assert.deepEqual(fixture.specs, [reactRoot + `tests/browser/${component}.cy.ts`]);
  }
  for (const entry of ['clamp-fixture', 'line-fixture']) {
    assert.deepEqual(
      selectReactSpecs(graph, [reactRoot + `tests/browser/${entry}.tsx`], root).specs,
      ['clamp', 'ellipsis', 'performant-ellipsis'].map(
        (component) => reactRoot + `tests/browser/${component}.cy.ts`,
      ),
    );
  }
  for (const name of ['button', 'locale']) {
    assert.deepEqual(
      selectReactSpecs(graph, [reactRoot + `tests/browser/${name}-main.tsx`], root).specs,
      [reactRoot + `tests/browser/${name}.cy.ts`],
    );
  }
  assert.deepEqual(
    selectReactSpecs(graph, [reactRoot + 'tests/browser/main.tsx'], root).specs,
    ['config-provider', 'theme-provider-lifecycle'].map(
      (component) => reactRoot + `tests/browser/${component}.cy.ts`,
    ),
  );
  assert.deepEqual(
    selectReactSpecs(graph, [reactRoot + 'tests/browser/upload-root-main.tsx'], root).specs,
    ['upload-dom', 'upload-network', 'upload-root'].map(
      (component) => reactRoot + `tests/browser/${component}.cy.ts`,
    ),
  );
  assert.deepEqual(
    selectReactSpecs(graph, [reactRoot + 'tests/browser/text-controls-fixture.tsx'], root).specs,
    ['button', 'link'].map((component) => reactRoot + `tests/browser/${component}.cy.ts`),
  );
  assert.deepEqual(
    selectReactSpecs(graph, [reactRoot + 'tests/browser/notice-fixture.tsx'], root).specs,
    ['message', 'notification'].map((component) => reactRoot + `tests/browser/${component}.cy.ts`),
  );
  assert.deepEqual(
    selectReactSpecs(graph, [reactRoot + 'tests/browser/wrap-fixture.tsx'], root).specs,
    ['virtual-list', 'wrap'].map((component) => reactRoot + `tests/browser/${component}.cy.ts`),
  );
  assert.deepEqual(
    selectReactSpecs(graph, [reactRoot + 'tests/browser/steps-fixture.tsx'], root).specs,
    ['steps-icon', 'steps'].map((component) => reactRoot + `tests/browser/${component}.cy.ts`),
  );
  assert.deepEqual(
    selectReactSpecs(graph, ['packages/web-core/tests/browser/scroll-outside.ts'], root).specs,
    ['liquid-glass-logo', 'thinking-orb'].map(
      (component) => reactRoot + `tests/browser/${component}.cy.ts`,
    ),
  );
  const fallback = selectReactSpecs(graph, [reactRoot + 'src/removed.ts'], root);
  assert.deepEqual(fallback.specs, graph.specs);
  const sharedSnapshot = selectReactSpecs(
    graph,
    ['packages/web-core/tests/fixtures/markdown-pre-diff-vue.json'],
    root,
  );
  assert.deepEqual(sharedSnapshot.specs, [reactRoot + 'tests/browser/markdown-pre-diff.cy.ts']);

  const formControls = [
    'auto-complete',
    'checkbox',
    'mention',
    'radio',
    'rate',
    'slider',
    'textarea',
  ].map((name) => reactRoot + `tests/browser/${name}.cy.ts`);
  const controls = selectReactSpecs(
    graph,
    [reactRoot + 'tests/browser/form-controls-main.tsx'],
    root,
  );
  assert.deepEqual([...controls.specs].sort(), formControls);
  const form = selectReactSpecs(graph, [reactRoot + 'src/form/form.tsx'], root);
  const autoComplete = selectReactSpecs(graph, [reactRoot + 'src/auto-complete/index.tsx'], root);
  for (const name of ['affix', 'anchor', 'button']) {
    const spec = reactRoot + `tests/browser/${name}.cy.ts`;
    assert.ok(!form.specs.includes(spec), name);
    assert.ok(!autoComplete.specs.includes(spec), name);
  }
  for (const spec of [
    ...formControls,
    reactRoot + 'tests/browser/form.cy.ts',
    reactRoot + 'tests/browser/verification-code.cy.ts',
  ]) {
    assert.ok(form.specs.includes(spec), spec);
  }
  assert.ok(autoComplete.specs.includes(reactRoot + 'tests/browser/kv-list.cy.ts'));

  const renderer = selectReactSpecs(graph, [reactRoot + 'src/markdown-render/renderer.tsx'], root);
  for (const spec of ['markdown-root', 'markdown-docs', 'docs-scenarios', 'cascader-entry']) {
    assert.ok(renderer.specs.includes(reactRoot + `tests/browser/${spec}.cy.ts`), spec);
  }
  for (const spec of ['affix', 'alert', 'button', 'hover-intent', 'tree-select-parity']) {
    assert.ok(!renderer.specs.includes(reactRoot + `tests/browser/${spec}.cy.ts`), spec);
  }
  assert.deepEqual(renderer.docsPages, ['components/markdown-render']);
  const treeSelect = selectReactSpecs(
    graph,
    [reactRoot + 'tests/browser/tree-select-root-main.tsx'],
    root,
  );
  assert.deepEqual(
    treeSelect.specs,
    ['alias', 'custom', 'root'].map(
      (name) => reactRoot + `tests/browser/tree-select-${name}.cy.ts`,
    ),
  );
  const tree = selectReactSpecs(graph, [reactRoot + 'tests/browser/tree-root-main.tsx'], root);
  assert.deepEqual(
    tree.specs,
    ['api', 'events', 'root', 'transition', 'virtual'].map(
      (name) => reactRoot + `tests/browser/tree-${name}.cy.ts`,
    ),
  );
});
