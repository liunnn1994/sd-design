/** @jsxImportSource react */
import { Divider } from '@sdata/web-react';
import { IconStar } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <div
        className={
          'sd:box-border sd:w-140 sd:border-30 sd:border-solid sd:border-[rgb(var(--gray-2))] sd:p-6'
        }
      >
        <p>
          {
            '设计是为构建对象、系统或开展活动而制定的计划与规范，也可以指由此产生的原型、产品或流程。设计的过程就是将想法逐步转化为可用方案的过程。'
          }
        </p>
        <Divider orientation={'left'}>{'文本'}</Divider>
        <p>
          {
            '设计是为构建对象、系统或开展活动而制定的计划与规范，也可以指由此产生的原型、产品或流程。设计的过程就是将想法逐步转化为可用方案的过程。'
          }
        </p>
        <Divider orientation={'center'}>{'文本'}</Divider>
        <p>
          {
            '设计是为构建对象、系统或开展活动而制定的计划与规范，也可以指由此产生的原型、产品或流程。设计的过程就是将想法逐步转化为可用方案的过程。'
          }
        </p>
        <Divider orientation={'right'}>{'文本'}</Divider>
        <Divider margin={10}>
          <IconStar />
        </Divider>
      </div>
    </>
  );
}
