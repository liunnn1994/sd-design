import { createProcessor } from '@mdx-js/mdx';
import { execFileSync } from 'node:child_process';
import { existsSync, globSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';

import { frameworkHref, type DocsFramework } from '../src/utils/framework-navigation.ts';
import { buildReactApiManifest, type ReactApiManifest } from './build-react-api-manifest.ts';
import { adaptReactContent, type ApiGap } from './react-document-content.ts';

const processor = createProcessor({ remarkPlugins: [remarkFrontmatter, remarkGfm] });
export const docsRoot = resolve(import.meta.dirname, '..');
const workspaceRoot = resolve(docsRoot, '../..');
const oxfmt = fileURLToPath(new URL('./bin/oxfmt', import.meta.resolve('oxfmt/package.json')));
const posix = (path: string) => path.replaceAll('\\', '/');

type Node = {
  type: string;
  name?: string;
  value?: string;
  url?: string;
  depth?: number;
  attributes?: { name: string; value: string | { value: string } | null }[];
  children?: Node[];
  position?: { start: { offset: number }; end: { offset: number } };
};
export type DocumentManifest = { source: string; slug: string; demos: string[] };
type Replacement = { start: number; end: number; text: string };

export function parseDocument(source: string) {
  return processor.parse(source) as unknown as Node;
}
export function applyReplacements(source: string, replacements: Replacement[]) {
  for (const { start, end, text } of replacements.sort((a, b) => b.start - a.start)) {
    source = source.slice(0, start) + text + source.slice(end);
  }
  return source;
}
export function documentSlug(path: string) {
  return posix(path)
    .replace(/\.(md|mdx)$/, '')
    .replace(/(^|\/)index$/, '')
    .replace(/\/$/, '');
}
export function collectDemoIds(source: string): string[] {
  const ids: string[] = [];
  function visit(node: Node) {
    if (node.name === 'Demo') {
      const id = node.attributes?.find((attr) => attr.name === 'id')?.value;
      if (typeof id !== 'string' || !/^[\w-]+\/[\w-]+$/.test(id)) {
        throw new Error('Demo must specify a literal component/scenario id');
      }
      ids.push(id);
    }
    node.children?.forEach(visit);
  }
  visit(parseDocument(source));
  return ids;
}

export function renderDocument(
  source: string,
  framework: DocsFramework,
  slug: string,
  api: ReactApiManifest = {},
  gaps?: ApiGap[],
) {
  const replacements: Replacement[] = [];
  const demos = new Set<string>();
  const tree = parseDocument(source);
  function replace(node: Node, text: string) {
    replacements.push({ start: node.position!.start.offset, end: node.position!.end.offset, text });
  }
  function visit(node: Node) {
    if (node.name === 'Framework') {
      const only = node.attributes?.find((attr) => attr.name === 'only')?.value;
      if (only !== 'vue' && only !== 'react')
        throw new Error('Framework.only must be vue or react');
      if (only !== framework) {
        replace(node, '');
        return;
      }
      const start = node.position!.start.offset;
      const end = node.position!.end.offset;
      const text = source.slice(start, end);
      replacements.push({ start, end: start + text.indexOf('>') + 1, text: '' });
      replacements.push({ start: end - '</Framework>'.length, end, text: '' });
    }
    if (node.name === 'Demo') {
      const id = node.attributes?.find((attr) => attr.name === 'id')?.value;
      if (typeof id !== 'string' || !/^[\w-]+\/[\w-]+$/.test(id))
        throw new Error('Invalid Demo.id');
      demos.add(id);
      const name = `Example${id.replace(/(^|[/-])(\w)/g, (_, _prefix, letter: string) => letter.toUpperCase())}`;
      const extension = framework === 'vue' ? 'vue' : 'tsx';
      replace(
        node,
        `<DemoBlock id="${id}" framework="${framework}" source={${name}Source} mainFile="src/${id.replace('/', '-')}.${extension}">\n\n<${name} client:only="${framework}" />\n\n</DemoBlock>`,
      );
      return;
    }
    if (framework === 'react' && node.attributes) {
      for (const attribute of node.attributes) {
        if (attribute.name !== 'href' || typeof attribute.value !== 'string') continue;
        if (!/^\/(?:components|guides|mcp|llms_txt|llms)(?:\/|$)/.test(attribute.value)) continue;
        const original = source.slice(node.position!.start.offset, node.position!.end.offset);
        replace(
          node,
          original.replace(
            `href="${attribute.value}"`,
            `href="${frameworkHref(attribute.value, framework)}"`,
          ),
        );
        return;
      }
    }
    if (framework === 'react' && (node.type === 'link' || node.type === 'definition') && node.url) {
      const href = node.url;
      const knownRoute =
        /^\/(?:docs\/)?(?:components|guides|llms)(?:\/|$)|^\/(?:mcp|llms_txt)\/?$|^\/$/;
      if (knownRoute.test(href)) {
        const normalized = href.replace(/^\/docs\//, '/');
        const text = source.slice(node.position!.start.offset, node.position!.end.offset);
        const target = text.lastIndexOf(href);
        replace(
          node,
          text.slice(0, target) +
            frameworkHref(normalized, framework) +
            text.slice(target + href.length),
        );
        return;
      }
    }
    node.children?.forEach(visit);
  }
  visit(tree);
  let output = applyReplacements(source, replacements);
  const imports: string[] = [];
  if (demos.size) imports.push("import DemoBlock from '/src/components/docs/DemoBlock.astro';");
  for (const id of demos) {
    const name = `Example${id.replace(/(^|[/-])(\w)/g, (_, _prefix, letter: string) => letter.toUpperCase())}`;
    const path = `/src/components/${framework === 'vue' ? 'generated' : 'react/generated'}/${id}.${framework === 'vue' ? 'vue' : 'tsx'}`;
    imports.push(`import ${name} from '${path}';`, `import ${name}Source from '${path}?raw';`);
  }
  const frontmatter = /^---\r?\n[\s\S]*?\r?\n---/.exec(output);
  if (!frontmatter) throw new Error(`Missing frontmatter: ${slug}`);
  const boundary = frontmatter[0].length;
  output = `${output.slice(0, boundary)}\n\n{/* Generated from src/content/shared; do not edit this file. */}\n\n${imports.join('\n')}\n${output.slice(boundary)}`;
  if (framework === 'react') {
    const adapted = adaptReactContent(output, parseDocument(output), slug, api);
    output = adapted.source;
    gaps?.push(...adapted.gaps);
  }
  return `${output.trimEnd()}\n`;
}

export function generateFrameworkDocs({ root = docsRoot, check = false, validate = true } = {}) {
  const sourceRoot = resolve(root, 'src/content/shared');
  const outputRoot = resolve(root, 'src/content/docs');
  const manifest: DocumentManifest[] = [];
  const api = root === docsRoot ? buildReactApiManifest() : {};
  const apiGaps: ApiGap[] = [];
  const expected = new Map<string, string>();
  const missing: string[] = [];
  for (const sourceFile of globSync('**/*.{md,mdx}', { cwd: sourceRoot }).sort()) {
    const source = readFileSync(resolve(sourceRoot, sourceFile), 'utf8');
    const slug = documentSlug(sourceFile);
    const demos = collectDemoIds(source);
    manifest.push({ source: posix(sourceFile), slug, demos });
    for (const framework of ['vue', 'react'] as const) {
      for (const id of demos) {
        const path = resolve(
          root,
          'src/components',
          framework === 'vue' ? 'generated' : 'react/generated',
          `${id}.${framework === 'vue' ? 'vue' : 'tsx'}`,
        );
        if (!existsSync(path)) missing.push(`${framework}: ${id}`);
      }
      expected.set(
        resolve(outputRoot, framework === 'vue' ? '' : 'react', sourceFile),
        renderDocument(source, framework, slug, api, apiGaps),
      );
    }
  }
  if (!manifest.length) throw new Error('Shared documentation source is empty');
  if (validate && missing.length)
    throw new Error(`Missing ${missing.length} framework examples:\n${missing.join('\n')}`);
  if (validate && apiGaps.length) {
    throw new Error(
      `Unmapped React API entries:\n${apiGaps.map((gap) => `${gap.page}: ${gap.component}.${gap.name} → ${gap.mapped}`).join('\n')}`,
    );
  }
  const manifestPath = resolve(root, 'src/generated/docs-manifest.json');
  const formattedManifest = execFileSync(
    process.execPath,
    [oxfmt, '--config', resolve(workspaceRoot, '.oxfmtrc.jsonc'), '--stdin-filepath', manifestPath],
    { cwd: workspaceRoot, encoding: 'utf8', input: JSON.stringify(manifest, null, 2) },
  );
  expected.set(manifestPath, formattedManifest);
  const changed: string[] = [];
  for (const [file, content] of expected) {
    if (existsSync(file) && readFileSync(file, 'utf8') === content) continue;
    changed.push(posix(relative(root, file)));
    if (!check) {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, content);
    }
  }
  for (const file of globSync('**/*.{md,mdx}', { cwd: outputRoot })) {
    const absolute = resolve(outputRoot, file);
    if (expected.has(absolute)) continue;
    // Only remove our own stale outputs. Never delete an unrecognised authored page.
    if (!readFileSync(absolute, 'utf8').includes('Generated from src/content/shared;')) {
      throw new Error(`Unexpected authored output page: ${file}`);
    }
    changed.push(posix(relative(root, absolute)));
    if (!check) rmSync(absolute);
  }
  if (check && changed.length) throw new Error(`Framework docs are stale:\n${changed.join('\n')}`);
  return {
    pages: manifest.length,
    demos: new Set(manifest.flatMap((page) => page.demos)).size,
    changed,
    manifest,
    apiGaps,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const result = generateFrameworkDocs({ check: process.argv.includes('--check') });
  console.log(
    `${result.pages} shared pages × 2 frameworks; ${result.demos} example scenarios; ${result.changed.length} outputs updated.`,
  );
}
