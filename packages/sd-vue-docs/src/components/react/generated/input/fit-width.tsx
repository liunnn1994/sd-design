/** @jsxImportSource react */
import {
  AutoComplete,
  Cascader,
  DatePicker,
  Input,
  InputNumber,
  InputPassword,
  InputSearch,
  InputTag,
  JsonForm,
  Mention,
  RangePicker,
  Select,
  Textarea,
  TimePicker,
  TreeSelect,
} from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [formModel, setFormModel] = useState({ keyword: '' });
  const formSchemas = [
    {
      field: 'keyword',
      label: '配置式表单',
      type: 'input',
      componentProps: {
        fitWidth: true,
        placeholder: '按字段配置',
      },
    },
  ];
  const options = ['短选项', '宽度随当前选项变化'];

  return (
    <>
      <div data-v-edc82612="" className={'fit-width-demo'}>
        <section data-v-edc82612="">
          <h4 data-v-edc82612="">{'输入类'}</h4>
          <div data-v-edc82612="" className={'fit-width-demo-grid'}>
            <label data-v-edc82612="">{'输入框'}</label>
            <Input data-v-edc82612="" fitWidth={true} placeholder={'输入内容'} />
            <label data-v-edc82612="">{'数字输入框'}</label>
            <InputNumber data-v-edc82612="" fitWidth={true} />
            <label data-v-edc82612="">{'密码输入框'}</label>
            <InputPassword data-v-edc82612="" fitWidth={true} defaultValue={'secret'} />
            <label data-v-edc82612="">{'搜索输入框'}</label>
            <InputSearch data-v-edc82612="" fitWidth={true} placeholder={'搜索'} />
            <label data-v-edc82612="">{'标签输入框'}</label>
            <InputTag data-v-edc82612="" fitWidth={true} defaultValue={['标签']} />
            <label data-v-edc82612="">{'多行文本框'}</label>
            <Textarea data-v-edc82612="" fitWidth={true} defaultValue={'可随最长一行变化'} />
            <label data-v-edc82612="">{'自动补全'}</label>
            <AutoComplete
              data-v-edc82612=""
              fitWidth={true}
              placeholder={'自动补全'}
              data={options}
            />
            <label data-v-edc82612="">{'提及'}</label>
            <Mention
              data-v-edc82612=""
              fitWidth={true}
              placeholder={'输入 @ 提及'}
              data={options}
            />
          </div>
        </section>
        <section data-v-edc82612="">
          <h4 data-v-edc82612="">{'选择类'}</h4>
          <div data-v-edc82612="" className={'fit-width-demo-grid'}>
            <label data-v-edc82612="">{'选择框'}</label>
            <Select data-v-edc82612="" fitWidth={true} defaultValue={'短选项'} options={options} />
            <label data-v-edc82612="">{'级联选择'}</label>
            <Cascader
              data-v-edc82612=""
              fitWidth={true}
              defaultValue={'leaf'}
              options={[{ value: 'leaf', label: '级联选项' }]}
            />
            <label data-v-edc82612="">{'树选择器'}</label>
            <TreeSelect
              data-v-edc82612=""
              fitWidth={true}
              defaultValue={'leaf'}
              data={[{ key: 'leaf', title: '树选择项' }]}
            />
          </div>
        </section>
        <section data-v-edc82612="">
          <h4 data-v-edc82612="">{'日期与时间'}</h4>
          <div data-v-edc82612="" className={'fit-width-demo-grid'}>
            <label data-v-edc82612="">{'日期选择器'}</label>
            <DatePicker data-v-edc82612="" fitWidth={true} defaultValue={'2026-07-26'} />
            <label data-v-edc82612="">{'范围选择器'}</label>
            <RangePicker
              data-v-edc82612=""
              fitWidth={true}
              defaultValue={['2026-07-01', '2026-07-26']}
            />
            <label data-v-edc82612="">{'时间选择器'}</label>
            <TimePicker data-v-edc82612="" fitWidth={true} defaultValue={'12:34:56'} />
          </div>
        </section>
        <section data-v-edc82612="">
          <h4 data-v-edc82612="">{'容器限制与 JsonForm'}</h4>
          <div data-v-edc82612="" className={'fit-width-demo-limit'}>
            <Input
              data-v-edc82612=""
              fitWidth={true}
              defaultValue={'max-w-full 默认为 true，因此内容很长时不会撑破这个容器'}
            />
          </div>
          <JsonForm
            data-v-edc82612=""
            model={formModel}
            onModelChange={(next) => setFormModel(next as typeof formModel)}
            schemas={formSchemas}
            layout={'vertical'}
          />
        </section>
      </div>
      <style>
        {
          '\n.fit-width-demo {\n    display: grid;\n    gap: 20px;\n}\n.fit-width-demo h4 {\n    margin: 0 0 12px;\n}\n.fit-width-demo-grid {\n    display: grid;\n    grid-template-columns: 112px minmax(0, 1fr);\n    gap: 12px;\n    align-items: center;\n}\n.fit-width-demo-grid > label {\n    color: var(--sd-color-text-2);\n    font-size: 13px;\n}\n.fit-width-demo-limit {\n    box-sizing: border-box;\n    width: 240px;\n    margin-bottom: 16px;\n    padding: 8px;\n    border: 1px dashed var(--sd-color-border-2);\n}\n'
        }
      </style>
    </>
  );
}
