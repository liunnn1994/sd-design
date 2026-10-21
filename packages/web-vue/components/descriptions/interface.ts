import type {
  DescItemData as CoreDescItemData,
  RenderData as CoreRenderData,
} from '@sdata/web-core/descriptions/types';

import { RenderFunction, VNode } from 'vue';

export interface DescData {
  /**
   * @zh 标签
   * @en Label
   */
  label: string | RenderFunction;
  /**
   * @zh 数据
   * @en Data
   */
  value: string | RenderFunction;
  /**
   * @zh 所占列数
   * @en number of columns
   * @defaultValue 1
   */
  span?: number;
}

export type { DescLayout } from '@sdata/web-core/descriptions/types';

export interface DescItemData extends CoreDescItemData {}

export interface RenderData extends CoreRenderData<DescData | VNode> {}
