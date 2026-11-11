import type { ComponentRef as ReactComponentRef } from 'react';
import type { ReactNode } from 'react';

import { resolveCommentAlign } from '@sdata/web-core/comment/foundation';

import type { CommentProps } from './types.js';

import { usePrefix } from '../config-provider/index.js';

export type { CommentProps } from './types.js';

function hasContent(value: ReactNode) {
  return value !== null && value !== undefined && typeof value !== 'boolean' && value !== '';
}

export function Comment({
  author,
  avatar,
  content,
  datetime,
  actions,
  align,
  children,
  className,
  ...attributes
}: CommentProps) {
  const prefix = usePrefix('comment');
  const alignment = resolveCommentAlign(align);
  return (
    <div {...attributes} className={[`${prefix}`, className].filter(Boolean).join(' ')}>
      {hasContent(avatar) && (
        <div className={`${prefix}-avatar`}>
          {typeof avatar === 'string' ? <img src={avatar} alt="comment-avatar" /> : avatar}
        </div>
      )}
      <div className={`${prefix}-inner`}>
        <div className={`${prefix}-inner-content`}>
          {(hasContent(author) || hasContent(datetime)) && (
            <div className={`${prefix}-title ${prefix}-title-align-${alignment.datetime}`}>
              {hasContent(author) && (
                <span className={`${prefix}-author`}>
                  {typeof author === 'string' ? <span>{author}</span> : author}
                </span>
              )}
              {hasContent(datetime) && (
                <span className={`${prefix}-datetime`}>
                  {typeof datetime === 'string' ? <span>{datetime}</span> : datetime}
                </span>
              )}
            </div>
          )}
          {hasContent(content) && (
            <div className={`${prefix}-content`}>
              {typeof content === 'string' ? <span>{content}</span> : content}
            </div>
          )}
          {actions != null && (
            <div className={`${prefix}-actions ${prefix}-actions-align-${alignment.actions}`}>
              {actions}
            </div>
          )}
        </div>
        {children != null && <div className={`${prefix}-inner-comment`}>{children}</div>}
      </div>
    </div>
  );
}

export default Comment;

export type CommentInstance = ReactComponentRef<typeof Comment>;
