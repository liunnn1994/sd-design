type DocRecord = Awaited<ReturnType<typeof createDocRecord>>;

import { readFile, readdir } from 'node:fs/promises';
import { basename, dirname, extname, relative, resolve, sep } from 'node:path';
const docsRoot = resolve(process.cwd(), 'src/content/docs');
const fallbackSiteUrl = 'https://sd-design.js.org';

function normalizeSiteUrl(siteUrl = fallbackSiteUrl) {
  return siteUrl.replace(/\/+$/, '');
}

async function walkDocs(dirPath: string): Promise<string[]> {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve(dirPath, entry.name);

      if (entry.isDirectory()) {
        return walkDocs(entryPath);
      }

      if (/\.mdx?$/i.test(entry.name)) {
        return [entryPath];
      }

      return [];
    }),
  );

  return files.flat();
}

function parseFrontmatter(fileText: string) {
  if (!fileText.startsWith('---\n')) {
    return { data: {} as Record<string, string>, body: fileText };
  }

  const endIndex = fileText.indexOf('\n---\n', 4);

  if (endIndex === -1) {
    return { data: {} as Record<string, string>, body: fileText };
  }

  const rawFrontmatter = fileText.slice(4, endIndex).trim();
  const data: Record<string, string> = {};

  for (const line of rawFrontmatter.split(/\r?\n/u)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/u);

    if (!match) {
      continue;
    }

    const [, key, value] = match;
    data[key] = value.replace(/^['"]|['"]$/g, '').trim();
  }

  return {
    data,
    body: fileText.slice(endIndex + 5),
  };
}

function stripImports(body: string) {
  return body
    .split(/\r?\n/u)
    .filter((line) => !line.trimStart().startsWith('import '))
    .join('\n');
}

function stripJsxComments(body: string) {
  return body.replace(/^\{\/\*.*?\*\/\}\s*$/gmu, '');
}

function stripStandaloneComponentTags(body: string) {
  return body.replace(/^<[A-Z][A-Za-z0-9]*(?:\s+[^>]*)?\s*\/>\s*$/gmu, '');
}

function collapseBlankLines(body: string) {
  return body.replace(/\n{3,}/g, '\n\n').trim();
}

function resolveRoute(relativeFilePath: string) {
  const normalizedPath = relativeFilePath.split(sep).join('/');
  const withoutExtension = normalizedPath.replace(/\.(md|mdx)$/i, '');

  if (withoutExtension === 'index') {
    return '';
  }

  if (withoutExtension.endsWith('/index')) {
    return withoutExtension.slice(0, -'/index'.length);
  }

  return withoutExtension;
}

async function createRawImportMap(filePath: string, fileText: string) {
  const imports = new Map<string, string>();
  const pattern = /^import\s+([A-Za-z0-9_$]+)\s+from\s+'([^']+\?raw)';$/gmu;

  for (const match of fileText.matchAll(pattern)) {
    const [, localName, importPath] = match;
    const resolvedPath = resolve(dirname(filePath), importPath.replace(/\?raw$/, ''));
    const sourceText = await readFile(resolvedPath, 'utf8');

    imports.set(localName, sourceText.trim());
  }

  return imports;
}

function formatCodeFence(mainFile: string, sourceText: string) {
  const extension = extname(mainFile).slice(1) || 'txt';

  return ['示例代码', '', `文件: ${mainFile}`, '', '```' + extension, sourceText, '```'].join('\n');
}

async function replaceDemoBlocks(filePath: string, fileText: string, body: string) {
  const rawImportMap = await createRawImportMap(filePath, fileText);

  return body.replace(
    /<DemoBlock\b[^>]*source=\{([A-Za-z0-9_$]+)\}[^>]*mainFile="([^"]+)"[^>]*>\s*[\s\S]*?<\/DemoBlock>/gmu,
    (match, sourceName, mainFile) => {
      const sourceText = rawImportMap.get(sourceName);

      if (!sourceText) {
        return match;
      }

      return formatCodeFence(mainFile, sourceText);
    },
  );
}

async function renderDocMarkdown(
  filePath: string,
  options: { siteUrl?: string; inlineDemos?: boolean } = {},
) {
  const fileText = await readFile(filePath, 'utf8');
  const { body } = parseFrontmatter(fileText);
  let markdownBody = stripStandaloneComponentTags(stripJsxComments(stripImports(body)));

  if (options.inlineDemos) {
    markdownBody = await replaceDemoBlocks(filePath, fileText, markdownBody);
  }

  return collapseBlankLines(markdownBody);
}

function createDocUrl(siteUrl: string, routePath: string) {
  return routePath ? `${siteUrl}/${routePath}/` : `${siteUrl}/`;
}

function createLlmsComponentUrl(siteUrl: string, slug: string) {
  return `${siteUrl}/llms/components/${slug}.md`;
}

async function createDocRecord(filePath: string, siteUrl: string) {
  const relativeFilePath = relative(docsRoot, filePath);
  const routePath = resolveRoute(relativeFilePath);
  const fileText = await readFile(filePath, 'utf8');
  const { data } = parseFrontmatter(fileText);
  const routeSegments = routePath.split('/').filter(Boolean);
  const isComponent = routeSegments[0] === 'components' && routeSegments.length === 2;
  const llmsSlug = isComponent ? routeSegments[1] : null;
  const markdown = await renderDocMarkdown(filePath, { inlineDemos: isComponent });

  return {
    description: data.description || '',
    filePath,
    isComponent,
    llmsSlug,
    llmsUrl: llmsSlug ? createLlmsComponentUrl(siteUrl, llmsSlug) : null,
    markdown,
    routePath,
    sourceUrl: createDocUrl(siteUrl, routePath),
    title: data.title || basename(routePath || 'index'),
  };
}

function sortDocs(left: DocRecord, right: DocRecord) {
  if (left.isComponent !== right.isComponent) {
    return left.isComponent ? 1 : -1;
  }

  return left.routePath.localeCompare(right.routePath, 'zh-CN');
}

export async function getLlmsCatalog(options: { siteUrl?: string; inlineDemos?: boolean } = {}) {
  const siteUrl = normalizeSiteUrl(options.siteUrl);
  const filePaths = await walkDocs(docsRoot);
  const docs = (await Promise.all(filePaths.map((filePath) => createDocRecord(filePath, siteUrl))))
    .filter((doc) => doc.routePath !== '404')
    .sort(sortDocs);

  return {
    components: docs.filter((doc) => doc.isComponent),
    docs,
    guides: docs.filter((doc) => !doc.isComponent && doc.routePath.startsWith('guides/')),
    overview: docs.filter(
      (doc) =>
        !doc.isComponent &&
        !doc.routePath.startsWith('guides/') &&
        !doc.routePath.startsWith('components/'),
    ),
    siteUrl,
  };
}

function formatIndexSection(title: string, docs: DocRecord[], urlKey: 'sourceUrl' | 'llmsUrl') {
  if (docs.length === 0) {
    return [];
  }

  return [
    `## ${title}`,
    '',
    ...docs.map((doc) => `- [${doc.title}](${doc[urlKey]}): ${doc.description || '无描述。'}`),
    '',
  ];
}

export async function renderLlmsIndex(options: { siteUrl?: string; inlineDemos?: boolean } = {}) {
  const catalog = await getLlmsCatalog(options);
  const lines = [
    '# SD Design Vue Docs',
    '',
    `- [llms-full.txt](${catalog.siteUrl}/llms/llms-full.txt): 聚合后的完整文档文本。`,
    '',
    ...formatIndexSection('Overview', catalog.overview, 'sourceUrl'),
    ...formatIndexSection('Guides', catalog.guides, 'sourceUrl'),
    ...formatIndexSection('Components', catalog.components, 'llmsUrl'),
  ];

  return collapseBlankLines(lines.join('\n'));
}

function renderDocSection(doc: DocRecord) {
  const lines = [`## ${doc.title}`, '', `Source: ${doc.sourceUrl}`];

  if (doc.llmsUrl) {
    lines.push(`LLM Markdown: ${doc.llmsUrl}`);
  }

  if (doc.description) {
    lines.push('', doc.description);
  }

  if (doc.markdown) {
    lines.push('', doc.markdown);
  }

  return collapseBlankLines(lines.join('\n'));
}

export async function renderLlmsFull(options: { siteUrl?: string; inlineDemos?: boolean } = {}) {
  const catalog = await getLlmsCatalog(options);
  const lines = [
    '# SD Design Vue Docs',
    '',
    `Source site: ${catalog.siteUrl}/`,
    '',
    ...catalog.docs.flatMap((doc) => [renderDocSection(doc), '', '---', '']),
  ];

  return collapseBlankLines(lines.join('\n').replace(/\n---\n?$/u, ''));
}

export async function renderComponentMarkdown(
  slug: string,
  options: { siteUrl?: string; inlineDemos?: boolean } = {},
) {
  const catalog = await getLlmsCatalog(options);
  const component = catalog.components.find((doc) => doc.llmsSlug === slug);

  if (!component) {
    return null;
  }

  const lines = [`# ${component.title}`];

  if (component.description) {
    lines.push('', component.description);
  }

  lines.push('', `Source: ${component.sourceUrl}`);

  if (component.markdown) {
    lines.push('', component.markdown);
  }

  return collapseBlankLines(lines.join('\n'));
}
