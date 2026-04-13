declare module 'comment-parser' {
  export interface CommentTag {
    tag: string;
    name: string;
  }

  export interface CommentBlock {
    tags: CommentTag[];
  }

  export function parse(source: string): CommentBlock[];
}
