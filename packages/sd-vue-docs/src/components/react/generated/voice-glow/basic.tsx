/** @jsxImportSource react */
import { VoiceGlow } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div data-v-561c4fb4="" className={'voice-glow-themes'}>
        <div data-v-561c4fb4="" className={'voice-glow-stage voice-glow-stage-dark'}>
          <span data-v-561c4fb4="" className={'voice-glow-label'}>
            {'深色模式'}
          </span>
          <VoiceGlow data-v-561c4fb4="" theme={'dark'} level={0.45}>
            <div data-v-561c4fb4="" className={'voice-glow-card voice-glow-card-dark'}>
              {'正在聆听你的声音'}
            </div>
          </VoiceGlow>
        </div>
        <div data-v-561c4fb4="" className={'voice-glow-stage voice-glow-stage-light'}>
          <span data-v-561c4fb4="" className={'voice-glow-label'}>
            {'浅色模式'}
          </span>
          <VoiceGlow data-v-561c4fb4="" theme={'light'} level={0.45}>
            <div data-v-561c4fb4="" className={'voice-glow-card voice-glow-card-light'}>
              {'正在聆听你的声音'}
            </div>
          </VoiceGlow>
        </div>
      </div>
      <style>
        {
          '\n.voice-glow-themes[data-v-561c4fb4] {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\n    gap: 16px;\n}\n.voice-glow-stage[data-v-561c4fb4] {\n    display: grid;\n    gap: 12px;\n    padding: 28px;\n    border-radius: 16px;\n}\n.voice-glow-stage-dark[data-v-561c4fb4] {\n    color: #fff;\n    background: #11121b;\n}\n.voice-glow-stage-light[data-v-561c4fb4] {\n    color: #303242;\n    background: #f2f3f8;\n}\n.voice-glow-label[data-v-561c4fb4] {\n    font-size: 13px;\n}\n.voice-glow-card[data-v-561c4fb4] {\n    padding: 24px;\n    border-radius: 16px;\n    margin-inline: auto;\n}\n.voice-glow-card-dark[data-v-561c4fb4] {\n    color: #fff;\n    background: #232432;\n}\n.voice-glow-card-light[data-v-561c4fb4] {\n    color: #303242;\n    background: #fff;\n}\n'
        }
      </style>
    </>
  );
}
