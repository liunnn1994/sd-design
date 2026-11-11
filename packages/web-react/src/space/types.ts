import type { SpaceState } from '@sdata/web-core/space/foundation';
import type { ComponentPropsWithRef, ReactNode } from 'react';

export interface SpaceProps extends ComponentPropsWithRef<'div'>, Partial<SpaceState> {
  wrap?: boolean;
  fill?: boolean;
  split?: ReactNode;
}
