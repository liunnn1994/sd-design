import type { CommentAlign } from '@sdata/web-core/comment/foundation';
import type { ComponentPropsWithRef, ReactNode } from 'react';

export interface CommentProps extends Omit<ComponentPropsWithRef<'div'>, 'content'> {
  author?: ReactNode;
  avatar?: ReactNode;
  content?: ReactNode;
  datetime?: ReactNode;
  actions?: ReactNode;
  align?: CommentAlign;
}
