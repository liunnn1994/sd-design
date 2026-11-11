/** @jsxImportSource react */
import { Ellipsis } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Ellipsis lineClamp={2} style={{ width: 'min(100%, 16rem)' }}>
        {
          ' 设计是为构建对象、系统或开展活动而制定的计划与规范，也可以指由此产生的原型、产品或流程。设计的过程就是将想法逐步转化为可用方案的过程。 '
        }
      </Ellipsis>
    </>
  );
}
