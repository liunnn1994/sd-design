import type { TagColor } from '../tag';

export type SelectableCardColor = TagColor;
export type SelectableCardVariant = 'outline' | 'soft' | 'filled';
export type SelectableCardSize = 'small' | 'medium' | 'large';
export type SelectableCardLayout = 'vertical' | 'horizontal';
export type SelectableCardAlign = 'start' | 'center';

export type SelectableCardSizeValue = number | string;

export interface SelectableCardProps {
  /** @zh 卡片的无障碍标签 @en Accessible label for the card */
  label: string;
  /** @zh 是否选中 @en Controlled selection state */
  isSelected: boolean;
  /** @zh 是否禁用 @en Whether the card is disabled */
  isDisabled?: boolean;
  /** @zh 选中颜色，与 Tag 共用内置颜色 @en Selected color shared with Tag */
  color?: SelectableCardColor;
  /** @zh 选中状态的视觉变体 @en Visual variant for the selected state */
  variant?: SelectableCardVariant;
  /** @zh 卡片尺寸 @en Card size */
  size?: SelectableCardSize;
  /** @zh 内容布局方向 @en Content layout */
  layout?: SelectableCardLayout;
  /** @zh 内容对齐方式 @en Content alignment */
  align?: SelectableCardAlign;
  /** @zh 自定义卡片内边距，数字按 4px 间距步进计算 @en Custom card padding; numbers use a 4px spacing step */
  padding?: SelectableCardSizeValue;
  /** @zh 标题，title 插槽优先 @en Title; the title slot takes precedence */
  title?: string;
  /** @zh 主要值，value 插槽优先 @en Primary value; the value slot takes precedence */
  value?: string | number;
  /** @zh 描述，description 插槽优先 @en Description; the description slot takes precedence */
  description?: string;
  /** @zh 卡片宽度 @en Card width */
  width?: SelectableCardSizeValue;
  /** @zh 卡片高度 @en Card height */
  height?: SelectableCardSizeValue;
  /** @zh 卡片最大宽度 @en Card maximum width */
  maxWidth?: SelectableCardSizeValue;
}
