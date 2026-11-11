import type { AvatarShape, AvatarTriggerType, ObjectFit } from '@sdata/web-core/avatar/types';
import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';

export interface AvatarProps extends Omit<ComponentPropsWithRef<'div'>, 'onLoad' | 'onError'> {
  shape?: AvatarShape;
  imageUrl?: string;
  size?: number;
  autoFixFontSize?: boolean;
  triggerType?: AvatarTriggerType;
  triggerIconStyle?: CSSProperties;
  objectFit?: ObjectFit;
  triggerIcon?: ReactNode;
  error?: ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}
