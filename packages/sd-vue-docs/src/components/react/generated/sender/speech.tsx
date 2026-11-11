/** @jsxImportSource react */
import type { RecorderCoreOptions, SenderRef } from '@sdata/web-react';

import { Sender } from '@sdata/web-react';
import { type ComponentRef, useMemo, useRef, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const senderRef = useRef<ComponentRef<typeof Sender> | null>(null);
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('等待录音');
  const [sampleRate, setSampleRate] = useState(0);
  const [chunks, setChunks] = useState(0);
  const [bytes, setBytes] = useState(0);
  const [cycles, setCycles] = useState(0);
  const recording = useRef(false);
  const recorderOptions = useMemo<RecorderCoreOptions>(
    () => ({
      type: 'pcm',
      sampleRate: 16_000,
      bitRate: 16,
      onProcess(
        buffers: Int16Array[],
        _powerLevel: number,
        _bufferDuration: number,
        bufferSampleRate: number,
        newBufferIdx: number,
      ) {
        if (!recording.current) {
          recording.current = true;
          setStatus('正在采集');
          setChunks(0);
          setBytes(0);
        }
        const nextBuffers = buffers.slice(newBufferIdx);
        setSampleRate(bufferSampleRate);
        setChunks((previous) => previous + nextBuffers.length);
        setBytes(
          (previous) =>
            previous + nextBuffers.reduce((total, buffer) => total + buffer.byteLength, 0),
        );
      },
    }),
    [],
  );

  return (
    <>
      <div data-v-31495ab2="" className={'sender-speech-demo'}>
        <Sender
          data-v-31495ab2=""
          ref={senderRef}
          value={value}
          onValueChange={(next) => setValue(next as typeof value)}
          allowSpeech={recorderOptions}
          onSpeechEnd={() => {
            recording.current = false;
            setCycles((previous) => previous + 1);
            setStatus('已停止');
          }}
          onSpeechError={(message) => {
            recording.current = false;
            setStatus(message);
          }}
          voiceGlow={{ colorVariant: 'ocean', strength: 0.8 }}
          placeholder={'点击语音按钮开始采集音频'}
        />
        <div data-v-31495ab2="" className={'sender-speech-demo-status'} aria-live={'polite'}>
          <span data-v-31495ab2="" data-cy={'speech-status'}>
            {'状态：'}
            {formatValue(status)}
          </span>
          <span data-v-31495ab2="" data-cy={'speech-cycles'}>
            {'启停次数：'}
            {formatValue(cycles)}
          </span>
          <span data-v-31495ab2="">
            {'采样率：'}
            {formatValue(sampleRate || '-')}
            {' Hz'}
          </span>
          <span data-v-31495ab2="" data-cy={'speech-chunks'}>
            {'数据块：'}
            {formatValue(chunks)}
          </span>
          <span data-v-31495ab2="">
            {'已采集：'}
            {formatValue(bytes)}
            {' 字节'}
          </span>
        </div>
        <p data-v-31495ab2="" className={'sender-speech-demo-tip'}>
          {
            ' 示例直接使用 recorder-core 的 onProcess 读取单声道 Int16 PCM，实例上的完整 Recorder API 也可通过 Sender ref 访问。 '
          }
        </p>
      </div>
      <style>
        {
          '\n.sender-speech-demo[data-v-31495ab2] {\n    display: grid;\n    gap: 12px;\n}\n.sender-speech-demo-status[data-v-31495ab2] {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 8px 16px;\n    color: var(--sd-color-text-2);\n    font-size: 13px;\n}\n.sender-speech-demo-tip[data-v-31495ab2] {\n    margin: 0;\n    color: var(--sd-color-text-3);\n    font-size: 13px;\n    line-height: 1.5;\n}\n'
        }
      </style>
    </>
  );
}
