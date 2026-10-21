import type { Properties } from 'csstype';
export type AvatarShape = 'circle' | 'square';

export type AvatarTriggerType = 'button' | 'mask';

export type ObjectFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';

export interface AvatarGroupContext {
  size: number | undefined;
  shape: AvatarShape;
  autoFixFontSize: boolean;
  zIndexAscend: boolean;
  total: number;
}

export type AvatarStyle = Properties<string | number> & {
  [name: `--${string}`]: string | number | undefined;
};
