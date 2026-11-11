/** @jsxImportSource react */
import { VoiceGlow } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div data-v-0eae2eb1="" className={'voice-glow-variants'}>
        <VoiceGlow
          data-v-0eae2eb1=""
          type={'pill'}
          theme={'dark'}
          colorVariant={'ocean'}
          level={0.6}
        >
          <div data-v-0eae2eb1="" className={'voice-glow-pill'}>
            {'海洋配色'}
          </div>
        </VoiceGlow>
        <VoiceGlow
          data-v-0eae2eb1=""
          type={'pill'}
          theme={'dark'}
          colorVariant={'sunset'}
          level={0.6}
        >
          <div data-v-0eae2eb1="" className={'voice-glow-pill'}>
            {'日落配色'}
          </div>
        </VoiceGlow>
      </div>
      <style>
        {
          '\n.voice-glow-variants[data-v-0eae2eb1] {\n    display: flex;\n    gap: 24px;\n    padding: 32px;\n    background: #11121b;\n    border-radius: 16px;\n}\n.voice-glow-pill[data-v-0eae2eb1] {\n    padding: 12px 24px;\n    color: #fff;\n    background: #232432;\n    border-radius: 999px;\n}\n'
        }
      </style>
    </>
  );
}
