export type DescLayout = 'horizontal' | 'vertical' | 'inline-horizontal' | 'inline-vertical';

export interface DescItemData {
  index: number;
  span: number;
}

export interface RenderData<T> extends DescItemData {
  data: T;
}
