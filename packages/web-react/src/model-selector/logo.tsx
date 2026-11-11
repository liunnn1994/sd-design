import type { ModelSelectorProvider } from '@sdata/web-core/model-selector/types';
import type { ComponentPropsWithRef } from 'react';

import { usePrefix } from '../config-provider/index.js';
import { modelSelectorLogoSources } from './logo-sources.js';

export interface ModelSelectorLogoProps extends ComponentPropsWithRef<'img'> {
  provider: ModelSelectorProvider;
}
export function ModelSelectorLogo({
  provider,
  alt,
  width = 16,
  height = 16,
  className,
  ...attrs
}: ModelSelectorLogoProps) {
  const prefix = usePrefix('model-selector-logo');
  const source = Object.hasOwn(modelSelectorLogoSources, provider)
    ? modelSelectorLogoSources[provider]
    : modelSelectorLogoSources.default;
  return (
    <img
      {...attrs}
      className={[prefix, className].filter(Boolean).join(' ')}
      src={source}
      alt={alt || `${provider} logo`}
      width={width}
      height={height}
    />
  );
}
