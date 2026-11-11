import { Avatar, Comment } from '@sdata/web-react';
/** @jsxImportSource react */
import {
  IconHeart,
  IconMessage,
  IconStar,
  IconStarFill,
  IconHeartFill,
} from '@sdata/web-react/icon';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [like, setLike] = useState(false);
  const [star, setStar] = useState(false);
  function onLikeChange() {
    setLike(!like);
  }
  function onStarChange() {
    setStar(!star);
  }

  return (
    <>
      <Comment
        data-v-f85ac1c6=""
        author={'苏格拉底'}
        content={'评论正文内容。'}
        datetime={'1 hour'}
        actions={
          <>
            <span data-v-f85ac1c6="" className={'action'} key={'heart'} onClick={onLikeChange}>
              {like ? (
                <span data-v-f85ac1c6="">
                  <IconHeartFill data-v-f85ac1c6="" className={'sd:text-[#f53f3f]'} />
                </span>
              ) : (
                <span data-v-f85ac1c6="">
                  <IconHeart data-v-f85ac1c6="" />
                </span>
              )}
              {formatValue(83 + (like ? 1 : 0))}
            </span>
            <span data-v-f85ac1c6="" className={'action'} key={'star'} onClick={onStarChange}>
              {star ? (
                <span data-v-f85ac1c6="">
                  <IconStarFill data-v-f85ac1c6="" className={'sd:text-[#ffb400]'} />
                </span>
              ) : (
                <span data-v-f85ac1c6="">
                  <IconStar data-v-f85ac1c6="" />
                </span>
              )}
              {formatValue(3 + (star ? 1 : 0))}
            </span>
            <span data-v-f85ac1c6="" className={'action'} key={'reply'}>
              <IconMessage data-v-f85ac1c6="" />
              {' 回复 '}
            </span>
          </>
        }
        avatar={
          <>
            <Avatar data-v-f85ac1c6="">
              <img data-v-f85ac1c6="" alt={'头像'} src={'https://picsum.photos/1000/1000'} />
            </Avatar>
          </>
        }
      />
      <style>
        {
          '\n.action[data-v-f85ac1c6] {\n    display: inline-block;\n    padding: 0 4px;\n    color: var(--color-text-1);\n    line-height: 24px;\n    background: transparent;\n    border-radius: 2px;\n    cursor: pointer;\n    transition: all 0.1s ease;\n}\n.action[data-v-f85ac1c6]:hover {\n    background: var(--color-fill-3);\n}\n'
        }
      </style>
    </>
  );
}
