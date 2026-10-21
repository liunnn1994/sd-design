import type { FileItem } from '@sdata/web-core/upload/types';

import type { RenderFunction, VNode } from 'vue';
export type * from '@sdata/web-core/upload/types';

export interface CustomIcon {
  /**
   * @zh 开始图标
   * @en Start icon
   */
  startIcon?: RenderFunction;
  /**
   * @zh 取消图标
   * @en Cancel icon
   */
  cancelIcon?: RenderFunction;
  /**
   * @zh 重试图标
   * @en Retry icon
   */
  retryIcon?: RenderFunction;

  /**
   * @zh 成功图标
   * @en Success icon
   */
  successIcon?: RenderFunction;
  /**
   * @zh 失败图标
   * @en Error icon
   */
  errorIcon?: RenderFunction;
  /**
   * @zh 移除图标
   * @en Remove icon
   */
  removeIcon?: RenderFunction;
  /**
   * @zh 预览图标
   * @en Preview icon
   */
  previewIcon?: RenderFunction;
  /**
   * @zh 文件图标
   * @en File icon
   * @param {FileItem} fileItem
   */
  fileIcon?: (fileItem: FileItem) => VNode;
  /**
   * @zh 文件名
   * @en File name
   * @param {FileItem} fileItem
   */
  fileName?: (fileItem: FileItem) => string | VNode;
}
