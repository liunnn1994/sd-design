import type { Plugin } from 'vite';

export default function externalPlugin(): Plugin {
  return {
    name: 'vite:external-node_modules',
    enforce: 'pre',
    async resolveId(source, importer) {
      // Workspace symlinks resolve outside node_modules. Keep core as a real
      // package dependency rather than copying it into the Vue module output.
      if (source === '@sdata/web-core' || source.startsWith('@sdata/web-core/')) {
        return { id: source, external: true };
      }

      const result = await this.resolve(source, importer, {
        skipSelf: true,
        custom: { 'node-resolve': {} },
      });

      if (result && /node_modules/.test(result.id)) {
        return false;
      }

      return null;
    },
  };
}
