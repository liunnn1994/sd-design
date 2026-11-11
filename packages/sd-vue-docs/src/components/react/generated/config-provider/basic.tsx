import {
  Button,
  ConfigProvider,
  Pagination,
  Popconfirm,
  RadioGroup,
  RangePicker,
  Space,
  TimePicker,
} from '@sdata/web-react';
/** @jsxImportSource react */
import enUS from '@sdata/web-react/locale/lang/en-us';
import zhCN from '@sdata/web-react/locale/lang/zh-cn';
import { useState } from 'react';

export default function Example() {
  const locales = {
    'zh-CN': zhCN,
    'en-US': enUS,
  };
  const [localeType, setLocaleType] = useState<keyof typeof locales>('zh-CN');
  const locale = (() => {
    return locales[localeType] || zhCN;
  })();
  const localeOptions = Object.keys(locales) as Array<keyof typeof locales>;

  return (
    <>
      <ConfigProvider locale={locale}>
        <RadioGroup
          type={'button'}
          value={localeType}
          onValueChange={(next) => setLocaleType(next as typeof localeType)}
          options={localeOptions}
        />
        <div>
          <Pagination
            total={50}
            showTotal={true}
            showJumper={true}
            showPageSize={true}
            className={'sd:mt-5 sd:mb-5'}
          />
        </div>
        <Space size={20} className={'sd:mb-5'}>
          <RangePicker className={'sd:w-75'} />
          <TimePicker type={'time-range'} className={'sd:w-75'} />
          <Popconfirm content={'确定要删除吗？'}>
            <Button type={'primary'}>{'气泡确认框'}</Button>
          </Popconfirm>
        </Space>
      </ConfigProvider>
    </>
  );
}
