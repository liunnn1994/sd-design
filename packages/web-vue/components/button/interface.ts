import type { EllipsisTooltipProps } from '../ellipsis';
import type { TooltipProps } from '../tooltip';

import { Size, Status, BorderShape } from '../_utils/constant';
import { ButtonTypes } from './constants';

export interface ButtonProps {
  type?: ButtonTypes;
  shape?: BorderShape;
  status?: Status;
  size?: Size;
  long?: boolean;
  /** 是否开启默认内容省略，默认 true */
  ellipsis?: boolean;
  /** 默认内容省略的最大显示行数 */
  ellipsisLineClamp?: number | string;
  /** 省略内容的展开触发方式 */
  ellipsisExpandTrigger?: 'click';
  /** 省略提示配置，默认 true */
  ellipsisTooltip?: boolean | EllipsisTooltipProps;
  loading?: boolean;
  loadingFixedWidth?: boolean;
  disabled?: boolean;
  htmlType?: 'button' | 'submit' | 'reset';
  autofocus?: boolean;
  href?: string;
  /**
   * @zh 按钮的文字气泡配置。传入字符串时作为气泡内容；传入对象时可完整继承 Tooltip 的所有属性。
   * @en Tooltip configuration for the button. A string is used as the tooltip content; an object inherits all Tooltip props.
   */
  tooltip?: string | TooltipProps;
}
