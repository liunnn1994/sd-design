/** @jsxImportSource react */
import { VoiceGlow } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div data-v-dd3a97db="" className={'voice-glow-composition'}>
        <VoiceGlow data-v-dd3a97db="" theme={'dark'} level={0.5}>
          <div data-v-dd3a97db="" className={'voice-glow-card'}>
            <strong data-v-dd3a97db="">{'自定义内容'}</strong>
            <span data-v-dd3a97db="">{'插槽内可以放入任意卡片或输入区域。'}</span>
          </div>
        </VoiceGlow>
      </div>
      <style>
        {
          '\n.voice-glow-composition[data-v-dd3a97db] {\n    padding: 28px;\n    background: #11121b;\n    border-radius: 16px;\n}\n.voice-glow-composition .voice-glow-card[data-v-dd3a97db] {\n    display: grid;\n    gap: 8px;\n    min-width: 300px;\n    padding: 24px;\n    color: #fff;\n    background: #232432;\n    border-radius: 16px;\n}\n.voice-glow-composition .voice-glow-card span[data-v-dd3a97db] {\n    opacity: 0.7;\n}\n'
        }
      </style>
    </>
  );
}
