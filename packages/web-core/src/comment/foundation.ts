export type CommentAlign =
  | 'left'
  | 'right'
  | {
      datetime?: 'left' | 'right';
      actions?: 'left' | 'right';
    };

export function resolveCommentAlign(align: CommentAlign = 'left') {
  return typeof align === 'string'
    ? { datetime: align, actions: align }
    : { datetime: align.datetime ?? 'left', actions: align.actions ?? 'left' };
}
