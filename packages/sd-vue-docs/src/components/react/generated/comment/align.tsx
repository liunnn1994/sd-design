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
        data-v-dc759a36=""
        author={'巴尔扎克'}
        datetime={'1 hour'}
        align={'right'}
        actions={
          <>
            <span data-v-dc759a36="" className={'action'} key={'heart'} onClick={onLikeChange}>
              {like ? (
                <span data-v-dc759a36="">
                  <IconHeartFill data-v-dc759a36="" className={'sd:text-[#f53f3f]'} />
                </span>
              ) : (
                <span data-v-dc759a36="">
                  <IconHeart data-v-dc759a36="" />
                </span>
              )}
              {formatValue(83 + (like ? 1 : 0))}
            </span>
            <span data-v-dc759a36="" className={'action'} key={'star'} onClick={onStarChange}>
              {star ? (
                <span data-v-dc759a36="">
                  <IconStarFill data-v-dc759a36="" className={'sd:text-[#ffb400]'} />
                </span>
              ) : (
                <span data-v-dc759a36="">
                  <IconStar data-v-dc759a36="" />
                </span>
              )}
              {formatValue(3 + (star ? 1 : 0))}
            </span>
            <span data-v-dc759a36="" className={'action'} key={'reply'}>
              <IconMessage data-v-dc759a36="" />
              {' 回复 '}
            </span>
          </>
        }
        avatar={
          <>
            <Avatar data-v-dc759a36="">
              <img data-v-dc759a36="" alt={'头像'} src={'https://picsum.photos/1000/1000'} />
            </Avatar>
          </>
        }
        content={
          <>
            <div data-v-dc759a36="">
              {
                ' 设计是为构建对象、系统或开展活动而制定的计划与规范，也可以指由此产生的原型、产品或流程。设计的过程就是将想法逐步转化为可用方案的过程。 '
              }
            </div>
          </>
        }
      />
      <style>
        {
          '\n.action[data-v-dc759a36] {\n    display: inline-block;\n    padding: 0 4px;\n    color: var(--color-text-1);\n    line-height: 24px;\n    background: transparent;\n    border-radius: 2px;\n    cursor: pointer;\n    transition: all 0.1s ease;\n}\n.action[data-v-dc759a36]:hover {\n    background: var(--color-fill-3);\n}\n'
        }
      </style>
    </>
  );
}
