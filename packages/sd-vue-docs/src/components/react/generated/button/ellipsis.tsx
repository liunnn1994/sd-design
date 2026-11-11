/** @jsxImportSource react */
import { Button, Checkbox, Space } from '@sdata/web-react';
import { IconPlus } from '@sdata/web-react/icon';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [ellipsis, setEllipsis] = useState(true);
  const text = '这是一段较长的按钮内容，超出宽度后显示省略号';

  return (
    <>
      <Space direction={'vertical'} align={'start'}>
        <Checkbox
          modelValue={ellipsis}
          onValueChange={(next) => setEllipsis(next as typeof ellipsis)}
        >
          {'开启省略'}
        </Checkbox>
        <Button ellipsis={ellipsis} style={{ width: '180px' }}>
          {formatValue(text)}
        </Button>
        <Button
          ellipsis={ellipsis}
          type={'primary'}
          style={{ width: '180px' }}
          icon={
            <>
              <IconPlus />
            </>
          }
        >
          {formatValue(text)}
        </Button>
        <Button
          ellipsis={ellipsis}
          href={'#'}
          style={{ width: '180px' }}
          onClick={(event) => {
            event.preventDefault();
          }}
        >
          {formatValue(text)}
        </Button>
        <Button
          ellipsis={ellipsis}
          ellipsisLineClamp={2}
          ellipsisExpandTrigger={'click'}
          ellipsisTooltip={false}
          style={{ width: '180px', height: 'auto' }}
        >
          {formatValue(text)}
        </Button>
      </Space>
    </>
  );
}
