/** @jsxImportSource react */
import type { Size, ValidateStatus } from '@sdata/web-react';

import {
  DatePicker,
  Form,
  FormItem,
  Input,
  InputNumber,
  InputTag,
  Radio,
  RadioGroup,
  RangePicker,
  Select,
  Space,
  TimePicker,
} from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [status, setStatus] = useState<ValidateStatus>('success');
  const [size, setSize] = useState<Size>('medium');
  const [form, setForm] = useState({
    name: '',
    post: undefined,
    tags: ['tag1'],
    section: '',
  });
  const sectionOptions = [
    { value: '第一区块', label: '第一区块' },
    { value: '第二区块', label: '第二区块' },
    { value: '第三区块', label: '第三区块' },
  ];

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <RadioGroup
          value={status}
          onValueChange={(next) => setStatus(next as typeof status)}
          type={'button'}
        >
          <Radio value={'validating'}>{'校验中'}</Radio>
          <Radio value={'success'}>{'成功'}</Radio>
          <Radio value={'error'}>{'错误'}</Radio>
          <Radio value={'warning'}>{'警告'}</Radio>
        </RadioGroup>
        <RadioGroup
          value={size}
          onValueChange={(next) => setSize(next as typeof size)}
          type={'button'}
        >
          <Radio value={'mini'}>{'迷你'}</Radio>
          <Radio value={'small'}>{'小'}</Radio>
          <Radio value={'medium'}>{'中'}</Radio>
          <Radio value={'large'}>{'大'}</Radio>
        </RadioGroup>
      </Space>
      <Form model={form} className={'sd:w-150 sd:mt-5'} size={size}>
        <FormItem
          field={'name'}
          label={'用户名'}
          help={'这是自定义提示'}
          extra={'这是补充说明'}
          validateStatus={status}
          feedback={true}
        >
          <Input
            value={form.name}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.name = next as (typeof form)['name'];
                return draft;
              })
            }
            placeholder={'请输入用户名…'}
          />
        </FormItem>
        <FormItem
          field={'post'}
          label={'岗位'}
          help={'这是自定义提示'}
          extra={'这是补充说明'}
          validateStatus={status}
          feedback={true}
        >
          <InputNumber
            value={form.post}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.post = next as (typeof form)['post'];
                return draft;
              })
            }
            placeholder={'请输入岗位…'}
          />
        </FormItem>
        <FormItem
          field={'tags'}
          label={'标签'}
          help={'这是自定义提示'}
          extra={'这是补充说明'}
          validateStatus={status}
          feedback={true}
        >
          <InputTag
            value={form.tags}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.tags = next as (typeof form)['tags'];
                return draft;
              })
            }
            placeholder={'请输入岗位…'}
          />
        </FormItem>
        <FormItem
          field={'section'}
          label={'区块'}
          rules={[{ match: /section one/, message: '请选择一项' }]}
          validateStatus={status}
          feedback={true}
        >
          <Select
            value={form.section}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.section = next as (typeof form)['section'];
                return draft;
              })
            }
            placeholder={'请选择…'}
            options={sectionOptions}
          />
        </FormItem>
        <FormItem label={'日期范围'} validateStatus={status} feedback={true}>
          <RangePicker />
        </FormItem>
        <FormItem field={'date'} label={'日期'} validateStatus={status} feedback={true}>
          <DatePicker />
        </FormItem>
        <FormItem field={'time'} label={'时间'} validateStatus={status} feedback={true}>
          <TimePicker />
        </FormItem>
      </Form>
    </>
  );
}
