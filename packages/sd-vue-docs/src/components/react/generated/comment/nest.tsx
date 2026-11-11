import { Comment } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconHeart, IconMessage, IconStar } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Comment
        data-v-217fe73c=""
        author={'苏格拉底'}
        avatar={'https://picsum.photos/1000/1000'}
        content={'评论正文内容。'}
        datetime={'1 hour'}
        actions={
          <>
            <span data-v-217fe73c="" className={'action'}>
              <IconMessage data-v-217fe73c="" />
              {' 回复 '}
            </span>
          </>
        }
      >
        <Comment
          data-v-217fe73c=""
          author={'巴尔扎克'}
          avatar={'https://picsum.photos/1000/1000'}
          content={'评论正文内容。'}
          datetime={'1 hour'}
          actions={
            <>
              <span data-v-217fe73c="" className={'action'}>
                <IconMessage data-v-217fe73c="" />
                {' 回复 '}
              </span>
            </>
          }
        >
          <Comment
            data-v-217fe73c=""
            author={'奥斯汀'}
            avatar={'https://picsum.photos/1000/1000'}
            content={'回复内容'}
            datetime={'1 hour'}
            actions={
              <>
                <span data-v-217fe73c="" className={'action'}>
                  <IconMessage data-v-217fe73c="" />
                  {' 回复 '}
                </span>
              </>
            }
          />
          <Comment
            data-v-217fe73c=""
            author={'柏拉图'}
            avatar={'https://picsum.photos/1000/1000'}
            content={'回复内容'}
            datetime={'1 hour'}
            actions={
              <>
                <span data-v-217fe73c="" className={'action'}>
                  <IconMessage data-v-217fe73c="" />
                  {' 回复 '}
                </span>
              </>
            }
          />
        </Comment>
      </Comment>
      <style>
        {
          '\n.action[data-v-217fe73c] {\n    display: inline-block;\n    padding: 0 4px;\n    color: var(--color-text-1);\n    line-height: 24px;\n    background: transparent;\n    border-radius: 2px;\n    cursor: pointer;\n    transition: all 0.1s ease;\n}\n.action[data-v-217fe73c]:hover {\n    background: var(--color-fill-3);\n}\n'
        }
      </style>
    </>
  );
}
