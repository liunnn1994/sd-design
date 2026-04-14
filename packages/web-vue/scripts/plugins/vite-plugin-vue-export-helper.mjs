const exportHelperId = 'plugin-vue:export-helper';
const helperCode = `
export default (sfc, props) => {
  for (const [key, val] of props) {
    sfc[key] = val;
  }
  return sfc;
};
`;

export default function vueExportHelperPlugin() {
  return {
    name: 'vite:vue-export-helper',
    enforce: 'pre',
    resolveId(source) {
      if (source === exportHelperId) {
        return `${exportHelperId}.js`;
      }

      return null;
    },
    load(source) {
      if (source === `${exportHelperId}.js`) {
        return helperCode;
      }

      return null;
    },
  };
}
