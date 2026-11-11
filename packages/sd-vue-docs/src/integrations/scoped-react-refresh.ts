import type { Plugin } from 'vite';

import { transformWithOxc } from 'vite';

export const reactSourcePattern = /\/react\/.*\.tsx(?:\?.*)?$/;

export function scopedReactRefresh(): Plugin {
  return {
    name: 'sd-design:scoped-react-refresh',
    apply: 'serve',
    enforce: 'pre',
    config: {
      order: 'post',
      handler() {
        // Vue's TS compiler inherits global Oxc options, bypassing React's include filter.
        // Keep the shared compiler neutral; enable refresh only for React client modules.
        return { oxc: { jsx: { refresh: false } } };
      },
    },
    applyToEnvironment(environment) {
      return (
        environment.config.consumer === 'client' &&
        !environment.config.isProduction &&
        environment.config.server.hmr !== false
      );
    },
    transform: {
      filter: { id: { include: reactSourcePattern, exclude: /\/node_modules\// } },
      handler(code, id) {
        return transformWithOxc(code, id, {
          lang: 'tsx',
          jsx: {
            runtime: 'automatic',
            importSource: 'react',
            development: true,
            refresh: true,
          },
          sourcemap: true,
        });
      },
    },
  };
}
