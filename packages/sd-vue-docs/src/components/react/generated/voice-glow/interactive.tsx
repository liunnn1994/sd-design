/** @jsxImportSource react */
import { Button, Space, VoiceGlow } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [level, setLevel] = useState(0.2);
  const [processing, setProcessing] = useState(false);

  return (
    <>
      <div data-v-cc297f74="" className={'voice-glow-interactive'}>
        <VoiceGlow data-v-cc297f74="" theme={'dark'} level={level} processing={processing}>
          <div data-v-cc297f74="" className={'voice-glow-card'}>
            {formatValue(processing ? '处理中…' : `音量：${level}`)}
          </div>
        </VoiceGlow>
        <Space data-v-cc297f74="">
          <Button
            data-v-cc297f74=""
            onClick={() => {
              setLevel(level === 0.8 ? 0.2 : 0.8);
            }}
          >
            {'切换音量'}
          </Button>
          <Button
            data-v-cc297f74=""
            onClick={() => {
              setProcessing(!processing);
            }}
          >
            {'切换处理状态'}
          </Button>
        </Space>
      </div>
      <style>
        {
          '\n.voice-glow-interactive[data-v-cc297f74] {\n    display: grid;\n    gap: 28px;\n    justify-items: start;\n    padding: 28px;\n    background: #11121b;\n    border-radius: 16px;\n}\n.voice-glow-interactive .voice-glow-card[data-v-cc297f74] {\n    min-width: 300px;\n    padding: 24px;\n    color: #fff;\n    background: #232432;\n    border-radius: 16px;\n}\n'
        }
      </style>
    </>
  );
}
