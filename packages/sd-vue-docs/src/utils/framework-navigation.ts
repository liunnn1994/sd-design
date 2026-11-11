export type DocsFramework = 'vue' | 'react';

export function getDocsFramework(pathname: string): DocsFramework {
  return /(^|\/)react(?:\/|$)/.test(pathname) ? 'react' : 'vue';
}

export function frameworkHref(path: string, framework: DocsFramework, base = '/') {
  const prefix = `/${base.replace(/^\/+|\/+$/g, '')}`.replace(/\/$/, '');
  const boundary = path.search(/[?#]/);
  const pathname = boundary < 0 ? path : path.slice(0, boundary);
  const suffix = boundary < 0 ? '' : path.slice(boundary);
  const slug = pathname!.replace(/^\/+|\/+$/g, '').replace(/^react(?:\/|$)/, '');
  return `${prefix}/${framework === 'react' ? 'react/' : ''}${slug ? `${slug}${/\.[^/]+$/.test(slug) ? '' : '/'}` : ''}${suffix}`;
}

export function getFrameworkLinks(
  pathname: string,
  paths: ReadonlySet<string>,
  { base = '/', hash = '' }: { base?: string; hash?: string } = {},
) {
  const basePath = `/${base.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/');
  const relative = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname;
  const current = relative.replace(/^\/+|\/+$/g, '');
  const isReact = getDocsFramework(current) === 'react';
  const counterpart = isReact
    ? current.replace(/^react\/?/, '')
    : `react/${current}`.replace(/\/$/, '');
  const href = (slug: string, preserveHash: boolean) => {
    const prefix = basePath;
    return `${prefix}${slug ? `${slug}/` : ''}${preserveHash ? hash : ''}`;
  };
  const exists = paths.has(counterpart);
  return {
    isReact,
    vueHref: isReact ? href(exists ? counterpart : '', exists) : href(current, true),
    reactHref: isReact ? href(current, true) : href(exists ? counterpart : 'react', exists),
  };
}
