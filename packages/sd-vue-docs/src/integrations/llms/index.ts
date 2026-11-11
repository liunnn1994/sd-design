import type { AstroIntegration } from 'astro';

import { fileURLToPath } from 'node:url';

const llmsIndexEntrypoint = fileURLToPath(new URL('./routes/llms-index.ts', import.meta.url));
const llmsFullEntrypoint = fileURLToPath(new URL('./routes/llms-full.ts', import.meta.url));
const llmsComponentEntrypoint = fileURLToPath(
  new URL('./routes/llms-component.ts', import.meta.url),
);

export function sdDocsLlmsIntegration(): AstroIntegration {
  return {
    name: 'sd-design-llms',
    hooks: {
      'astro:config:setup': ({ injectRoute }) => {
        for (const [pattern, file] of [
          ['/react/llms/llms.txt', 'react-llms-index'],
          ['/react/llms/llms-full.txt', 'react-llms-full'],
          ['/react/llms/components/[slug].md', 'react-llms-component'],
        ]) {
          injectRoute({
            entrypoint: fileURLToPath(new URL('./routes/' + file + '.ts', import.meta.url)),
            pattern,
            prerender: true,
          });
        }
        injectRoute({
          entrypoint: llmsIndexEntrypoint,
          pattern: '/llms/llms.txt',
          prerender: true,
        });
        injectRoute({
          entrypoint: llmsFullEntrypoint,
          pattern: '/llms/llms-full.txt',
          prerender: true,
        });
        injectRoute({
          entrypoint: llmsComponentEntrypoint,
          pattern: '/llms/components/[slug].md',
          prerender: true,
        });
      },
    },
  };
}
