import { Button, Comment, Input } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconMessage } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Comment
        data-v-e80ec83f=""
        align={'right'}
        author={'巴尔扎克'}
        avatar={'https://picsum.photos/1000/1000'}
        content={
          '设计是为构建对象、系统或开展活动而制定的计划与规范，也可以指由此产生的原型、产品或流程。设计需要满足目标与约束，综合考虑美观、功能和成本，并与使用环境相适应。建筑蓝图、工程图纸和业务流程都是常见的设计成果。'
        }
        datetime={'1 hour'}
        actions={
          <>
            <span data-v-e80ec83f="" className={'action'}>
              <IconMessage data-v-e80ec83f="" />
              {' 回复 '}
            </span>
          </>
        }
      >
        <Comment
          data-v-e80ec83f=""
          align={'right'}
          avatar={'https://picsum.photos/1000/1000'}
          actions={
            <>
              <Button data-v-e80ec83f="" key={'0'} type={'secondary'}>
                {' 取消 '}
              </Button>
              <Button data-v-e80ec83f="" key={'1'} type={'primary'}>
                {' 回复 '}
              </Button>
            </>
          }
          content={
            <>
              <Input data-v-e80ec83f="" placeholder={'这里是自定义内容。'} />
            </>
          }
        />
      </Comment>
      <style>
        {
          '\n.action[data-v-e80ec83f] {\n    display: inline-block;\n    padding: 0 4px;\n    color: var(--color-text-1);\n    line-height: 24px;\n    background: transparent;\n    border-radius: 2px;\n    cursor: pointer;\n    transition: all 0.1s ease;\n}\n.action[data-v-e80ec83f]:hover {\n    background: var(--color-fill-3);\n}\n'
        }
      </style>
    </>
  );
}
