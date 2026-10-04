import type { Plugin } from 'vite';

export default function cssjsPlugin(): Plugin {
  return {
    name: 'vite:cssjs',
    generateBundle(_outputOptions, bundle) {
      for (const filename of Object.keys(bundle)) {
        const chunk = bundle[filename];
        if (chunk.type !== 'chunk') continue;

        this.emitFile({
          type: 'asset',
          fileName: filename.replace('index.js', 'css.js'),
          source: chunk.code
            .replace(/\.scss/g, '.css')
            .replace(/\/style\/index\.js/g, '/style/css.js'),
        });
      }
    },
  };
}
