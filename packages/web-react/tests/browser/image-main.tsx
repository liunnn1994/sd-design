import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot, hydrateRoot } from 'react-dom/client';

import { Image } from '../../src/image/index.js';
import '../../styles/image.scss';
import { ImageFixture, imageSources } from './image-fixture';

const root = document.getElementById('root')!;

if (new URLSearchParams(location.search).has('hydrate')) {
  const { renderToString } = await import('react-dom/server');
  const image = (
    <Image
      src={imageSources[0]}
      title="Hydrated caption"
      width={160}
      height={120}
      onLoad={() => {
        root.dataset.nativeLoad = 'true';
      }}
    />
  );
  root.innerHTML = renderToString(image);
  await root.querySelector('img')!.decode();
  const hydrate = document.createElement('button');
  hydrate.textContent = 'Hydrate decoded image';
  hydrate.onclick = () => {
    hydrate.remove();
    hydrateRoot(root, image, {
      onRecoverableError: (error) => {
        throw error;
      },
    });
  };
  root.before(hydrate);
} else {
  flushSync(() =>
    createRoot(root).render(
      <StrictMode>
        <ImageFixture />
      </StrictMode>,
    ),
  );
}
