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

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const groups = [
    {
      name: '通用模型',
      models: [
        { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', keywords: ['OpenAI', '多模态'] },
        {
          id: 'claude-sonnet',
          name: 'Claude Sonnet',
          provider: 'anthropic',
          keywords: ['Anthropic', '长文本'],
        },
      ],
    },
    {
      name: '国内模型',
      models: [
        { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'deepseek', keywords: ['推理'] },
        { id: 'qwen-max', name: 'Qwen Max', provider: 'alibaba-cn', keywords: ['阿里云', '通义'] },
      ],
    },
  ];

  return (
    <>
      <ModelSelector closeOnSelect={false}>
        <ModelSelectorTrigger>{'打开可搜索模型列表'}</ModelSelectorTrigger>
        <ModelSelectorContent maskClosable={false}>
          <ModelSelectorInput placeholder={'输入模型、厂商或能力关键词'} />
          <ModelSelectorList>
            <ModelSelectorEmpty>{'没有找到符合条件的模型'}</ModelSelectorEmpty>
            {groups.map((group) => (
              <ModelSelectorGroup key={group.name} heading={group.name}>
                {group.models.map((model) => (
                  <ModelSelectorItem
                    key={model.id}
                    value={model.id}
                    label={model.name}
                    keywords={model.keywords}
                  >
                    <ModelSelectorLogo provider={model.provider} />
                    <ModelSelectorName>{formatValue(model.name)}</ModelSelectorName>
                  </ModelSelectorItem>
                ))}
              </ModelSelectorGroup>
            ))}
          </ModelSelectorList>
        </ModelSelectorContent>
      </ModelSelector>
    </>
  );
}
