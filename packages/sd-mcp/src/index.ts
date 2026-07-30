import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';

import componentsData from '../data/components.json';

interface Bilingual {
  zh: string;
  en: string;
}

interface PropDescriptor {
  name: string;
  type: string;
  default: string;
  description: Bilingual;
}

interface EventDescriptor {
  name: string;
  description: Bilingual;
}

interface SlotDescriptor {
  name: string;
  description: Bilingual;
}

interface ComponentEntry {
  name: string;
  title: string;
  category: string;
  description: string;
  docUrl: string;
  importPath: string;
  importName: string;
  props: PropDescriptor[];
  events: EventDescriptor[];
  slots: SlotDescriptor[];
}

interface ComponentsData {
  version: string;
  generatedAt: string;
  library: {
    name: string;
    framework: string;
    siteUrl: string;
    compatibility: string;
  };
  categories: string[];
  components: ComponentEntry[];
}

const data = componentsData as unknown as ComponentsData;
const components = data.components;
const library = data.library;

const PKG_NAME = '@sdata/web-vue-mcp';

// Accept "sd-button", "button", "Button", "SdButton" interchangeably.
const normalizeKey = (value: string) => value.toLowerCase().trim().replace(/^sd-/, '');

const byKey = new Map<string, ComponentEntry>();
for (const component of components) {
  byKey.set(component.name.toLowerCase(), component);
  byKey.set(normalizeKey(component.name), component);
  byKey.set(component.importName.toLowerCase(), component);
}

const findComponent = (input?: unknown): ComponentEntry | undefined => {
  if (typeof input !== 'string' || !input.trim()) {
    return undefined;
  }

  return byKey.get(normalizeKey(input));
};

const text = (value: unknown) => JSON.stringify(value, null, 2);
const result = (value: unknown) => ({
  content: [{ type: 'text' as const, text: text(value) }],
});

const notFound = (name: string) =>
  result({
    error: `Component "${name}" not found.`,
    hint: 'Call list_components to see all available components.',
  });

const summary = (component: ComponentEntry) => ({
  name: component.name,
  title: component.title,
  category: component.category,
  description: component.description,
  docUrl: component.docUrl,
  propCount: component.props.length,
  eventCount: component.events.length,
  slotCount: component.slots.length,
});

const importStatements = (component: ComponentEntry) => ({
  named: `import { ${component.importName} } from '${component.importPath}';`,
  fullInstall: [
    `import { createApp } from 'vue';`,
    `import SDVue from '${component.importPath}';`,
    `import '${component.importPath}/dist/sd.css';`,
    ``,
    `const app = createApp(App);`,
    `app.use(SDVue);`,
  ].join('\n'),
});

const search = (query: string) => {
  const needle = query.toLowerCase().trim();
  if (!needle) {
    return [];
  }

  const matches: Array<{
    component: ReturnType<typeof summary>;
    matched: string[];
  }> = [];

  for (const component of components) {
    const haystack = [
      component.name,
      component.title,
      component.description,
      ...component.props.flatMap((prop) => [
        prop.name,
        prop.description.zh,
        prop.description.en,
        prop.type,
      ]),
      ...component.events.flatMap((event) => [
        event.name,
        event.description.zh,
        event.description.en,
      ]),
      ...component.slots.flatMap((slot) => [slot.name, slot.description.zh, slot.description.en]),
    ];

    const matched = new Set<string>();
    for (const field of haystack) {
      if (typeof field === 'string' && field.toLowerCase().includes(needle)) {
        matched.add(field);
        if (matched.size >= 3) {
          break;
        }
      }
    }

    if (matched.size > 0) {
      matches.push({ component: summary(component), matched: [...matched] });
    }
  }

  return matches.slice(0, 25);
};

const findByProp = (prop: string) => {
  const needle = normalizeKey(prop);
  if (!needle) {
    return [];
  }

  const results: Array<{
    component: string;
    title: string;
    category: string;
    prop: PropDescriptor;
  }> = [];

  for (const component of components) {
    for (const descriptor of component.props) {
      const name = normalizeKey(descriptor.name);
      if (name === needle || name.includes(needle)) {
        results.push({
          component: component.name,
          title: component.title,
          category: component.category,
          prop: descriptor,
        });
      }
    }
  }

  return results;
};

const createServer = () => {
  const server = new McpServer({
    name: PKG_NAME,
    version: process.env.SD_MCP_VERSION ?? 'development',
  });

  server.registerTool(
    'list_components',
    {
      description:
        'List all SD Design components with their category, bilingual title and API size. ' +
        'Optionally filter by category. Use this first to discover what is available.',
      inputSchema: z.object({
        category: z
          .string()
          .optional()
          .describe('Optional category filter, e.g. 通用 / 布局 / 导航 / 数据展示 / 反馈 / 其他.'),
      }),
    },
    ({ category }) => {
      const normalizedCategory = category?.trim();
      const list = normalizedCategory
        ? components.filter((component) => component.category === normalizedCategory)
        : components;
      return result({
        total: list.length,
        ...(normalizedCategory ? { category: normalizedCategory } : {}),
        library: library.name,
        version: data.version,
        components: list.map(summary),
      });
    },
  );

  server.registerTool(
    'get_categories',
    {
      description: 'List all SD Design component categories with the number of components in each.',
      inputSchema: z.object({}),
    },
    () => {
      const counts = data.categories.map((category) => ({
        category,
        count: components.filter((component) => component.category === category).length,
      }));
      return result({ total: components.length, categories: counts });
    },
  );

  server.registerTool(
    'get_component',
    {
      description:
        'Get full detail for a component: description, import statements, documentation URL, ' +
        'and every documented prop, event and slot (bilingual zh/en). ' +
        'Accepts the tag (sd-button), kebab (button) or PascalCase (Button) name.',
      inputSchema: z.object({
        name: z.string().describe('Component name, e.g. "sd-button", "button" or "Button".'),
      }),
    },
    ({ name }) => {
      const component = findComponent(name);
      if (!component) {
        return notFound(name);
      }

      return result({
        ...summary(component),
        import: importStatements(component),
        props: component.props,
        events: component.events,
        slots: component.slots,
      });
    },
  );

  server.registerTool(
    'search_components',
    {
      description:
        'Search components by keyword across name, title, description and prop/event/slot text ' +
        '(both Chinese and English). Returns matching components with the fields that matched.',
      inputSchema: z.object({
        query: z.string().describe('Search keyword, e.g. "日期", "tree", "上传".'),
      }),
    },
    ({ query }) => {
      const matches = search(query);
      return result({ query, total: matches.length, matches });
    },
  );

  server.registerTool(
    'get_component_props',
    {
      description:
        'Get only the documented props for a component (name, type, default, bilingual description).',
      inputSchema: z.object({ name: z.string().describe('Component name.') }),
    },
    ({ name }) => {
      const component = findComponent(name);
      if (!component) {
        return notFound(name);
      }

      return result({ name: component.name, title: component.title, props: component.props });
    },
  );

  server.registerTool(
    'get_component_events',
    {
      description:
        'Get only the documented events for a component (name and bilingual description).',
      inputSchema: z.object({ name: z.string().describe('Component name.') }),
    },
    ({ name }) => {
      const component = findComponent(name);
      if (!component) {
        return notFound(name);
      }

      return result({ name: component.name, title: component.title, events: component.events });
    },
  );

  server.registerTool(
    'get_component_slots',
    {
      description:
        'Get only the documented slots for a component (name and bilingual description).',
      inputSchema: z.object({ name: z.string().describe('Component name.') }),
    },
    ({ name }) => {
      const component = findComponent(name);
      if (!component) {
        return notFound(name);
      }

      return result({ name: component.name, title: component.title, slots: component.slots });
    },
  );

  server.registerTool(
    'find_by_prop',
    {
      description:
        'Find components that expose a given prop. Useful for "which components have a size prop?" ' +
        'or "what can I set disabled on?".',
      inputSchema: z.object({
        prop: z.string().describe('Prop name to search for, e.g. "size", "disabled".'),
      }),
    },
    ({ prop }) => {
      const results = findByProp(prop);
      return result({ prop, total: results.length, results });
    },
  );

  return server;
};

void serveStdio(createServer);
