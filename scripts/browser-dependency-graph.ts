import type { ESTree } from 'vite-plus';

import enhancedResolve from 'enhanced-resolve';
import { DomUtils, parseDocument } from 'htmlparser2';
import { existsSync, readFileSync } from 'node:fs';
import { posix as path, relative, resolve, sep } from 'node:path';

import { imports } from '../packages/web-vue/scripts/browser-source-imports.ts';

const vue = 'packages/web-vue/';
const vueComponents = vue + 'components/';
const react = 'packages/web-react/';
const core = 'packages/web-core/';
const fixtures = react + 'tests/browser/';
const scenarios = fixtures + 'docs-scenarios.cy.ts';
const sourceRoots = [react + 'src/', react + 'styles/', core + 'src/', core + 'styles/'];
const reactGraphRoots = [...sourceRoots, fixtures, core + 'tests/browser/'];
const fixtureOrigin = 'http://fixtures.invalid';
const scriptExtensions = new Set(['.ts', '.tsx', '.js']);
const resolveModule = enhancedResolve.create.sync({
  extensions: ['.ts', '.tsx', '.vue', '.scss', '.js', '.css'],
  extensionAlias: { '.js': ['.ts', '.tsx', '.js'] },
  mainFiles: ['index', '_index'],
});

function stringParts(node: ESTree.Node | undefined): string[] {
  if (node?.type === 'Literal' && typeof node.value === 'string') return [node.value];
  if (node?.type === 'TemplateLiteral') return node.quasis.map((part) => part.value.cooked ?? '');
  if (node?.type === 'BinaryExpression' && node.operator === '+')
    return [...stringParts(node.left), ...stringParts(node.right)];
  return [];
}

function inspectSpec(file: string, source: string) {
  const routes = new Set<string>();
  const docs = new Set<string>();
  const literals = new Set<string>();
  let docsPreview = false;
  let dynamicVisit = false;
  const dependencies = imports(file, source, {
    Literal(node) {
      if (typeof node.value === 'string') literals.add(node.value);
    },
    CallExpression(node) {
      const { callee } = node;
      if (callee.type !== 'MemberExpression' || callee.object.type !== 'Identifier') return;
      const method = callee.computed
        ? stringParts(callee.property)[0]
        : callee.property.type === 'Identifier'
          ? callee.property.name
          : undefined;
      const parts = stringParts(node.arguments[0]);
      if (callee.object.name === 'Cypress' && method === 'expose' && parts[0] === 'docsOrigin')
        docsPreview = true;
      if (callee.object.name !== 'cy' || method !== 'visit') return;
      let resolved = false;
      for (const [index, part] of parts.entries()) {
        if (!part.startsWith('/') && !part.startsWith('http:') && !part.startsWith('https:'))
          continue;
        const url = URL.parse(part, fixtureOrigin);
        if (!url) continue;
        const segments = url.pathname.split('/');
        const component = segments.indexOf('components');
        if (component >= 0 && segments[component + 1]) {
          docsPreview = true;
          docs.add('components/' + segments[component + 1]);
        } else if (url.port === '5188') {
          docsPreview = true;
        } else if (index === 0 && url.origin === fixtureOrigin) {
          routes.add(url.pathname);
        } else {
          continue;
        }
        resolved = true;
      }
      if (!resolved) dynamicVisit = true;
    },
  });
  if (dependencies.includes('./docs-contract')) {
    docsPreview = true;
    for (const literal of literals) docs.add('components/' + literal);
  }
  return { dependencies, routes, docs, docsPreview, dynamicVisit };
}

export function buildBrowserDependencyGraph(
  tracked: string[],
  root: string,
  includeVue: boolean,
  includeReact: boolean,
) {
  const graphRoots = [
    ...(includeVue
      ? [vueComponents, core + 'src/', core + 'styles/', core + 'tests/browser/']
      : []),
    ...(includeReact ? reactGraphRoots : []),
  ];
  const specs = tracked.filter((file) => path.matchesGlob(file, fixtures + '*.cy.ts'));
  const files = new Set(tracked.filter((file) => graphRoots.some((root) => file.startsWith(root))));
  const fixturePages = [...files].filter((file) => path.matchesGlob(file, fixtures + '**/*.html'));
  const manifest = (
    includeReact
      ? JSON.parse(readFileSync(resolve(root, react, 'package.json'), 'utf8'))
      : { exports: {} }
  ) as {
    exports: Record<string, { import?: string } | string>;
  };
  const reverse = new Map<string, Set<string>>();
  const specDocs = new Map<string, Set<string>>();
  const docsPreviewSpecs = new Set<string>();

  function addDependency(file: string, target: string) {
    const directory = resolve(root, path.dirname(target));
    const name = path.basename(target);
    let resolved: string | false;
    try {
      resolved = resolveModule(directory, './' + name);
    } catch {
      if (!file.endsWith('.scss') && !file.endsWith('.vue')) return;
      try {
        resolved = resolveModule(directory, './_' + name);
      } catch {
        return;
      }
    }
    if (!resolved) return;
    const dependency = relative(root, resolved).split(sep).join('/');
    if (!files.has(dependency)) return;
    if (!reverse.has(dependency)) reverse.set(dependency, new Set());
    reverse.get(dependency)!.add(file);
  }

  for (const file of files) {
    const extension = path.extname(file);
    if (!scriptExtensions.has(extension) && !['.vue', '.scss', '.css', '.html'].includes(extension))
      continue;
    const absolute = resolve(root, file);
    if (!existsSync(absolute)) continue;
    const source = readFileSync(absolute, 'utf8');
    if (file.endsWith('.html')) {
      const document = parseDocument(source);
      for (const script of DomUtils.findAll(
        (element) => element.name === 'script' && Boolean(element.attribs.src),
        document.children,
      )) {
        const entry = URL.parse(
          script.attribs.src,
          fixtureOrigin + '/' + path.relative(fixtures, file),
        );
        if (entry?.origin === fixtureOrigin)
          addDependency(file, path.join(fixtures, entry.pathname));
      }
      continue;
    }
    const spec = specs.includes(file) ? inspectSpec(file, source) : undefined;
    const dependencies = spec?.dependencies ?? imports(file, source);
    for (const specifier of dependencies) {
      if (specifier.startsWith('.')) {
        addDependency(file, path.join(path.dirname(file), specifier));
      } else if (file.startsWith(vue) && specifier.startsWith('@components/')) {
        addDependency(file, vueComponents + specifier.slice('@components/'.length));
      } else if (file.startsWith(vue) && specifier.startsWith('@style/')) {
        addDependency(file, vueComponents + 'style/' + specifier.slice('@style/'.length));
      } else if (specifier === '@sdata/web-core' || specifier.startsWith('@sdata/web-core/')) {
        const entry = specifier.slice('@sdata/web-core/'.length);
        addDependency(
          file,
          core + (entry.startsWith('styles/') ? entry : 'src/' + (entry || 'index')),
        );
      } else if (specifier === '@sdata/web-react' || specifier.startsWith('@sdata/web-react/')) {
        const entry = specifier.slice('@sdata/web-react/'.length);
        const exported = manifest.exports[entry ? './' + entry : '.'];
        const target = typeof exported === 'object' ? exported.import : exported;
        addDependency(
          file,
          react + (target?.startsWith('./dist/') ? 'src/' + target.slice(7) : (target ?? entry)),
        );
      }
    }
    if (!spec) continue;
    for (const route of spec.routes) {
      const page = path.join(fixtures, route);
      addDependency(file, files.has(page) ? page : fixtures + 'index.html');
    }
    if (spec.docsPreview) docsPreviewSpecs.add(file);
    else if (spec.dynamicVisit) for (const page of fixturePages) addDependency(file, page);
    specDocs.set(file, spec.docs);
  }

  return { reverse, specs, specDocs, docsPreviewSpecs };
}

export function affectedBy<T>(reverse: ReadonlyMap<T, Iterable<T>>, changes: Iterable<T>) {
  const affected = new Set(changes);
  for (const item of affected) {
    for (const importer of reverse.get(item) ?? []) affected.add(importer);
  }
  return affected;
}

export function selectReactSpecs(
  graph: ReturnType<typeof buildBrowserDependencyGraph>,
  changes: string[],
  root: string,
) {
  const { reverse, specs, specDocs, docsPreviewSpecs } = graph;
  const all = () => ({ specs, docsPages: [] as string[], docsPreviewSpecs: new Set(specs) });
  const changed = changes.filter((file) => file.startsWith(react) || file.startsWith(core));
  // A removed dependency cannot be resolved against the current checkout.
  if (
    changed.some(
      (file) =>
        !existsSync(resolve(root, file)) ||
        !reactGraphRoots.some((prefix) => file.startsWith(prefix)),
    )
  )
    return all();
  const affected = affectedBy(reverse, changed);
  const components = new Set<string>();
  for (const file of affected) {
    if (!file.startsWith(react)) continue;
    const [directory, component, child] = path.relative(react, file).split('/');
    if (directory === 'src' && child) components.add(component);
    if (directory === 'styles' && !child && component.endsWith('.scss'))
      components.add(path.basename(component, '.scss'));
  }
  for (const [spec, pages] of specDocs) {
    if ([...components].some((component) => pages.has('components/' + component)))
      affected.add(spec);
  }
  const pages = JSON.parse(
    readFileSync(resolve(root, 'packages/sd-vue-docs/src/generated/docs-manifest.json'), 'utf8'),
  ) as { slug: string }[];
  const docsPages = pages
    .map(({ slug }) => slug)
    .filter((slug) => slug.startsWith('components/') && components.has(slug.slice(11)));
  if (docsPages.length > 0) affected.add(scenarios);
  const selected = specs.filter((file) => affected.has(file));
  // Fall back when a changed file has no known relationship to a browser spec.
  return selected.length
    ? { specs: selected, docsPages: changed.includes(scenarios) ? [] : docsPages, docsPreviewSpecs }
    : all();
}
