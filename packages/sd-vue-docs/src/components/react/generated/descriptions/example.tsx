/** @jsxImportSource react */
import type { DescLayout, Size } from '@sdata/web-react';

import { Descriptions, DescriptionsItem, Form, FormItem, RadioGroup } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [form, setForm] = useState({
    size: 'medium' as Size,
    layout: 'horizontal' as DescLayout,
    column: 4,
    tableLayout: 'auto' as 'auto' | 'fixed',
    firstSpan: 2,
  });
  const layoutOptions: DescLayout[] = [
    'horizontal',
    'inline-horizontal',
    'vertical',
    'inline-vertical',
  ];
  const columnOptions = [1, 2, 3, 4, 5];
  const firstSpanOptions = [1, 2, 3, 4, 5];
  const sizeOptions: Size[] = ['mini', 'small', 'medium', 'large'];

  return (
    <>
      <Form model={form} autoLabelWidth={true}>
        <FormItem label={'尺寸'}>
          <RadioGroup
            value={form.size}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.size = next as (typeof form)['size'];
                return draft;
              })
            }
            type={'button'}
            options={sizeOptions}
          />
        </FormItem>
        <FormItem label={'布局'}>
          <RadioGroup
            value={form.layout}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.layout = next as (typeof form)['layout'];
                return draft;
              })
            }
            type={'button'}
            options={layoutOptions}
          />
        </FormItem>
        <FormItem label={'table-layout'}>
          <RadioGroup
            value={form.tableLayout}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.tableLayout = next as (typeof form)['tableLayout'];
                return draft;
              })
            }
            type={'button'}
            options={['auto', 'fixed']}
          />
        </FormItem>
        <FormItem label={'列数'}>
          <RadioGroup
            value={form.column}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.column = next as (typeof form)['column'];
                return draft;
              })
            }
            type={'button'}
            options={columnOptions}
          />
        </FormItem>
        <FormItem label={'firstSpan'}>
          <RadioGroup
            value={form.firstSpan}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.firstSpan = next as (typeof form)['firstSpan'];
                return draft;
              })
            }
            type={'button'}
            options={firstSpanOptions}
          />
        </FormItem>
      </Form>
      <div className={'sd:mt-5'}>
        <Descriptions
          title={'布局示例'}
          size={form.size}
          column={form.column}
          layout={form.layout}
          tableLayout={form.tableLayout}
          bordered={true}
        >
          <DescriptionsItem label={'项目 1'} span={form.firstSpan}>
            <div>
              {'跨列数：'}
              {formatValue(form.firstSpan)}
              {form.firstSpan > form.column ? (
                <span className={'sd:text-[red]'}>{' 超出列数时，按列数设置 '}</span>
              ) : null}
            </div>
          </DescriptionsItem>
          <DescriptionsItem label={'项目 2'} span={2}>
            {'跨列数：2'}
          </DescriptionsItem>
          <DescriptionsItem label={'项目 3'} span={3}>
            {'跨列数：3'}
          </DescriptionsItem>
          <DescriptionsItem label={'项目 4'} span={2}>
            {'跨列数：2'}
          </DescriptionsItem>
          <DescriptionsItem label={'项目 5'} span={1}>
            {'跨列数：1'}
          </DescriptionsItem>
          <DescriptionsItem label={'项目 6'} span={1}>
            {'跨列数：1'}
          </DescriptionsItem>
        </Descriptions>
      </div>
    </>
  );
}
