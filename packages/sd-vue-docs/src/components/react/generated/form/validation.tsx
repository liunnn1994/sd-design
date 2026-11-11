/** @jsxImportSource react */
import type { FormInstance, Size, ValidatedError } from '@sdata/web-react';

import {
  Button,
  Cascader,
  Checkbox,
  CheckboxGroup,
  DatePicker,
  Form,
  FormItem,
  Input,
  InputNumber,
  Radio,
  RadioGroup,
  Rate,
  Select,
  Slider,
  Space,
  Switch,
  TimePicker,
  TreeSelect,
} from '@sdata/web-react';
import { type ComponentRef, useRef, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const handleSubmit = ({
    values,
    errors,
  }: {
    values: Record<string, unknown>;
    errors?: Record<string, ValidatedError>;
  }) => {
    console.log('values:', values, '\nerrors:', errors);
  };
  const [form, setForm] = useState({
    size: 'medium' as Size,
    name: '',
    age: undefined,
    section: '',
    province: 'haidian',
    options: [],
    date: '',
    time: '',
    radio: '单选项一',
    slider: 5,
    score: 5,
    switch: false,
    multiSelect: ['第一区块'],
    treeSelect: '',
  });
  const options = [
    {
      value: 'beijing',
      label: '北京',
      children: [
        {
          value: 'chaoyang',
          label: '朝阳区',
          children: [
            {
              value: 'datunli',
              label: '大屯里',
            },
          ],
        },
        {
          value: 'haidian',
          label: '海淀区',
        },
        {
          value: 'dongcheng',
          label: '东城区',
        },
        {
          value: 'xicheng',
          label: '西城区',
        },
      ],
    },
    {
      value: 'shanghai',
      label: '上海',
      children: [
        {
          value: 'shanghaishi',
          label: '上海',
          children: [
            {
              value: 'huangpu',
              label: '黄浦区',
            },
          ],
        },
      ],
    },
  ];
  const treeData = [
    {
      key: 'node1',
      title: '节点 1',
      children: [
        {
          key: 'node2',
          title: '节点 2',
        },
      ],
    },
    {
      key: 'node3',
      title: '节点 3',
      children: [
        {
          key: 'node4',
          title: '节点 4',
        },
        {
          key: 'node5',
          title: '节点 5',
        },
      ],
    },
  ];
  const sectionOptions = [
    { value: '第一区块', label: '第一区块' },
    { value: '第二区块', label: '第二区块' },
    { value: '第三区块', label: '第三区块' },
  ];
  const formRef = useRef<ComponentRef<typeof Form> | null>(null);

  return (
    <>
      <Form
        ref={formRef}
        size={form.size}
        model={form}
        className={'sd:w-150'}
        onSubmit={handleSubmit}
      >
        <FormItem field={'size'} label={'表单尺寸'}>
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
          >
            <Radio value={'mini'}>{'迷你'}</Radio>
            <Radio value={'small'}>{'小'}</Radio>
            <Radio value={'medium'}>{'中'}</Radio>
            <Radio value={'large'}>{'大'}</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem
          field={'name'}
          label={'用户名'}
          rules={[
            { required: true, message: '请输入姓名' },
            { minLength: 5, message: '长度必须大于 5 个字符' },
          ]}
          validateTrigger={['change', 'input']}
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
          field={'age'}
          label={'年龄'}
          rules={[
            { required: true, message: '请输入年龄' },
            { type: 'number', max: 200, message: '年龄不能超过 200 岁' },
          ]}
        >
          <InputNumber
            value={form.age}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.age = next as (typeof form)['age'];
                return draft;
              })
            }
            placeholder={'请输入年龄…'}
          />
        </FormItem>
        <FormItem
          field={'section'}
          label={'区块'}
          rules={[{ match: /section one/, message: '请选择一项' }]}
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
            allowClear={true}
            options={sectionOptions}
          />
        </FormItem>
        <FormItem
          field={'province'}
          label={'省份'}
          rules={[{ required: true, message: '请选择省份' }]}
        >
          <Cascader
            value={form.province}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.province = next as (typeof form)['province'];
                return draft;
              })
            }
            options={options}
            placeholder={'请选择…'}
            allowClear={true}
          />
        </FormItem>
        <FormItem
          field={'options'}
          label={'选项'}
          rules={[{ type: 'array', minLength: 2, message: '请选择至少三个选项' }]}
        >
          <CheckboxGroup
            value={form.options}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.options = next as (typeof form)['options'];
                return draft;
              })
            }
          >
            <Checkbox value={'option one'}>{'第一区块'}</Checkbox>
            <Checkbox value={'option two'}>{'选项二'}</Checkbox>
            <Checkbox value={'option three'}>{'选项三'}</Checkbox>
            <Checkbox value={'option four'}>{'选项四'}</Checkbox>
          </CheckboxGroup>
        </FormItem>
        <FormItem field={'date'} label={'日期'}>
          <DatePicker
            value={form.date}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.date = next as (typeof form)['date'];
                return draft;
              })
            }
            placeholder={'请选择…'}
          />
        </FormItem>
        <FormItem field={'time'} label={'时间'}>
          <TimePicker
            value={form.time}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.time = next as (typeof form)['time'];
                return draft;
              })
            }
            placeholder={'请选择…'}
          />
        </FormItem>
        <FormItem
          field={'radio'}
          label={'单选框'}
          rules={[{ match: /one/, message: '请选择一项' }]}
        >
          <RadioGroup
            value={form.radio}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.radio = next as (typeof form)['radio'];
                return draft;
              })
            }
          >
            <Radio value={'单选项一'}>{'单选项一'}</Radio>
            <Radio value={'radio two'}>{'单选项二'}</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem
          field={'slider'}
          label={'滑动输入条'}
          rules={[{ type: 'number', min: 5, message: '滑动输入值不能小于 5' }]}
        >
          <Slider
            value={form.slider}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.slider = next as (typeof form)['slider'];
                return draft;
              })
            }
            max={10}
          />
        </FormItem>
        <FormItem field={'score'} label={'得分'}>
          <Rate
            value={form.score}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.score = next as (typeof form)['score'];
                return draft;
              })
            }
            allowClear={true}
          />
        </FormItem>
        <FormItem
          field={'switch'}
          label={'开关'}
          rules={[{ type: 'boolean', true: true, message: '必须勾选' }]}
        >
          <Switch
            value={form.switch}
            onChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.switch = next as (typeof form)['switch'];
                return draft;
              })
            }
          />
        </FormItem>
        <FormItem field={'multiSelect'} label={'多选'}>
          <Select
            value={form.multiSelect}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.multiSelect = next as (typeof form)['multiSelect'];
                return draft;
              })
            }
            placeholder={'请选择…'}
            multiple={true}
            options={sectionOptions}
          />
        </FormItem>
        <FormItem field={'treeSelect'} label={'树选择器'}>
          <TreeSelect
            data={treeData}
            value={form.treeSelect}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.treeSelect = next as (typeof form)['treeSelect'];
                return draft;
              })
            }
            placeholder={'请选择…'}
          />
        </FormItem>
        <FormItem>
          <Space>
            <Button htmlType={'submit'}>{'提交'}</Button>
            <Button
              onClick={() => {
                formRef.current?.resetFields();
              }}
            >
              {'重置'}
            </Button>
          </Space>
        </FormItem>
      </Form>
      {formatValue(form)}
    </>
  );
}
