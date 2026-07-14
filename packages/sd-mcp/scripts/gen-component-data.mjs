import fg from 'fast-glob';
// Generates data/components.json for the sd-design MCP server.
//
// Component API (props / events / slots, bilingual zh/en) is extracted with
// `vue-docgen-api`, mirroring the resolution + extraction logic of
// packages/web-vue/scripts/gen-web-types.mjs. Categories, titles and
// descriptions come from the docs site (sidebar + MDX frontmatter), so the
// MCP documents exactly what sd-design.js.org documents.
//
// Re-run with: pnpm --filter @sdata/web-vue-mcp run gen
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseComponent } from 'vue-docgen-api';

import { slotTagHandler } from '../../web-vue/scripts/utils/slot-tag-handler.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const WEB_VUE = path.join(ROOT, 'web-vue');
const DOCS = path.join(ROOT, 'sd-vue-docs');
const SITE_URL = 'https://sd-design.js.org';

// --- case + tag helpers (mirror web-vue/scripts/utils/convert-case.mjs) ---
const toKebabCase = (value) =>
  value.replace(/[A-Z]+/g, (match, offset) => `${offset > 0 ? '-' : ''}${match.toLowerCase()}`);

const toPascalCase = (value) =>
  value
    .replace(/^./, (match) => match.toUpperCase())
    .replace(/-(.)/g, (_, letter) => letter.toUpperCase());

const isLanguageTag = (title) => ['zh', 'en'].includes(title);

const resolveTagName = (displayName) => {
  const normalizedName = displayName.includes('-') ? displayName : toKebabCase(displayName);

  return normalizedName.startsWith('sd-') ? normalizedName : `sd-${normalizedName}`;
};

// --- component source resolution (mirror gen-web-types.mjs) ---
const resolveExistingPath = async (basePath) => {
  const candidates = [basePath, `${basePath}.ts`, `${basePath}.tsx`, `${basePath}.vue`];

  for (const candidate of candidates) {
    try {
      await readFile(candidate);
      return candidate;
    } catch {
      // Try the next supported source extension.
    }
  }

  throw new Error(`Unable to resolve component source from index import: ${basePath}`);
};

const getComponentSources = async () => {
  const indexes = (
    await fg('components/*/index.{ts,tsx}', {
      cwd: WEB_VUE,
      ignore: ['components/locale/index.ts'],
    })
  ).sort((left, right) => left.localeCompare(right));
  const sources = [];
  const seen = new Set();

  for (const item of indexes) {
    const dirname = path.dirname(item);
    const source = await readFile(path.join(WEB_VUE, item), 'utf8');
    const matches = Array.from(
      source.matchAll(/import\s+(_[A-Za-z0-9_$]+)\s+from\s+['"](\.[^'"]+)['"]/g),
    );

    for (const match of matches) {
      const importPath = match[2];
      if (!importPath) {
        continue;
      }

      const resolvedPath = await resolveExistingPath(path.resolve(WEB_VUE, dirname, importPath));
      if (!seen.has(resolvedPath)) {
        seen.add(resolvedPath);
        sources.push(resolvedPath);
      }
    }
  }

  return sources;
};

// --- API extraction (mirror gen-web-types.mjs resolveComponent) ---
// vue-docgen-api stores @zh/@en text inconsistently across descriptor kinds:
// prop tags live under an object whose values are tag arrays (text in `.description`),
// event tags are a flat array (text in `.content`), slot tags use the object form but
// put text in `.content`. Mirror gen-web-types exactly so output stays in sync.
const extractDescription = (tagList, field) =>
  tagList.reduce(
    (accumulator, tag) => {
      if (isLanguageTag(tag.title)) {
        accumulator[tag.title] = tag[field];
      }

      return accumulator;
    },
    { zh: '', en: '' },
  );

const objectTags = (descriptor) => Object.values(descriptor.tags ?? {}).flat();

const resolveComponent = (doc) => ({
  name: resolveTagName(doc.displayName),
  props:
    doc.props
      ?.map((descriptor) => ({
        name: toKebabCase(descriptor.name),
        type: descriptor.type?.name ?? '',
        default: descriptor.defaultValue?.value ?? descriptor.defaultValue ?? '',
        description: extractDescription(objectTags(descriptor), 'description'),
      }))
      .filter((item) => Boolean(item.description.en)) ?? [],
  events:
    doc.events
      ?.map((descriptor) => ({
        name: toKebabCase(descriptor.name),
        description: extractDescription(descriptor.tags ?? [], 'content'),
      }))
      .filter((item) => Boolean(item.description.en) && !item.name.startsWith('update:')) ?? [],
  slots:
    doc.slots
      ?.map((descriptor) => ({
        name: toKebabCase(descriptor.name),
        description: extractDescription(objectTags(descriptor), 'content'),
      }))
      .filter((item) => Boolean(item.description.en)) ?? [],
});

// --- docs sidebar (categories + bilingual labels) ---
const loadSidebar = async () => {
  const raw = await readFile(path.join(DOCS, 'src/generated/docs-sidebar.ts'), 'utf8');
  const literal = raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1);
  const jsonable = literal
    .replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)/g, '$1"$2"$3')
    .replace(/'/g, '"')
    .replace(/,(\s*[}\]])/g, '$1');

  return JSON.parse(jsonable);
};

const collectSidebarComponents = (sidebar) => {
  const out = [];
  const componentGroup = sidebar.find((group) => group.label === '组件文档');
  if (!componentGroup) {
    return out;
  }

  for (const category of componentGroup.items ?? []) {
    if (!category.items) {
      continue;
    }

    for (const item of category.items ?? []) {
      if (typeof item.slug !== 'string' || !item.slug.startsWith('components/')) {
        continue;
      }

      out.push({
        name: item.slug.slice('components/'.length),
        label: item.label,
        category: category.label,
      });
    }
  }

  return out;
};

// --- MDX frontmatter (title + description) ---
const readFrontmatter = async (name) => {
  try {
    const text = await readFile(
      path.join(DOCS, 'src/content/docs/components', name, 'index.mdx'),
      'utf8',
    );
    const match = text.match(/^---\n([\s\S]*?)\n---/u);
    if (!match) {
      return {};
    }

    const frontmatter = {};

    for (const line of match[1].split(/\r?\n/u)) {
      const entry = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/u);

      if (entry) {
        frontmatter[entry[1]] = entry[2].replace(/^['"]|['"]$/g, '').trim();
      }
    }

    return frontmatter;
  } catch {
    return {};
  }
};

const buildApiMap = async () => {
  const sources = await getComponentSources();
  const map = new Map();

  for (const source of sources) {
    try {
      const doc = resolveComponent(
        await parseComponent(source, { addScriptHandlers: [slotTagHandler] }),
      );
      if (doc.name) {
        map.set(doc.name, doc);
      }
    } catch (error) {
      console.warn(`[docgen] skip ${path.relative(WEB_VUE, source)}: ${error.message}`);
    }
  }

  return map;
};

const main = async () => {
  const sidebar = await loadSidebar();
  const list = collectSidebarComponents(sidebar);
  const webPkg = JSON.parse(await readFile(path.join(WEB_VUE, 'package.json'), 'utf8'));
  const apiMap = await buildApiMap();

  const components = [];
  let missingApi = 0;

  for (const item of list) {
    const tag = resolveTagName(toPascalCase(item.name));
    const api = apiMap.get(tag);
    const frontmatter = await readFrontmatter(item.name);

    if (!api) {
      missingApi += 1;
    }

    components.push({
      name: tag,
      title: frontmatter.title || item.label,
      category: item.category,
      description: frontmatter.description || '',
      docUrl: `${SITE_URL}/components/${item.name}`,
      importPath: '@sdata/web-vue',
      importName: toPascalCase(item.name),
      props: api?.props ?? [],
      events: api?.events ?? [],
      slots: api?.slots ?? [],
    });
  }

  const data = {
    version: webPkg.version,
    generatedAt: new Date().toISOString(),
    library: {
      name: '@sdata/web-vue',
      framework: 'Vue 3',
      siteUrl: SITE_URL,
      compatibility: 'Vue 3.x',
    },
    categories: [...new Set(list.map((item) => item.category))],
    components,
  };

  const outDir = path.resolve(__dirname, '../data');
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'components.json'), JSON.stringify(data, null, 2));

  const propTotal = components.reduce((sum, item) => sum + item.props.length, 0);
  console.log(
    `Generated ${components.length} components (${propTotal} props, ${missingApi} without parsed API) → data/components.json`,
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
