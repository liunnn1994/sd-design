export default function externalPlugin() {
  return {
    name: 'vite:external-node_modules',
    enforce: 'pre',
    async resolveId(source, importer) {
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
