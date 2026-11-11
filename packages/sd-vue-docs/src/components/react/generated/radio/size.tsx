/** @jsxImportSource react */
import { Radio, RadioGroup, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <RadioGroup type={'button'} size={'mini'}>
          <Radio value={'北京'}>{'北京'}</Radio>
          <Radio value={'上海'}>{'上海'}</Radio>
          <Radio value={'广州'}>{'广州'}</Radio>
          <Radio value={'深圳'}>{'深圳'}</Radio>
        </RadioGroup>
        <RadioGroup type={'button'} size={'small'}>
          <Radio value={'北京'}>{'北京'}</Radio>
          <Radio value={'上海'}>{'上海'}</Radio>
          <Radio value={'广州'}>{'广州'}</Radio>
          <Radio value={'深圳'}>{'深圳'}</Radio>
        </RadioGroup>
        <RadioGroup type={'button'}>
          <Radio value={'北京'}>{'北京'}</Radio>
          <Radio value={'上海'}>{'上海'}</Radio>
          <Radio value={'广州'}>{'广州'}</Radio>
          <Radio value={'深圳'}>{'深圳'}</Radio>
        </RadioGroup>
        <RadioGroup type={'button'} size={'large'}>
          <Radio value={'北京'}>{'北京'}</Radio>
          <Radio value={'上海'}>{'上海'}</Radio>
          <Radio value={'广州'}>{'广州'}</Radio>
          <Radio value={'深圳'}>{'深圳'}</Radio>
        </RadioGroup>
      </Space>
    </>
  );
}
