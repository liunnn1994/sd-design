import mdx from '@astrojs/mdx';
import starlight from '@astrojs/starlight';
import vue from '@astrojs/vue';
// @ts-check
import { defineConfig } from 'astro/config';

import { docsSidebar } from './src/generated/docs-sidebar';

const themeBridgeScript = String.raw`
(() => {
  const applyTheme = () => {
    const isDark = document.documentElement.dataset.theme === 'dark';

    if (isDark) {
      document.body.setAttribute('sd-theme', 'dark');
      return;
    }

    document.body.removeAttribute('sd-theme');
  };

  const start = () => {
    applyTheme();

    const observer = new MutationObserver(applyTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
    return;
  }

  start();
})();
`;

export default defineConfig({
  integrations: [
    starlight({
      title: 'SD Design',
      description: 'SD Design 组件文档站。',
      defaultLocale: 'root',
      locales: {
        root: {
          label: '简体中文',
          lang: 'zh-CN',
        },
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/liunnn1994/sd-design' },
      ],
      sidebar: docsSidebar,
      customCss: ['./src/styles/site.css'],
      head: [{ tag: 'script', content: themeBridgeScript }],
      lastUpdated: true,
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 3,
      },
      pagination: true,
      credits: false,
    }),
    mdx(),
    vue({ appEntrypoint: '/src/pages/_app.ts' }),
  ],
});
