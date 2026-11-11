/** @jsxImportSource react */
import {
  Button,
  ModelSelectorDialog,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
} from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState('');

  return (
    <>
      <div data-v-619691af="" className={'controlled-demo'}>
        <Button
          data-v-619691af=""
          onClick={() => {
            setVisible(true);
          }}
        >
          {'打开受控选择器'}
        </Button>
        <span data-v-619691af="">
          {'最近选择：'}
          {formatValue(selected || '暂无')}
        </span>
        <ModelSelectorDialog
          data-v-619691af=""
          visible={visible}
          onVisibleChange={(next) => setVisible(next as typeof visible)}
          title={'切换工作模型'}
          onSelect={($event) => {
            setSelected($event);
          }}
        >
          <ModelSelectorInput data-v-619691af="" placeholder={'搜索可用模型'} />
          <ModelSelectorList data-v-619691af="">
            <ModelSelectorEmpty data-v-619691af="" />
            <ModelSelectorGroup data-v-619691af="" heading={'工作区模型'}>
              <ModelSelectorItem data-v-619691af="" value={'gpt-4o'}>
                <ModelSelectorLogo data-v-619691af="" provider={'openai'} />
                <ModelSelectorName data-v-619691af="">{'GPT-4o'}</ModelSelectorName>
              </ModelSelectorItem>
              <ModelSelectorItem data-v-619691af="" value={'claude-sonnet'}>
                <ModelSelectorLogo data-v-619691af="" provider={'anthropic'} />
                <ModelSelectorName data-v-619691af="">{'Claude Sonnet'}</ModelSelectorName>
              </ModelSelectorItem>
            </ModelSelectorGroup>
          </ModelSelectorList>
        </ModelSelectorDialog>
      </div>
      <style>
        {
          '\n.controlled-demo {\n    display: flex;\n    align-items: center;\n    gap: 12px;\n    min-height: 280px;\n}\n'
        }
      </style>
    </>
  );
}
