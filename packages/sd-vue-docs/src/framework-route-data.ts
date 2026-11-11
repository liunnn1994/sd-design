import { defineRouteMiddleware, type StarlightRouteData } from '@astrojs/starlight/route-data';
import { statSync } from 'node:fs';
import { resolve } from 'node:path';

import manifest from './generated/docs-manifest.json';
import { frameworkHref, getDocsFramework } from './utils/framework-navigation.ts';

type SidebarEntry = StarlightRouteData['sidebar'][number];
type SidebarLink = Extract<SidebarEntry, { type: 'link' }>;

export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute;
  const framework = getDocsFramework(route.id);
  const source = manifest.find((page) => page.slug === route.id.replace(/^react\/?/, ''))?.source;
  if (source) {
    if (route.entry.data.lastUpdated !== false && !(route.entry.data.lastUpdated instanceof Date)) {
      route.lastUpdated = statSync(resolve(process.cwd(), 'src/content/shared', source)).mtime;
    }
    if (route.entry.data.editUrl !== false) {
      route.editUrl = new URL(
        `https://github.com/liunnn1994/sd-design/edit/main/packages/sd-vue-docs/src/content/shared/${source}`,
      );
    }
  }
  // Shared prose is indexed once; the search shell keeps links in the active framework.
  if (framework === 'react') route.entry.data.pagefind = false;
  const base = import.meta.env.BASE_URL;
  const current = context.url.pathname.replace(/\/$/, '');
  const links: SidebarLink[] = [];
  function map(entry: SidebarEntry): SidebarEntry {
    if (entry.type === 'link') {
      const relative = entry.href.startsWith(base) ? entry.href.slice(base.length) : entry.href;
      const href = frameworkHref(relative, framework, base);
      const link = { ...entry, href, isCurrent: href.replace(/\/$/, '') === current };
      links.push(link);
      return link;
    }
    const entries = entry.entries.map(map);
    return { ...entry, entries };
  }
  route.sidebar = route.sidebar.map(map);
  const index = links.findIndex((link) => link.isCurrent);
  if (index >= 0) {
    route.pagination = {
      prev: route.entry.data.prev === false ? undefined : links[index - 1],
      next: route.entry.data.next === false ? undefined : links[index + 1],
    };
  }
  route.siteTitleHref = frameworkHref('/', framework, base);
});
