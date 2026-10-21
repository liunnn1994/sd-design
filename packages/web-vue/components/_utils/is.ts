import type { ComponentPublicInstance, VNode, VNodeNormalizedChildren } from 'vue';

import { isArray } from '@sdata/web-core/_utils/is';
export * from '@sdata/web-core/_utils/is';

export const isComponentInstance = (value: unknown): value is ComponentPublicInstance => {
  return typeof value === 'object' && value !== null && '$' in value && value.$ !== undefined;
};

export const isArrayChildren = (children: VNodeNormalizedChildren): children is VNode[] => {
  return isArray(children);
};
