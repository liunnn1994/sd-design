/** @jsxImportSource react */
import { Button, DatePicker, RangePicker, Space } from '@sdata/web-react';
import { type ComponentProps, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [value, setValue] = useState<ComponentProps<typeof DatePicker>['value'] | undefined>(
    undefined,
  );
  const [rangeValue, setRangeValue] = useState<
    ComponentProps<typeof RangePicker>['value'] | undefined
  >(undefined);

  return (
    <>
      <Space>
        <div className={'sd:w-67'}>
          <DatePicker
            value={value}
            onValueChange={(next) => setValue(next as typeof value)}
            renderTrigger={({ displayValue, popupVisible }) => (
              <>
                <Button>
                  {formatValue(displayValue || '请选择日期')}
                  {'（'}
                  {formatValue(popupVisible ? '收起' : '展开')}
                  {'） '}
                </Button>
              </>
            )}
          />
        </div>
        <div className={'sd:w-67'}>
          <RangePicker
            value={rangeValue}
            onValueChange={(next) => setRangeValue(next as typeof rangeValue)}
            renderTrigger={({ displayValue, popupVisible }) => (
              <>
                <Button>
                  {formatValue(displayValue.filter(Boolean).join(' - ') || '请选择日期范围')}
                  {' （'}
                  {formatValue(popupVisible ? '收起' : '展开')}
                  {'） '}
                </Button>
              </>
            )}
          />
        </div>
      </Space>
    </>
  );
}
