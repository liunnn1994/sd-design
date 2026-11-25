export interface IconBaseProps {
  size?: number | string | undefined;
  rotate?: number | undefined;
  spin?: boolean | undefined;
}

export interface IconStrokeProps extends IconBaseProps {
  strokeWidth?: number;
  strokeLinecap?: 'butt' | 'round' | 'square';
  strokeLinejoin?: 'arcs' | 'bevel' | 'miter' | 'miter-clip' | 'round';
}

export interface IconFontProps extends IconBaseProps {
  type?: string | undefined;
}

export interface IconFontOptions<Extra = Record<string, unknown>> {
  src?: string;
  extraProps?: Extra;
}

export interface IconNode {
  tag: string;
  attributes: Record<string, string>;
  children: (IconNode | string)[];
}
