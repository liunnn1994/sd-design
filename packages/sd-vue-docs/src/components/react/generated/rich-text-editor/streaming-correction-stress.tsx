/** @jsxImportSource react */
import type { RichTextEditorInstance } from '@sdata/web-react';

import {
  Alert,
  Button,
  InputNumber,
  Progress,
  RichTextEditor,
  Select,
  Space,
  Tag,
} from '@sdata/web-react';
import { type ComponentRef, useEffect, useRef, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  type Preset = 'actual' | 'high' | 'extreme';
  interface StressMetrics {
    calls: number;
    changeEvents: number;
    completedRounds: number;
    corrections: number;
    errors: number;
    maxDuration: number;
    maxFrameDelay: number;
    mismatches: number;
    textLength: number;
    totalDuration: number;
  }
  const scenarios = [
    ['张', '张三', '张山', '张珊', '张珊。'],
    ['今', '今天', '今天天', '今天天汽', '今天天气', '今天天气不错', '今天天气不错。'],
    [
      '请',
      '请帮',
      '请帮我',
      '请帮我查',
      '请帮我查询',
      '请帮我查询北',
      '请帮我查询北京',
      '请帮我查北京',
      '请帮我查询上海',
      '请帮我查询上海明天的天气。',
    ],
    [
      '语',
      '语音',
      '语音输',
      '语音输入',
      '语音输入测',
      '语音输入测试',
      '语音识别测试',
      '语音识别压力测试',
      '语音识别压力测试！',
    ],
    [
      '会议',
      '会议纪要',
      '会议纪要显示',
      '会议纪要显示项目延期',
      '会议纪要显示项目延期一周',
      '会议纪要显示项目提前一周',
      '会议纪要显示：项目提前一周。',
    ],
    [
      'A',
      'AI',
      'AI Agent',
      'AI Agent 正在运行',
      'AI Agent 正在云行',
      'AI Agent 正在运行',
      'AI Agent 正在运行，状态正常。',
    ],
  ] as const;
  const presetOptions = [
    { label: '真实识别（80ms / 每批1次）', value: 'actual' },
    { label: '高频压测（16ms / 每批4次）', value: 'high' },
    { label: '极限压测（0ms / 每批50次）', value: 'extreme' },
  ];
  const editorRef = useRef<ComponentRef<typeof RichTextEditor> | null>(null);
  const [preset, setPreset] = useState<Preset>('actual');
  const [rounds, setRounds] = useState(50);
  const [intervalMs, setIntervalMs] = useState(80);
  const [batchSize, setBatchSize] = useState(1);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [lastOperation, setLastOperation] = useState('尚未开始');
  function createMetrics(): StressMetrics {
    return {
      calls: 0,
      changeEvents: 0,
      completedRounds: 0,
      corrections: 0,
      errors: 0,
      maxDuration: 0,
      maxFrameDelay: 0,
      mismatches: 0,
      textLength: 0,
      totalDuration: 0,
    };
  }
  const machine = useRef({
    running: false,
    paused: false,
    expectedText: '',
    appliedText: '',
    scenarioIndex: 0,
    stepIndex: 0,
    timer: undefined as ReturnType<typeof setTimeout> | undefined,
    animationFrame: 0,
    previousFrameAt: 0,
    metrics: createMetrics(),
    lastOperation: '尚未开始',
  });
  const configuration = useRef({ rounds, intervalMs, batchSize });
  configuration.current = { rounds, intervalMs, batchSize };
  const [metrics, setMetrics] = useState(() => ({ ...machine.current.metrics }));
  const statusText = !running
    ? metrics.completedRounds >= rounds
      ? '已完成'
      : '未运行'
    : paused
      ? '已暂停'
      : '运行中';
  const averageDuration = metrics.calls
    ? (metrics.totalDuration / metrics.calls).toFixed(3)
    : '0.000';
  const progressPercent = Math.min(100, Math.round((metrics.completedRounds / rounds) * 100));
  useEffect(() => {
    const presets = { actual: [50, 80, 1], high: [300, 16, 4], extreme: [2000, 0, 50] } as const;
    const [nextRounds, nextInterval, nextBatch] = presets[preset];
    setRounds(nextRounds);
    setIntervalMs(nextInterval);
    setBatchSize(nextBatch);
  }, [preset]);
  function publish() {
    const state = machine.current;
    setMetrics({ ...state.metrics });
    setLastOperation(state.lastOperation);
    setRunning(state.running);
    setPaused(state.paused);
  }
  function measureFrameDelay(now: number): void {
    const state = machine.current;
    if (!state.running) return;
    if (state.previousFrameAt)
      state.metrics.maxFrameDelay = Math.max(
        state.metrics.maxFrameDelay,
        now - state.previousFrameAt,
      );
    state.previousFrameAt = now;
    state.animationFrame = requestAnimationFrame(measureFrameDelay);
  }
  function applyTranscript(nextText: string): void {
    const editor = editorRef.current;
    if (!editor) return;
    const state = machine.current;
    const appended = nextText.startsWith(state.appliedText);
    const insertText = appended ? nextText.slice(state.appliedText.length) : nextText;
    const replaceCharacters = appended ? undefined : state.appliedText;
    const startedAt = performance.now();
    editor.insertText(insertText, { position: 'end', replaceCharacters });
    const duration = performance.now() - startedAt;
    if (replaceCharacters) state.metrics.corrections++;
    state.metrics.calls++;
    state.metrics.totalDuration += duration;
    state.metrics.maxDuration = Math.max(state.metrics.maxDuration, duration);
    state.expectedText = appended
      ? state.expectedText + insertText
      : state.expectedText.slice(0, -state.appliedText.length) + nextText;
    state.appliedText = nextText;
    const actualText = editor.getText();
    state.metrics.textLength = actualText.length;
    if (actualText !== state.expectedText) state.metrics.mismatches++;
    state.lastOperation = JSON.stringify(
      { actualText, duration, expectedText: state.expectedText, insertText, replaceCharacters },
      null,
      2,
    );
  }
  function runBatch(): void {
    const state = machine.current;
    const config = configuration.current;
    if (!state.running || state.paused) return;
    for (let index = 0; index < config.batchSize && state.running; index++) {
      const scenario = scenarios[state.scenarioIndex];
      applyTranscript(scenario[state.stepIndex]);
      state.stepIndex++;
      if (state.stepIndex < scenario.length) continue;
      editorRef.current?.insertText('\n', { position: 'end' });
      state.expectedText += '\n';
      state.appliedText = '';
      state.stepIndex = 0;
      state.scenarioIndex = (state.scenarioIndex + 1) % scenarios.length;
      if (state.scenarioIndex === 0) state.metrics.completedRounds++;
      if (state.metrics.completedRounds >= config.rounds) stopStress(true);
    }
    publish();
    if (state.running && !state.paused) state.timer = setTimeout(runBatch, config.intervalMs);
  }
  function startStress(): void {
    resetStress();
    const state = machine.current;
    state.running = true;
    state.previousFrameAt = 0;
    state.animationFrame = requestAnimationFrame(measureFrameDelay);
    runBatch();
  }
  function togglePause(): void {
    const state = machine.current;
    state.paused = !state.paused;
    if (state.paused) {
      clearTimeout(state.timer);
      state.timer = undefined;
    } else {
      state.previousFrameAt = 0;
      runBatch();
    }
    publish();
  }
  function stopStress(completed = false): void {
    const state = machine.current;
    state.running = false;
    state.paused = false;
    clearTimeout(state.timer);
    state.timer = undefined;
    cancelAnimationFrame(state.animationFrame);
    state.lastOperation += completed ? '\n\n全部压测轮次已完成。' : '\n\n压测已手动停止。';
    publish();
  }
  function resetStress(): void {
    stopStress();
    editorRef.current?.clear();
    const state = machine.current;
    state.expectedText = '';
    state.appliedText = '';
    state.scenarioIndex = 0;
    state.stepIndex = 0;
    state.metrics = createMetrics();
    state.lastOperation = '尚未开始';
    publish();
  }
  function handleEditorChange(): void {
    machine.current.metrics.changeEvents++;
    publish();
  }
  function handleEditorError(error: Error): void {
    machine.current.metrics.errors++;
    machine.current.lastOperation = error.stack || error.message;
    publish();
  }
  useEffect(
    () => () => {
      machine.current.running = false;
      clearTimeout(machine.current.timer);
      cancelAnimationFrame(machine.current.animationFrame);
    },
    [],
  );

  return (
    <>
      <div data-v-2e7db9d3="" className={'demo'}>
        <Alert data-v-2e7db9d3="" type={'warning'}>
          {
            " 该压测直接调用 RichTextEditor 的 insertText(position: 'end', replaceCharacters)，模拟语音识别的增量输出、 整句回退、同音字纠错和标点修正。极限模式会显著占用主线程，请先保存其他工作。 "
          }
        </Alert>
        <div data-v-2e7db9d3="" className={'controls'}>
          <label data-v-2e7db9d3="">
            {' 压测预设 '}
            <Select
              data-v-2e7db9d3=""
              value={preset}
              onValueChange={(next) => setPreset(next as typeof preset)}
              options={presetOptions}
              disabled={running}
            />
          </label>
          <label data-v-2e7db9d3="">
            {' 循环轮数 '}
            <InputNumber
              data-v-2e7db9d3=""
              value={rounds}
              onValueChange={(next) => setRounds(next as typeof rounds)}
              min={1}
              max={5000}
              disabled={running}
            />
          </label>
          <label data-v-2e7db9d3="">
            {' 调用间隔（毫秒） '}
            <InputNumber
              data-v-2e7db9d3=""
              value={intervalMs}
              onValueChange={(next) => setIntervalMs(next as typeof intervalMs)}
              min={0}
              max={1000}
              disabled={running}
            />
          </label>
          <label data-v-2e7db9d3="">
            {' 每批调用数 '}
            <InputNumber
              data-v-2e7db9d3=""
              value={batchSize}
              onValueChange={(next) => setBatchSize(next as typeof batchSize)}
              min={1}
              max={200}
              disabled={running}
            />
          </label>
        </div>
        <Space data-v-2e7db9d3="" wrap={true}>
          <Button data-v-2e7db9d3="" type={'primary'} disabled={running} onClick={startStress}>
            {'开始压测'}
          </Button>
          <Button data-v-2e7db9d3="" disabled={!running} onClick={togglePause}>
            {formatValue(paused ? '继续' : '暂停')}
          </Button>
          <Button data-v-2e7db9d3="" disabled={!running} onClick={() => stopStress()}>
            {'停止'}
          </Button>
          <Button data-v-2e7db9d3="" disabled={running} onClick={resetStress}>
            {'重置'}
          </Button>
        </Space>
        <div data-v-2e7db9d3="" className={'metrics'}>
          <div data-v-2e7db9d3="">
            <span data-v-2e7db9d3="">{'状态'}</span>
            <strong data-v-2e7db9d3="">{formatValue(statusText)}</strong>
          </div>
          <div data-v-2e7db9d3="">
            <span data-v-2e7db9d3="">{'完成轮数'}</span>
            <strong data-v-2e7db9d3="">
              {formatValue(metrics.completedRounds)}
              {' / '}
              {formatValue(rounds)}
            </strong>
          </div>
          <div data-v-2e7db9d3="">
            <span data-v-2e7db9d3="">{'API 调用'}</span>
            <strong data-v-2e7db9d3="">{formatValue(metrics.calls)}</strong>
          </div>
          <div data-v-2e7db9d3="">
            <span data-v-2e7db9d3="">{'纠错替换'}</span>
            <strong data-v-2e7db9d3="">{formatValue(metrics.corrections)}</strong>
          </div>
          <div data-v-2e7db9d3="">
            <span data-v-2e7db9d3="">{'change 事件'}</span>
            <strong data-v-2e7db9d3="">{formatValue(metrics.changeEvents)}</strong>
          </div>
          <div data-v-2e7db9d3="">
            <span data-v-2e7db9d3="">{'平均调用耗时'}</span>
            <strong data-v-2e7db9d3="">
              {formatValue(averageDuration)}
              {' ms'}
            </strong>
          </div>
          <div data-v-2e7db9d3="">
            <span data-v-2e7db9d3="">{'最长调用耗时'}</span>
            <strong data-v-2e7db9d3="">
              {formatValue(metrics.maxDuration.toFixed(2))}
              {' ms'}
            </strong>
          </div>
          <div data-v-2e7db9d3="">
            <span data-v-2e7db9d3="">{'最长帧阻塞'}</span>
            <strong data-v-2e7db9d3="">
              {formatValue(metrics.maxFrameDelay.toFixed(2))}
              {' ms'}
            </strong>
          </div>
          <div data-v-2e7db9d3="">
            <span data-v-2e7db9d3="">{'文本长度'}</span>
            <strong data-v-2e7db9d3="">{formatValue(metrics.textLength)}</strong>
          </div>
          <div data-v-2e7db9d3="">
            <span data-v-2e7db9d3="">{'一致性'}</span>
            <Tag data-v-2e7db9d3="" color={metrics.mismatches ? 'red' : 'green'}>
              {formatValue(metrics.mismatches ? `${metrics.mismatches} 次不一致` : '通过')}
            </Tag>
          </div>
        </div>
        <Progress
          data-v-2e7db9d3=""
          percent={progressPercent}
          status={metrics.mismatches ? 'danger' : running ? 'normal' : 'success'}
        />
        <RichTextEditor
          data-v-2e7db9d3=""
          ref={editorRef}
          autoSize={{ minRows: 8, maxRows: 16 }}
          placeholder={'点击“开始压测”后，这里会实时生成并反复纠错文本'}
          onChange={handleEditorChange}
          onError={handleEditorError}
        />
        <details data-v-2e7db9d3="">
          <summary data-v-2e7db9d3="">{'最近一次操作'}</summary>
          <pre data-v-2e7db9d3="">{formatValue(lastOperation)}</pre>
        </details>
      </div>
      <style>
        {
          '\n.demo[data-v-2e7db9d3] {\n    display: grid;\n    gap: 16px;\n}\n.controls[data-v-2e7db9d3] {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));\n    gap: 12px;\n}\n.controls label[data-v-2e7db9d3] {\n    display: grid;\n    gap: 6px;\n    color: var(--sd-color-text-2);\n    font-size: 13px;\n}\n.metrics[data-v-2e7db9d3] {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));\n    gap: 1px;\n    overflow: hidden;\n    background: var(--sd-color-border);\n    border: 1px solid var(--sd-color-border);\n    border-radius: var(--sd-border-radius-medium);\n}\n.metrics > div[data-v-2e7db9d3] {\n    display: grid;\n    gap: 4px;\n    padding: 10px 12px;\n    background: var(--sd-color-bg-1);\n}\n.metrics span[data-v-2e7db9d3] {\n    color: var(--sd-color-text-3);\n    font-size: 12px;\n}\n.metrics strong[data-v-2e7db9d3] {\n    color: var(--sd-color-text-1);\n}\ndetails[data-v-2e7db9d3] {\n    color: var(--sd-color-text-2);\n}\npre[data-v-2e7db9d3] {\n    max-height: 240px;\n    padding: 12px;\n    overflow: auto;\n    background: var(--sd-color-fill-1);\n    border-radius: var(--sd-border-radius-medium);\n    white-space: pre-wrap;\n    overflow-wrap: anywhere;\n}\n'
        }
      </style>
    </>
  );
}
