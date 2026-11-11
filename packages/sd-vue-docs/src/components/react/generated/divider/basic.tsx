import { Divider, TypographyTitle } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconImage, IconUser, IconPen } from '@sdata/web-react/icon';

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
        <Divider />
        <p>
          {
            '设计是为构建对象、系统或开展活动而制定的计划与规范，也可以指由此产生的原型、产品或流程。设计的过程就是将想法逐步转化为可用方案的过程。'
          }
        </p>
        <Divider type={'dashed'} />
        <p>
          {
            '设计是为构建对象、系统或开展活动而制定的计划与规范，也可以指由此产生的原型、产品或流程。设计的过程就是将想法逐步转化为可用方案的过程。'
          }
        </p>
        <Divider size={2} className={'sd:[border-bottom-style:dotted]'} />
        <p>
          {
            '设计是为构建对象、系统或开展活动而制定的计划与规范，也可以指由此产生的原型、产品或流程。设计的过程就是将想法逐步转化为可用方案的过程。'
          }
        </p>
      </div>
      <div
        className={
          'sd:mt-12 sd:box-border sd:w-140 sd:border-30 sd:border-solid sd:border-[rgb(var(--gray-2))] sd:p-6'
        }
      >
        <div className={'sd:flex sd:items-center sd:justify-center'}>
          <span
            className={
              'sd:flex sd:h-10 sd:w-10 sd:items-center sd:justify-center sd:mr-4 sd:rounded-[50%] sd:bg-[var(--color-fill-3)] sd:text-base sd:text-[var(--color-text-2)]'
            }
          >
            <IconImage />
          </span>
          <div className={'sd:flex-1 sd:text-xs sd:leading-5 sd:text-[var(--color-text-2)]'}>
            <TypographyTitle heading={6}>{'图片'}</TypographyTitle>
            {' 2010 年 5 月 4 日 '}
          </div>
        </div>
        <Divider className={'sd:left-[55px] sd:w-[calc(100%-55px)] sd:min-w-auto sd:my-4'} />
        <div className={'sd:flex sd:items-center sd:justify-center'}>
          <span
            className={
              'sd:flex sd:h-10 sd:w-10 sd:items-center sd:justify-center sd:mr-4 sd:rounded-[50%] sd:bg-[var(--color-fill-3)] sd:text-base sd:text-[var(--color-text-2)]'
            }
          >
            <IconUser />
          </span>
          <div className={'sd:flex-1 sd:text-xs sd:leading-5 sd:text-[var(--color-text-2)]'}>
            <TypographyTitle heading={6}>{'头像'}</TypographyTitle>
            {' 2010 年 5 月 4 日 '}
          </div>
        </div>
        <Divider className={'sd:left-[55px] sd:w-[calc(100%-55px)] sd:min-w-auto sd:my-4'} />
        <div className={'sd:flex sd:items-center sd:justify-center'}>
          <span
            className={
              'sd:flex sd:h-10 sd:w-10 sd:items-center sd:justify-center sd:mr-4 sd:rounded-[50%] sd:bg-[var(--color-fill-3)] sd:text-base sd:text-[var(--color-text-2)]'
            }
          >
            <IconPen />
          </span>
          <div className={'sd:flex-1 sd:text-xs sd:leading-5 sd:text-[var(--color-text-2)]'}>
            <TypographyTitle heading={6}>{'图标'}</TypographyTitle>
            {' 2010 年 5 月 4 日 '}
          </div>
        </div>
      </div>
    </>
  );
}
