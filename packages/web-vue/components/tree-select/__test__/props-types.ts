import type { createTreeSelectFoundation } from '@sdata/web-core/tree-select/foundation';

import type { TreeSelectProps } from '../index';

export const minimalTreeSelectProps: TreeSelectProps = { data: [{ key: 'one', title: 'One' }] };

export const numericTreeSelectRemoveKey: Parameters<
  ReturnType<typeof createTreeSelectFoundation>['remove']
>[0] = 0;
