import { inject } from 'vue';

import { modelSelectorInjectionKey } from './context';

export function useModelSelectorContext(componentName: string) {
  const context = inject(modelSelectorInjectionKey, undefined);

  if (!context) {
    throw new Error(`[${componentName}] 必须在 ModelSelector 内使用。`);
  }

  return context;
}
