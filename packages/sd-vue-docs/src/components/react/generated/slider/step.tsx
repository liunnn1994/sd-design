/** @jsxImportSource react */
import { Form, FormItem, InputNumber, Slider, Space, Switch } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [data, setData] = useState({
    step: 5,
    showTicks: true,
  });

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <Form model={data} layout={'inline'}>
          <FormItem label={'步骤'} field={'step'}>
            <InputNumber
              className={'sd:w-25'}
              value={data.step}
              onValueChange={(next) =>
                setData((previous) => {
                  const draft = structuredClone(previous);
                  draft.step = next as (typeof data)['step'];
                  return draft;
                })
              }
            />
          </FormItem>
          <FormItem label={'显示步骤'} field={'showTicks'}>
            <Switch
              value={data.showTicks}
              onChange={(next) =>
                setData((previous) => {
                  const draft = structuredClone(previous);
                  draft.showTicks = next as (typeof data)['showTicks'];
                  return draft;
                })
              }
            />
          </FormItem>
        </Form>
        <Slider
          defaultValue={20}
          className={'sd:w-75'}
          step={data.step}
          showTicks={data.showTicks}
        />
      </Space>
    </>
  );
}
