/** @jsxImportSource react */
import { getCssVarToken } from '@sdata/web-react';
import { Breadcrumb, BreadcrumbItem, Button, PageHeader, Space, Tag } from '@sdata/web-react';
import { type CSSProperties } from 'react';

export default function Example() {
  return (
    <>
      <div
        className={'sd:p-7'}
        style={{ backgroundColor: `var(${getCssVarToken('--color-fill-2')})` } as CSSProperties}
      >
        <PageHeader
          style={{ backgroundColor: `var(${getCssVarToken('--color-bg-2')})` } as CSSProperties}
          title={'SD Design'}
          breadcrumb={
            <>
              <Breadcrumb>
                <BreadcrumbItem>{'首页'}</BreadcrumbItem>
                <BreadcrumbItem>{'渠道'}</BreadcrumbItem>
                <BreadcrumbItem>{'新闻'}</BreadcrumbItem>
              </Breadcrumb>
            </>
          }
          subtitle={
            <>
              <Space>
                <span>{'SD Design Vue'}</span>
                <Tag color={'red'} size={'small'}>
                  {'默认'}
                </Tag>
              </Space>
            </>
          }
          extra={
            <>
              <Space>
                <Button>{'取消'}</Button>
                <Button type={'primary'}>{'保存'}</Button>
              </Space>
            </>
          }
        >
          <p>{' 其他用法请参阅设计 '}</p>
          <p>
            {
              ' 设计是为构建对象、系统或开展活动而制定的计划与规范，也可以指由此产生的原型、产品或流程。设计需要满足目标与约束，综合考虑美观、功能和成本，并与使用环境相适应。建筑蓝图、工程图纸和业务流程都是常见的设计成果。 '
            }
          </p>
        </PageHeader>
      </div>
    </>
  );
}
