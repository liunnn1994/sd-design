import type { CSSProperties } from 'vue';

export type { PanelSize, PanelTransition, PanelSlotProps } from '@sdata/web-core/panel-group/types';

/** 折叠姿态：应用到内容元素上的样式对象。 */
export type PanelPose = CSSProperties;

/** 折叠时的内容姿态。 */
export interface PanelFold {
  /**
   * @zh 展开时的内容样式
   * @en Content style while expanded
   */
  shown?: PanelPose;
  /** @zh 折叠时的内容样式（如 opacity、transform）@en Content style while collapsed */
  hidden?: PanelPose;
}
