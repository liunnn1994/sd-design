<template>
  <div class="demo">
    <Alert type="warning">
      该压测直接调用 RichTextEditor 的 insertText(position: 'end',
      replaceCharacters)，模拟语音识别的增量输出、
      整句回退、同音字纠错和标点修正。极限模式会显著占用主线程，请先保存其他工作。
    </Alert>

    <div class="controls">
      <label>
        压测预设
        <Select v-model="preset" :options="presetOptions" :disabled="running" />
      </label>
      <label>
        循环轮数
        <InputNumber v-model="rounds" :min="1" :max="5000" :disabled="running" />
      </label>
      <label>
        调用间隔（毫秒）
        <InputNumber v-model="intervalMs" :min="0" :max="1000" :disabled="running" />
      </label>
      <label>
        每批调用数
        <InputNumber v-model="batchSize" :min="1" :max="200" :disabled="running" />
      </label>
    </div>

    <Space wrap>
      <Button type="primary" :disabled="running" @click="startStress">开始压测</Button>
      <Button :disabled="!running" @click="togglePause">{{ paused ? '继续' : '暂停' }}</Button>
      <Button :disabled="!running" @click="() => stopStress()">停止</Button>
      <Button :disabled="running" @click="resetStress">重置</Button>
    </Space>

    <div class="metrics">
      <div
        ><span>状态</span><strong>{{ statusText }}</strong></div
      >
      <div
        ><span>完成轮数</span><strong>{{ metrics.completedRounds }} / {{ rounds }}</strong></div
      >
      <div
        ><span>API 调用</span><strong>{{ metrics.calls }}</strong></div
      >
      <div
        ><span>纠错替换</span><strong>{{ metrics.corrections }}</strong></div
      >
      <div
        ><span>change 事件</span><strong>{{ metrics.changeEvents }}</strong></div
      >
      <div
        ><span>平均调用耗时</span><strong>{{ averageDuration }} ms</strong></div
      >
      <div
        ><span>最长调用耗时</span><strong>{{ metrics.maxDuration.toFixed(2) }} ms</strong></div
      >
      <div
        ><span>最长帧阻塞</span><strong>{{ metrics.maxFrameDelay.toFixed(2) }} ms</strong></div
      >
      <div
        ><span>文本长度</span><strong>{{ metrics.textLength }}</strong></div
      >
      <div>
        <span>一致性</span>
        <Tag :color="metrics.mismatches ? 'red' : 'green'">
          {{ metrics.mismatches ? `${metrics.mismatches} 次不一致` : '通过' }}
        </Tag>
      </div>
    </div>

    <Progress
      :percent="progressPercent"
      :status="metrics.mismatches ? 'danger' : running ? 'normal' : 'success'"
    />

    <RichTextEditor
      ref="editorRef"
      :auto-size="{ minRows: 8, maxRows: 16 }"
      placeholder="点击“开始压测”后，这里会实时生成并反复纠错文本"
      @change="handleEditorChange"
      @error="handleEditorError"
    />

    <details>
      <summary>最近一次操作</summary>
      <pre>{{ lastOperation }}</pre>
    </details>
  </div>
</template>

<script setup lang="ts">
  import type { RichTextEditorInstance } from '@sdata/web-vue';

  import { computed, onBeforeUnmount, reactive, ref, shallowRef, watch } from 'vue';

  import {
    Alert,
    Button,
    InputNumber,
    Progress,
    RichTextEditor,
    Select,
    Space,
    Tag,
  } from '@sdata/web-vue';

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

  const editorRef = shallowRef<RichTextEditorInstance>();
  const preset = ref<Preset>('actual');
  const rounds = ref(50);
  const intervalMs = ref(80);
  const batchSize = ref(1);
  const running = shallowRef(false);
  const paused = shallowRef(false);
  const lastOperation = shallowRef('尚未开始');
  const metrics = reactive<StressMetrics>(createMetrics());
  let expectedText = '';
  let appliedText = '';
  let scenarioIndex = 0;
  let stepIndex = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let animationFrame = 0;
  let previousFrameAt = 0;

  const statusText = computed(() => {
    if (!running.value) return metrics.completedRounds >= rounds.value ? '已完成' : '未运行';
    return paused.value ? '已暂停' : '运行中';
  });
  const averageDuration = computed(() =>
    metrics.calls ? (metrics.totalDuration / metrics.calls).toFixed(3) : '0.000',
  );
  const progressPercent = computed(() =>
    Math.min(100, Math.round((metrics.completedRounds / rounds.value) * 100)),
  );

  watch(preset, (value) => {
    if (value === 'actual') {
      rounds.value = 50;
      intervalMs.value = 80;
      batchSize.value = 1;
    } else if (value === 'high') {
      rounds.value = 300;
      intervalMs.value = 16;
      batchSize.value = 4;
    } else {
      rounds.value = 2000;
      intervalMs.value = 0;
      batchSize.value = 50;
    }
  });

  /**
   * 创建空白压测指标。
   * @returns 初始指标对象。
   */
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

  /**
   * 重置全部压测指标。
   */
  function clearMetrics(): void {
    Object.assign(metrics, createMetrics());
  }

  /**
   * 记录浏览器动画帧间隔，用于发现同步更新造成的主线程阻塞。
   * @param now 当前动画帧时间。
   */
  function measureFrameDelay(now: number): void {
    if (!running.value) return;
    if (previousFrameAt) {
      metrics.maxFrameDelay = Math.max(metrics.maxFrameDelay, now - previousFrameAt);
    }
    previousFrameAt = now;
    animationFrame = requestAnimationFrame(measureFrameDelay);
  }

  /**
   * 把一个完整识别候选应用到编辑器，并校验实际文本。
   * @param nextText 新的完整识别候选。
   */
  function applyTranscript(nextText: string): void {
    const editor = editorRef.value;
    if (!editor) return;
    const appended = nextText.startsWith(appliedText);
    const insertText = appended ? nextText.slice(appliedText.length) : nextText;
    const replaceCharacters = appended ? undefined : appliedText;
    const startedAt = performance.now();
    editor.insertText(insertText, {
      position: 'end',
      replaceCharacters,
    });
    const duration = performance.now() - startedAt;

    if (replaceCharacters) metrics.corrections += 1;
    metrics.calls += 1;
    metrics.totalDuration += duration;
    metrics.maxDuration = Math.max(metrics.maxDuration, duration);
    expectedText = appended
      ? `${expectedText}${insertText}`
      : `${expectedText.slice(0, -appliedText.length)}${nextText}`;
    appliedText = nextText;

    const actualText = editor.getText();
    metrics.textLength = actualText.length;
    if (actualText !== expectedText) metrics.mismatches += 1;
    lastOperation.value = JSON.stringify(
      {
        actualText,
        duration,
        expectedText,
        insertText,
        replaceCharacters,
      },
      null,
      2,
    );
  }

  /**
   * 执行下一批流式识别更新。
   */
  function runBatch(): void {
    if (!running.value || paused.value) return;
    for (let index = 0; index < batchSize.value && running.value; index += 1) {
      const scenario = scenarios[scenarioIndex];
      const nextText = scenario[stepIndex];
      applyTranscript(nextText);
      stepIndex += 1;
      if (stepIndex < scenario.length) continue;

      editorRef.value?.insertText('\n', { position: 'end' });
      expectedText += '\n';
      appliedText = '';
      stepIndex = 0;
      scenarioIndex = (scenarioIndex + 1) % scenarios.length;
      if (scenarioIndex === 0) metrics.completedRounds += 1;
      if (metrics.completedRounds >= rounds.value) stopStress(true);
    }
    if (running.value && !paused.value) {
      timer = setTimeout(runBatch, intervalMs.value);
    }
  }

  /**
   * 开始一轮全新的流式纠错压测。
   */
  function startStress(): void {
    resetStress();
    running.value = true;
    previousFrameAt = 0;
    animationFrame = requestAnimationFrame(measureFrameDelay);
    runBatch();
  }

  /**
   * 暂停或继续当前压测。
   */
  function togglePause(): void {
    paused.value = !paused.value;
    if (paused.value) {
      if (timer) clearTimeout(timer);
      timer = undefined;
    } else {
      previousFrameAt = 0;
      runBatch();
    }
  }

  /**
   * 停止当前压测。
   * @param completed 是否因完成全部轮数而停止。
   */
  function stopStress(completed = false): void {
    running.value = false;
    paused.value = false;
    if (timer) clearTimeout(timer);
    timer = undefined;
    cancelAnimationFrame(animationFrame);
    lastOperation.value = completed
      ? `${lastOperation.value}\n\n全部压测轮次已完成。`
      : `${lastOperation.value}\n\n压测已手动停止。`;
  }

  /**
   * 清空编辑器并重置压测状态。
   */
  function resetStress(): void {
    stopStress();
    editorRef.value?.clear();
    expectedText = '';
    appliedText = '';
    scenarioIndex = 0;
    stepIndex = 0;
    clearMetrics();
    lastOperation.value = '尚未开始';
  }

  /**
   * 统计 RichTextEditor change 事件数量。
   */
  function handleEditorChange(): void {
    metrics.changeEvents += 1;
  }

  /**
   * 记录 RichTextEditor 抛出的运行错误。
   * @param error 编辑器错误。
   */
  function handleEditorError(error: Error): void {
    metrics.errors += 1;
    lastOperation.value = error.stack || error.message;
  }

  onBeforeUnmount(stopStress);
</script>

<style scoped>
  .demo {
    display: grid;
    gap: 16px;
  }

  .controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
  }

  .controls label {
    display: grid;
    gap: 6px;
    color: var(--sd-color-text-2);
    font-size: 13px;
  }

  .metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1px;
    overflow: hidden;
    background: var(--sd-color-border);
    border: 1px solid var(--sd-color-border);
    border-radius: var(--sd-border-radius-medium);
  }

  .metrics > div {
    display: grid;
    gap: 4px;
    padding: 10px 12px;
    background: var(--sd-color-bg-1);
  }

  .metrics span {
    color: var(--sd-color-text-3);
    font-size: 12px;
  }

  .metrics strong {
    color: var(--sd-color-text-1);
  }

  details {
    color: var(--sd-color-text-2);
  }

  pre {
    max-height: 240px;
    padding: 12px;
    overflow: auto;
    background: var(--sd-color-fill-1);
    border-radius: var(--sd-border-radius-medium);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
</style>
