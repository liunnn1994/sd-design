/** @jsxImportSource react */
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from '@sdata/web-react';
import { IconCheck } from '@sdata/web-react/icon';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const models = [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', providerName: 'OpenAI' },
    {
      id: 'claude-sonnet',
      name: 'Claude Sonnet',
      provider: 'anthropic',
      providerName: 'Anthropic',
    },
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'google', providerName: 'Google' },
  ] as const;
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState('gpt-4o');
  const currentModel = (() => models.find((model) => model.id === selected))();

  return (
    <>
      <div data-v-5988db4d="" className={'demo-row'}>
        <ModelSelector
          data-v-5988db4d=""
          visible={visible}
          onVisibleChange={(next) => setVisible(next as typeof visible)}
          onSelect={($event) => {
            setSelected($event);
          }}
        >
          <ModelSelectorTrigger data-v-5988db4d="">
            {formatValue(currentModel?.name ?? '选择模型')}
          </ModelSelectorTrigger>
          <ModelSelectorContent data-v-5988db4d="">
            <ModelSelectorInput data-v-5988db4d="" placeholder={'搜索模型或服务商'} />
            <ModelSelectorList data-v-5988db4d="">
              <ModelSelectorEmpty data-v-5988db4d="" />
              <ModelSelectorGroup data-v-5988db4d="" heading={'推荐模型'}>
                {models.map((model) => (
                  <ModelSelectorItem
                    data-v-5988db4d=""
                    key={model.id}
                    value={model.id}
                    label={model.name}
                    keywords={[model.providerName]}
                    selected={selected === model.id}
                  >
                    <ModelSelectorLogo data-v-5988db4d="" provider={model.provider} />
                    <ModelSelectorName data-v-5988db4d="">
                      {formatValue(model.name)}
                    </ModelSelectorName>
                    {selected === model.id ? <IconCheck data-v-5988db4d="" /> : null}
                  </ModelSelectorItem>
                ))}
              </ModelSelectorGroup>
            </ModelSelectorList>
          </ModelSelectorContent>
        </ModelSelector>
        <span data-v-5988db4d="">
          {'当前模型：'}
          {formatValue(currentModel?.name ?? '未选择')}
        </span>
      </div>
      <style>
        {
          '\n.demo-row {\n    display: flex;\n    align-items: center;\n    gap: 12px;\n    min-height: 280px;\n}\n'
        }
      </style>
    </>
  );
}
