import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitepress';

const currentDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(currentDir, '..');
const componentsRoot = resolve(packageRoot, '..', 'web-vue', 'components');
const webVuePackagePath = resolve(packageRoot, '..', 'web-vue', 'package.json');
const webVueVersion = JSON.parse(readFileSync(webVuePackagePath, 'utf8')).version as string;

const categoryOrder = ['通用', '布局', '数据展示', '数据输入', '反馈', '导航', '其他'];

function getField(source: string, field: string) {
  const match = new RegExp(`^\\s*${field}:\\s*(.+)$`, 'm').exec(source);
  return match?.[1]?.trim() ?? '';
}

function getComponentSidebar() {
  const groups = new Map<string, Array<{ text: string; link: string }>>();
  const folders = readdirSync(componentsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  for (const folder of folders) {
    const readmePath = resolve(componentsRoot, folder, 'README.zh-CN.md');

    try {
      const content = readFileSync(readmePath, 'utf8');
      const category = getField(content, 'category') || '其他';
      const title = getField(content, 'title') || folder;
      const items = groups.get(category) ?? [];

      items.push({
        text: title,
        link: `/components/${folder}/`,
      });

      groups.set(category, items);
    } catch {
      continue;
    }
  }

  return categoryOrder
    .filter((category) => groups.has(category))
    .map((category) => ({
      text: category,
      collapsed: false,
      items: groups.get(category),
    }));
}

export default defineConfig({
  lang: 'zh-CN',
  title: 'SD Design',
  description: '内网组件文档',
  appearance: true,
  cleanUrls: true,
  lastUpdated: true,
  vite: {
    define: {
      __SD_WEB_VUE_VERSION__: JSON.stringify(webVueVersion),
    },
    optimizeDeps: {
      exclude: ['@vue/repl'],
    },
    build: {
      cssMinify: false,
    },
  },
  themeConfig: {
    nav: [
      { text: '开始使用', link: '/guide/start' },
      { text: '组件', link: '/components/button/' },
      { text: webVueVersion, link: '/' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '快速上手', link: '/guide/start' },
            { text: '定制主题', link: '/guide/theme' },
            { text: '暗黑模式', link: '/guide/dark' },
            { text: '常见问题', link: '/guide/faq' },
          ],
        },
      ],
      '/components/': getComponentSidebar(),
    },
    search: {
      provider: 'local',
    },
    outline: {
      level: [2, 3],
    },
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
  },
});
