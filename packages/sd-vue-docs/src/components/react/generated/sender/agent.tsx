/** @jsxImportSource react */
import type { SenderSkill, SenderSlotConfig } from '@sdata/web-react';

import { Alert, Button, Sender, SenderSwitch } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  interface Agent {
    key: string;
    label: string;
    skill: SenderSkill;
    slotConfig: SenderSlotConfig[];
  }
  const agents: Agent[] = [
    {
      key: 'writing',
      label: '写作助手',
      skill: { title: '写作助手', value: 'writing', closable: true },
      slotConfig: [
        { type: 'text', value: '请写一篇关于 ' },
        {
          type: 'select',
          key: 'topic',
          props: { options: ['旅行', '阅读', '科技'], defaultValue: '旅行' },
        },
        { type: 'text', value: ' 的文章，篇幅约 ' },
        {
          type: 'content',
          key: 'length',
          props: { defaultValue: '800 字', placeholder: '输入篇幅' },
        },
      ],
    },
    {
      key: 'search',
      label: '深度搜索',
      skill: { title: '深度搜索', value: 'search', closable: true },
      slotConfig: [
        { type: 'text', value: '请搜索 ' },
        {
          type: 'input',
          key: 'keyword',
          props: { defaultValue: 'Vue 生态', placeholder: '输入关键词' },
        },
        { type: 'text', value: ' 的最新资料，并整理为要点。' },
      ],
    },
    {
      key: 'code',
      label: '代码助手',
      skill: { title: '代码助手', value: 'code', closable: true },
      slotConfig: [
        { type: 'text', value: '请使用 ' },
        {
          type: 'select',
          key: 'language',
          props: { options: ['TypeScript', 'Vue', 'Node.js'], defaultValue: 'Vue' },
        },
        { type: 'text', value: ' 实现一个可复用示例。' },
      ],
    },
  ];
  const [activeAgent, setActiveAgent] = useState('writing');
  const [deepThinking, setDeepThinking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lastMessage, setLastMessage] = useState('');
  const currentAgent = (() => agents.find((item) => item.key === activeAgent) ?? agents[0]!)();
  function handleSubmit(value: string) {
    setLastMessage(value);
    setLoading(true);
  }

  return (
    <>
      <div data-v-e40acea1="" className={'sender-demo'}>
        <div data-v-e40acea1="" className={'sender-demo-toolbar'}>
          <div data-v-e40acea1="" className={'sender-demo-agents'}>
            {agents.map((item) => (
              <Button
                data-v-e40acea1=""
                key={item.key}
                size={'small'}
                type={activeAgent === item.key ? 'primary' : 'outline'}
                onClick={() => {
                  setActiveAgent(item.key);
                }}
              >
                {formatValue(item.label)}
              </Button>
            ))}
          </div>
          <SenderSwitch
            data-v-e40acea1=""
            value={deepThinking}
            onValueChange={(next) => setDeepThinking(next as typeof deepThinking)}
            slots={{ checked: () => <>{'深度思考：开'}</>, unchecked: () => <>{'深度思考：关'}</> }}
          />
        </div>
        <Sender
          data-v-e40acea1=""
          key={activeAgent}
          slotConfig={currentAgent.slotConfig}
          skill={currentAgent.skill}
          loading={loading}
          autoSize={{ minRows: 2, maxRows: 6 }}
          onSubmit={handleSubmit}
          onCancel={() => {
            setLoading(false);
          }}
          slots={{
            footer: () => (
              <>
                <span data-v-e40acea1="" className={'sender-demo-footer'}>
                  {' 当前模式：'}
                  {formatValue(currentAgent.label)}
                  {formatValue(deepThinking ? ' · 深度思考' : '')}
                </span>
              </>
            ),
          }}
        />
        {lastMessage ? (
          <Alert data-v-e40acea1="" type={loading ? 'info' : 'success'}>
            {formatValue(loading ? `正在生成：${lastMessage}` : '已停止生成')}
          </Alert>
        ) : null}
      </div>
      <style>
        {
          '\n.sender-demo[data-v-e40acea1] {\n    display: grid;\n    gap: 12px;\n}\n.sender-demo-toolbar[data-v-e40acea1] {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    gap: 12px;\n}\n.sender-demo-agents[data-v-e40acea1] {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 8px;\n}\n.sender-demo-footer[data-v-e40acea1] {\n    color: var(--sd-color-text-3);\n    font-size: 12px;\n}\n'
        }
      </style>
    </>
  );
}
