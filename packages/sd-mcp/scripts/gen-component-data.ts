import type { PackageJson } from 'type-fest';
interface SidebarGroup {
  label: string;
  items?: { label: string; items?: { slug?: string; label: string }[] }[];
}
import type { ComponentDoc } from 'vue-docgen-api';

import fg from 'fast-glob';
// Generates data/components.json for the sd-design MCP server.
//
// SFC API is extracted with vue-docgen-api. Existing TypeScript contracts
// supplement imported runtime props, upstream types and service APIs.
// Categories, titles and descriptions come from the docs sidebar + MDX.
//
// Re-run with: pnpm --filter @sdata/web-vue-mcp run gen
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse as parseComponent } from 'vue-docgen-api';

import type { TypeApi } from './type-api.ts';

import { extractDescription } from '../../web-vue/scripts/utils/doc-tags.ts';
import { slotTagHandler } from '../../web-vue/scripts/utils/slot-tag-handler.ts';
import { readTypeApi } from './type-api.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const WEB_VUE = path.join(ROOT, 'web-vue');
const DOCS = path.join(ROOT, 'sd-vue-docs');
const SITE_URL = 'https://sd-design.js.org';

// --- case + tag helpers (mirror web-vue/scripts/utils/convert-case.ts) ---
const toKebabCase = (value: string) =>
  value.replace(
    /[A-Z]+/g,
    (match: string, offset: number) => `${offset > 0 ? '-' : ''}${match.toLowerCase()}`,
  );

const toPascalCase = (value: string) =>
  value
    .replace(/^./, (match: string) => match.toUpperCase())
    .replace(/-(.)/g, (_: string, letter: string) => letter.toUpperCase());

const resolveTagName = (displayName: string) => {
  const normalizedName = displayName.includes('-') ? displayName : toKebabCase(displayName);

  return normalizedName.startsWith('sd-') ? normalizedName : `sd-${normalizedName}`;
};

// --- component source resolution (mirror gen-web-types.ts) ---
const resolveExistingPath = async (basePath: string) => {
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

/**
 * 每个组件目录（`components/<name>`）下它自己 index.ts 导入的源码文件。
 *
 * 必须带上所属目录：不同目录下的子组件可能共用同一个 displayName
 * （例如 menu/item.vue 与 timeline/item.vue 都叫 `item`）。只按 displayName
 * 建索引会让它们互相覆盖，因此调用方要按目录取回自己的那一份。
 */
export const getComponentSources = async () => {
  const indexes = (
    await fg('components/*/index.{ts,tsx}', {
      cwd: WEB_VUE,
      ignore: ['components/locale/index.ts'],
    })
  ).sort((left, right) => left.localeCompare(right));
  const sources: { dirname: string; file: string }[] = [];

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
      // 同目录内去重即可；跨目录的同名文件必须各自保留。
      if (!sources.some((entry) => entry.file === resolvedPath)) {
        sources.push({ dirname, file: resolvedPath });
      }
    }
  }

  return sources;
};

// --- API extraction (mirror gen-web-types.ts resolveComponent) ---
// vue-docgen-api stores @zh/@en text inconsistently across descriptor kinds:
// prop tags live under an object whose values are tag arrays (text in `.description`),
// event tags are a flat array (text in `.content`), slot tags use the object form but
// put text in `.content`. Mirror gen-web-types exactly so output stays in sync.
const resolveComponent = (doc: ComponentDoc, retainUndocumented = false) => ({
  name: resolveTagName(doc.displayName),
  props:
    doc.props
      ?.map((descriptor) => ({
        name: toKebabCase(descriptor.name),
        type: descriptor.type?.name ?? '',
        default: descriptor.defaultValue?.value ?? descriptor.defaultValue ?? '',
        description: extractDescription(descriptor.tags, 'description'),
      }))
      .filter((item) => retainUndocumented || Boolean(item.description.en)) ?? [],
  events:
    doc.events
      ?.map((descriptor) => ({
        name: toKebabCase(descriptor.name),
        description: extractDescription(descriptor.tags ?? [], 'content'),
      }))
      .filter(
        (item) =>
          retainUndocumented || (Boolean(item.description.en) && !item.name.startsWith('update:')),
      ) ?? [],
  slots:
    doc.slots
      ?.map((descriptor) => ({
        name: toKebabCase(descriptor.name),
        description: extractDescription(descriptor.tags, 'content'),
      }))
      .filter((item) => retainUndocumented || Boolean(item.description.en)) ?? [],
});

// --- docs sidebar (categories + bilingual labels) ---
const loadSidebar = async () => {
  const raw = await readFile(path.join(DOCS, 'src/generated/docs-sidebar.ts'), 'utf8');
  const literal = raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1);
  const jsonable = literal
    .replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)/g, '$1"$2"$3')
    .replace(/'/g, '"')
    .replace(/,(\s*[}\]])/g, '$1');

  return JSON.parse(jsonable) as SidebarGroup[];
};

const collectSidebarComponents = (sidebar: SidebarGroup[]) => {
  const out: { name: string; label: string; category: string }[] = [];
  const componentGroup = sidebar.find((group: SidebarGroup) => group.label === '组件文档');
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
const readFrontmatter = async (name: string) => {
  try {
    const text = await readFile(
      path.join(DOCS, 'src/content/docs/components', name, 'index.mdx'),
      'utf8',
    );
    const match = text.match(/^---\n([\s\S]*?)\n---/u);
    if (!match) {
      return {} as Record<string, string>;
    }

    const frontmatter: Record<string, string> = {};

    for (const line of match[1].split(/\r?\n/u)) {
      const entry = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/u);

      if (entry) {
        frontmatter[entry[1]] = entry[2].replace(/^['"]|['"]$/g, '').trim();
      }
    }

    return frontmatter;
  } catch {
    return {} as Record<string, string>;
  }
};

export const buildApiMap = async () => {
  const sources = await getComponentSources();
  const typeApi = await readTypeApi(WEB_VUE, sources);
  // 外层键是组件目录，内层键才是 tag：这样 `components/menu` 的 item 和
  // `components/timeline` 的 item 各自独立，不会再互相覆盖。
  type Api = ReturnType<typeof resolveComponent> &
    Partial<Pick<TypeApi, 'config' | 'methods' | 'importName'>>;
  const map = new Map<string, Map<string, Api>>();

  for (const { dirname, file } of sources) {
    let group = map.get(dirname);
    if (!group) {
      group = new Map();
      map.set(dirname, group);
    }
    try {
      const contract = [...typeApi.entries()].find(([, api]) => api.sourceFile === file);
      const doc = resolveComponent(
        await parseComponent(file, { addScriptHandlers: [slotTagHandler] }),
        Boolean(contract),
      );
      if (doc.name) group.set(doc.name, doc);
      if (contract) {
        const name = `sd-${contract[0]}`;
        group.set(name, { ...doc, name });
      }
    } catch (error) {
      // gen 挂在 typecheck 上、进而挂在 CI 上，docgen 的一次解析抖动不应卡住发版。
      // 有契约的组件同样只告警：类型契约的 props 已经写进 map，不会因此丢数据。
      console.warn(
        `[docgen] skip ${path.relative(WEB_VUE, file)}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  for (const [name, api] of typeApi) {
    const dirname = api.dirname;
    const group = map.get(dirname) ?? new Map<string, Api>();
    const tag = `sd-${name}`;
    const parsed = group.get(tag);
    const props = api.props.map((prop) => {
      const descriptor = parsed?.props.find((entry) => entry.name === prop.name);
      return {
        ...prop,
        // docgen 偶尔会吐出 `TSFunctionType` 这类内部类型种名，对调用方毫无信息量；
        // 这种情况下改用类型契约解析出的可读类型。
        type:
          descriptor?.type.trim() && !/^TS[A-Z]/.test(descriptor.type.trim())
            ? descriptor.type
            : prop.type,
        default: descriptor?.default || prop.default,
        description:
          prop.description.en || prop.description.zh
            ? prop.description
            : (descriptor?.description ?? prop.description),
      };
    });
    // The checker can only partially resolve some SFC intersections. Keep docgen fields too.
    props.push(
      ...(parsed?.props.filter((prop) => !props.some((entry) => entry.name === prop.name)) ?? []),
    );
    group.set(tag, {
      ...api,
      name: tag,
      props,
      events: parsed?.events ?? api.events,
      slots: parsed?.slots ?? api.slots,
    });
    map.set(dirname, group);
  }
  return applyDocumentedOnlyRule(map);
};

/**
 * 只要组件存在带描述的条目，就沿用「只收录有文档的 API」这一约定；
 * 一个描述都没有时才整体回退，避免 calendar / trigger / clamp 这类源码未写注释的
 * 组件重新变成空条目。对所有来源（docgen 与类型契约）统一生效。
 */
function applyDocumentedOnlyRule<K extends string, V extends { props?: unknown[] }>(
  map: Map<K, Map<string, V>>,
): Map<K, Map<string, V>> {
  for (const group of map.values()) {
    for (const [tag, api] of group) {
      const props = (api.props ?? []) as Array<{ description?: { zh?: string; en?: string } }>;
      const documented = props.filter((prop) => prop.description?.en || prop.description?.zh);
      if (documented.length && documented.length !== props.length) {
        group.set(tag, { ...api, props: documented });
      }
    }
  }
  return map;
}

const main = async () => {
  const sidebar = await loadSidebar();
  const apiMap = await buildApiMap();
  const list = collectSidebarComponents(sidebar).flatMap((item) => {
    const group = apiMap.get(`components/${item.name}`);
    const tag = resolveTagName(toPascalCase(item.name));
    if (group?.has(tag) || !group?.size)
      return [{ ...item, docName: item.name, aliases: [] as string[], variants: [] as string[] }];
    // A documentation group can represent multiple publicly exported components.
    const expanded = [...group.values()].filter((api) => api.importName);
    // 只查组名（如 clamp）时应当能看到全部变体，因此把同组名写进每个变体。
    const variants = expanded.length > 1 ? expanded.map((api) => api.name) : [];
    return expanded.map((api, index) => ({
      ...item,
      name: api.name.slice(3),
      docName: item.name,
      aliases: index === 0 ? [item.name, tag] : [],
      variants,
    }));
  });
  const webPkg: PackageJson = JSON.parse(
    await readFile(path.join(WEB_VUE, 'package.json'), 'utf8'),
  );
  const components = [];
  let missingApi = 0;
  // 解析成功但一条 API 都没留下：源码里的 props/events/slots 缺少 @en 注释，
  // 会被 resolveComponent 的过滤器全部丢掉。这类组件在产物里表现为「没有任何 props」，
  // 必须在生成时暴露出来，否则下游（MCP）会以为它本来就没有 API。
  const undocumented: string[] = [];

  for (const item of list) {
    const tag = resolveTagName(toPascalCase(item.name));
    // 只在同名组件自己的目录里找，避免跨目录的 displayName 撞车
    const api = apiMap.get(`components/${item.docName}`)?.get(tag);
    const frontmatter = await readFrontmatter(item.docName);

    if (!api) {
      missingApi += 1;
    }

    const props = api?.props ?? [];
    const events = api?.events ?? [];
    const slots = api?.slots ?? [];
    if (
      api &&
      props.length === 0 &&
      events.length === 0 &&
      slots.length === 0 &&
      !api.config?.length
    ) {
      undocumented.push(tag);
    }

    components.push({
      name: tag,
      title: frontmatter.title || item.label,
      category: item.category,
      description: frontmatter.description || '',
      docUrl: `${SITE_URL}/components/${item.docName}`,
      importPath: '@sdata/web-vue',
      importName: api?.importName ?? toPascalCase(item.name),
      props,
      events,
      slots,
      ...(api?.config ? { kind: 'service', config: api.config, methods: api.methods } : {}),
      ...(item.aliases.length ? { aliases: item.aliases } : {}),
      ...(item.variants.length ? { variants: item.variants } : {}),
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
  if (undocumented.length) {
    console.warn(
      `[docgen] ${undocumented.length} component(s) have no API left after filtering — their props/events/slots are missing @en annotations: ${undocumented.join(', ')}`,
    );
  }
};

// 仅在直接执行时生成；被测试 import 时不触发。
const isDirectRun = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
