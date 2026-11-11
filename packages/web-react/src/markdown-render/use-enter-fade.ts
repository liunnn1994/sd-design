import { createMarkdownEnterFade } from '@sdata/web-core/markdown/enter-fade';
import { useLayoutEffect, useState } from 'react';

export function useMarkdownEnterFade(
  slots: ReadonlyMap<number, HTMLElement>,
  options: {
    mounted: boolean;
    enabled: boolean;
    appear: boolean;
  },
) {
  const [fade] = useState(createMarkdownEnterFade);
  useLayoutEffect(() => {
    if (options.mounted) fade.sync(slots.values(), options);
  });
  useLayoutEffect(() => () => fade.dispose(), [fade]);
}
