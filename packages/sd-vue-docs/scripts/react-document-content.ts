import type { ReactApiManifest } from './build-react-api-manifest.ts';

import {
  componentName,
  reactEventName,
  reactPropName,
  reactSlotName,
} from '../src/utils/framework-api.ts';

export interface ApiGap {
  page: string;
  component: string;
  kind: string;
  name: string;
  mapped: string;
}
interface ContentNode {
  type: string;
  value?: string;
  depth?: number;
  children?: ContentNode[];
  position?: { start: { offset: number }; end: { offset: number } };
}
interface Edit {
  start: number;
  end: number;
  text: string;
}
const text = (node: ContentNode): string => node.value ?? node.children?.map(text).join('') ?? '';
const inlineCode = (value: string) =>
  value.includes('`')
    ? `\`\` ${value.replaceAll('|', '\\|')} \`\``
    : `\`${value.replaceAll('|', '\\|')}\``;
function readableType(value: string) {
  return value.replace(/import\("react"\)\./g, 'React.').replace(/import\("[^"\n]+"\)\./g, '');
}

export function adaptReactContent(
  source: string,
  tree: ContentNode,
  page: string,
  api: ReactApiManifest,
) {
  const edits: Edit[] = [];
  const gaps: ApiGap[] = [];
  const defaultComponent = componentName(page.split('/').pop() ?? '');
  let component = defaultComponent;
  let kind: 'props' | 'events' | 'slots' | undefined;
  let inApi = false;
  function replace(node: ContentNode, value: string) {
    // Table cell positions include pipe delimiters; replace only their contents.
    const first = node.type === 'tableCell' ? node.children?.[0] : node;
    const last = node.type === 'tableCell' ? node.children?.at(-1) : node;
    if (first && last)
      edits.push({
        start: first.position!.start.offset,
        end: last.position!.end.offset,
        text: value,
      });
  }
  function walk(node: ContentNode) {
    if (node.type === 'heading') {
      const title = text(node);
      if ((node.depth ?? 6) <= 2) {
        inApi = /\bAPI\b/.test(title);
        kind = inApi ? 'props' : undefined;
        component = defaultComponent;
      }
      if (node.depth === 3) {
        kind = /属性|Props/.test(title)
          ? 'props'
          : /事件|Events|Emits/.test(title)
            ? 'events'
            : /插槽|Slots/.test(title)
              ? 'slots'
              : undefined;
        const tag = /<([\w-]+)>/.exec(title)?.[1];
        if (tag) component = componentName(tag);
        else {
          const named = /^([A-Z][A-Za-z]+)\s*(?:属性|事件|插槽|Props|Events|Slots)/.exec(
            title,
          )?.[1];
          const typeName = /^([A-Z]\w*)/.exec(title)?.[1];
          component =
            typeName && api[typeName] ? typeName : named && api[named] ? named : defaultComponent;
          if (typeName === 'Common' && defaultComponent === 'Typography')
            component = 'TypographyText';
          if (typeName && !api[typeName] && typeName !== 'Common') kind = undefined;
          if (typeName && api[typeName]) kind = 'props';
          if (title.includes('ConfigProvider') && title.includes('json-form'))
            component = 'JsonFormProviderConfig';
          if (/方法|实例/.test(title)) {
            component =
              [
                `${defaultComponent}Methods`,
                `${defaultComponent}Exposed`,
                `${defaultComponent}Instance`,
              ].find((name) => api[name]) ?? component;
            kind = 'props';
          }
        }
      }
      // Select the API using the shared label before adapting heading terminology.
      node.children?.forEach((child) => walk(child));
      return;
    }
    if (node.type === 'table' && api[component]) {
      const rows = node.children ?? [];
      const header = rows[0]?.children ?? [];
      const nameHeader = text(header[0] ?? { type: 'text' });
      const kindForTable = /插槽|Slot/.test(nameHeader)
        ? 'slots'
        : /事件|回调|Event/.test(nameHeader)
          ? 'events'
          : kind === 'props' && /参数|属性|名称|字段|Name|Prop/.test(nameHeader)
            ? 'props'
            : undefined;
      if (!kindForTable) {
        node.children?.forEach((child) => walk(child));
        return;
      }
      const typeColumn = header.findIndex(
        (cell, index) => index > 0 && /^(?:类型|参数|Type)$/.test(text(cell).trim()),
      );
      const descriptionColumn = header.findIndex((cell) =>
        /描述|说明|Description/.test(text(cell)),
      );
      const defaultColumn = header.findIndex((cell) => /默认|Default/.test(text(cell)));
      if (kindForTable === 'events' || kindForTable === 'slots') {
        if (header[0]) replace(header[0], kindForTable === 'events' ? '回调名' : '内容属性');
        if (header[typeColumn]) replace(header[typeColumn]!, '类型');
      }
      for (const row of rows.slice(1)) {
        const cells = row.children ?? [];
        if (!cells[0]) continue;
        const original = text(cells[0]);
        const name = /^[\w:.-]+/.exec(original)?.[0];
        if (!name) continue;
        const mapName = (value: string) =>
          kindForTable === 'props'
            ? reactPropName(component, value)
            : kindForTable === 'events'
              ? reactEventName(component, value)
              : reactSlotName(component, value);
        const mapped = mapName(name);
        const root = mapped.split('.')[0]!;
        let definition = api[component]![root];
        if (!definition) {
          for (const [pattern, value] of Object.entries(api[component]!)) {
            if (!pattern.startsWith('`') || !pattern.includes('${string}')) continue;
            const [prefix, suffix = ''] = pattern.slice(1, -1).split('${string}');
            if (root.startsWith(prefix!) && root.endsWith(suffix)) {
              definition = value;
              break;
            }
          }
        }
        const remainder = original
          .slice(name.length)
          .replace(/\s*\/\s*v-model|\s*\(v-model(?::[\w-]+)?\)\s*/g, ' **(受控)**')
          .replace(
            /([/、]\s*)([\w:.-]+)/g,
            (_, separator: string, value: string) => separator + inlineCode(mapName(value)),
          );
        replace(cells[0], inlineCode(mapped) + remainder);
        if (definition && cells[typeColumn]) {
          const type = mapped.includes('.')
            ? `NonNullable<React.ComponentProps<typeof ${component}>[${JSON.stringify(root)}]>[${JSON.stringify(mapped.slice(root.length + 1))}]`
            : readableType(definition);
          replace(cells[typeColumn]!, inlineCode(type));
        } else if (!definition) {
          gaps.push({ page, component, kind: kindForTable, name, mapped });
        }
        // Recurse into descriptions only; the replaced name and type must not overlap edits.
        if (cells[descriptionColumn]) walk(cells[descriptionColumn]!);
        if (cells[defaultColumn]) walk(cells[defaultColumn]!);
      }
      return;
    }
    if (node.type === 'text' && node.value) {
      const value = node.value
        .replace(/作用域插槽/g, '渲染函数')
        .replace(/插槽/g, '内容属性')
        .replace(/\bVNode(?:Child)?\b/g, 'React 节点')
        .replace(/v-model(?::[\w-]+)?/g, '受控值与更新回调');
      if (value !== node.value) replace(node, value);
      return;
    }
    if (node.type === 'code' && node.value && page.startsWith('components/')) {
      const original = source.slice(node.position!.start.offset, node.position!.end.offset);
      const value = original.replaceAll('@sdata/web-vue', '@sdata/web-react');
      if (value !== original) replace(node, value);
      return;
    }
    if (node.type === 'inlineCode' && node.value) {
      let value = node.value;
      if (value.startsWith('Sd') && api[value.slice(2)]) value = value.slice(2);
      const slot = reactSlotName(component, value);
      if (
        /^[\w-]+$/.test(value) &&
        api[component]?.[slot.split('.')[0]!] &&
        /^(?:[、，和与\s]+`[\w-]+`)*\s*(?:作用域)?插槽/.test(
          source.slice(node.position!.end.offset),
        )
      )
        value = slot;
      if (/^v-model(?::[\w-]+)?$/.test(value)) {
        const prop = value.includes(':')
          ? reactPropName(component, value.split(':')[1]!)
          : reactPropName(component, 'model-value');
        value = `${prop} / ${reactEventName(component, `update:${value.includes(':') ? value.split(':')[1] : 'model-value'}`)}`;
      } else if (/^@[\w:-]+$/.test(value)) value = reactEventName(component, value.slice(1));
      else if (/^(?:#|slot#)[\w.-]+$/.test(value))
        value = reactSlotName(component, value.replace(/^(?:#|slot#)/, ''));
      else if (/^:[\w-]+="[\s\S]*"$/.test(value)) {
        const [, name, expression] = /^:([\w-]+)="([\s\S]*)"$/.exec(value)!;
        value = `${reactPropName(component, name!)}={${expression}}`;
      } else if (/^:?[a-z][\w-]*="[\s\S]*"$/.test(value)) {
        const [, name, expression] = /^:?([\w-]+)="([\s\S]*)"$/.exec(value)!;
        value = `${reactPropName(component, name!)}=${/^(?:true|false|\d+)$/.test(expression!) ? `{${expression}}` : JSON.stringify(expression)}`;
      } else if (/^<\/?(?:sd-)?[a-z][\w-]+\s*\/?\s*>$/.test(value)) {
        value = value.replace(/([a-z][\w-]+)/, (tag: string) =>
          tag.startsWith('sd-') || api[componentName(tag)] ? componentName(tag) : tag,
        );
      } else if (
        /^[a-z]+(?:-[a-z]+)+$/.test(value) &&
        api[component]?.[reactPropName(component, value)]
      )
        value = reactPropName(component, value);
      value = value
        .replaceAll('@sdata/web-vue/es/', '@sdata/web-react/styles/')
        .replace(/\/style\/index\.js$/, '.scss')
        .replace(/@sdata\/web-vue(?=\/|$)/g, '@sdata/web-react')
        .replace(/\bVNode(?:Child)?\b/g, 'React.ReactNode');
      if (value !== node.value) replace(node, inlineCode(value));
      return;
    }
    node.children?.forEach((child) => walk(child));
  }
  walk(tree);
  for (const edit of edits.sort((a, b) => b.start - a.start))
    source = source.slice(0, edit.start) + edit.text + source.slice(edit.end);
  return { source, gaps };
}
