/** @jsxImportSource react */
import { ColorPicker, Space, Tag } from '@sdata/web-react';
import { IconBgColors } from '@sdata/web-react/icon';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [value, setValue] = useState('#165DFF');

  return (
    <>
      <Space data-v-306151f5="">
        <ColorPicker
          data-v-306151f5=""
          value={value}
          onValueChange={(next) => setValue(next as typeof value)}
          size={'mini'}
          renderTrigger={({ displayValue, color, popupVisible }) => (
            <>
              <Tag
                data-v-306151f5=""
                color={displayValue}
                className={'color-picker-trigger-tag'}
                icon={
                  <>
                    <span data-v-306151f5="" className={'color-picker-trigger-tag__contrast'}>
                      <IconBgColors data-v-306151f5="" />
                    </span>
                  </>
                }
              >
                <span data-v-306151f5="" className={'color-picker-trigger-tag__contrast'}>
                  {formatValue(displayValue)}
                  {' · '}
                  {formatValue(color.hex)}
                  {' · '}
                  {formatValue(popupVisible ? '收起' : '展开')}
                </span>
              </Tag>
            </>
          )}
        />
      </Space>
      <style>
        {
          '\n.color-picker-trigger-tag__contrast {\n    color: #fff;\n    mix-blend-mode: difference;\n    user-select: none;\n}\n'
        }
      </style>
    </>
  );
}
