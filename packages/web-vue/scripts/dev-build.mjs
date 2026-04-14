import { pathToFileURL } from 'node:url';
import { build } from 'vite';

import createDevConfig from './configs/vite.dev.mjs';

export default async function devBuild() {
  console.log('Starting component build watcher...');
  const watcher = await build(createDevConfig());

  watcher.on('event', (event) => {
    if (event.code === 'START' || event.code === 'END') {
      console.log('Watching for component changes...');
      return;
    }

    if (event.code === 'BUNDLE_START') {
      console.log('Rebuilding changed files...');
      return;
    }

    if (event.code === 'BUNDLE_END') {
      console.log('Component rebuild complete.');
      return;
    }

    if (event.code === 'ERROR') {
      console.error(event.error);
    }
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await devBuild();
}
