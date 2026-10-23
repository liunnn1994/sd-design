import type { WebWorkerMLCEngine } from '@mlc-ai/web-llm';

import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const modelId = 'SmolLM2-135M-Instruct-q4f16_1-MLC';
// Pin both artifacts: the WASM must match the weight format and WebLLM version.
const modelUrl = `https://modelscope.cn/models/mlc-ai/${modelId}/resolve/ef2811e091465a80a2eb737fb46e91c4197a43fa/`;
const modelLibUrl =
  'https://cdn.jsdelivr.net/gh/mlc-ai/binary-mlc-llm-libs@00fe7a40e57e5e8eb9fef87526a4bf28ad5846c0/web-llm-models/v0_2_86/base/SmolLM2-135M-Instruct-q4f16_1_cs1k-webgpu.wasm';
function getDocContext(index: string, question: string) {
  const terms = (
    question.toLowerCase().match(/[a-z][a-z0-9-]*|[\u4e00-\u9fff]{2,}/g) || []
  ).flatMap((term) =>
    /[\u4e00-\u9fff]/.test(term)
      ? Array.from({ length: term.length - 1 }, (_, offset) => term.slice(offset, offset + 2))
      : [term],
  );
  const entries = index.split('\n').filter((line) => line.startsWith('- ['));
  const overview = entries.find((line) => line.startsWith('- [SD Design]')) || '# SD Design';
  const related = entries
    .map((line) => ({
      line,
      score: terms.reduce((score, term) => score + (line.toLowerCase().includes(term) ? 1 : 0), 0),
    }))
    .filter(({ score, line }) => score > 0 && line !== overview)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ line }) => line);
  return [overview, ...related].join('\n').slice(0, 1000);
}

export function useBrowserChat() {
  const messages = shallowRef<ChatMessage[]>([
    { role: 'user', content: '做 AI 聊天界面可以用哪些组件？' },
    {
      role: 'assistant',
      content: '可以用 Sender 输入问题，用 MarkdownRender 呈现回答。你想了解哪个组件？',
    },
  ]);
  const supported = shallowRef(true);
  const busy = shallowRef(false);
  const preparing = shallowRef(false);
  const progress = shallowRef(0);
  const error = shallowRef('');
  const pending = shallowRef<string>();
  const replying = computed(() => (busy.value && !preparing.value) || pending.value !== undefined);
  let engine: WebWorkerMLCEngine | undefined;
  let worker: Worker | undefined;
  let controller: AbortController | undefined;
  let disposed = false;
  let history: ChatMessage[] = [...messages.value];
  let docIndex = '';
  onMounted(() => {
    supported.value = !!navigator.gpu;
    if (!supported.value) error.value = '当前浏览器不支持 WebGPU，已切换为示例对话。';
    else void run();
  });

  function release() {
    worker?.terminate();
    worker = undefined;
    engine = undefined;
  }
  function stop() {
    controller?.abort();
  }
  function send(value: string) {
    if (!value.trim() || replying.value) return;
    messages.value = [...messages.value, { role: 'user', content: value }];
    if (busy.value) {
      pending.value = value;
      return;
    }
    return run(value);
  }
  async function run(value?: string) {
    if (busy.value) return;
    error.value = '';
    if (!supported.value) {
      if (!value) return;
      messages.value = [
        ...messages.value,
        {
          role: 'assistant',
          content:
            '示例：Sender 用于聊天与 AI 对话输入，支持提交、加载取消和结构化词槽；MarkdownRender 用于呈现 Markdown 回答。',
        },
      ];
      return;
    }
    busy.value = true;
    if (value) pending.value = value;
    const request = new AbortController();
    controller = request;
    const timeout = window.setTimeout(() => request.abort('timeout'), 120_000);
    const aborted = new Promise<never>((_resolve, reject) => {
      request.signal.addEventListener(
        'abort',
        () => {
          release();
          reject(new Error('Aborted'));
        },
        { once: true },
      );
    });
    try {
      if (!engine) {
        preparing.value = true;
        progress.value = 0;
        if (!docIndex) {
          const response = await Promise.race([
            fetch('/llms/llms.txt', { signal: request.signal }),
            aborted,
          ]);
          if (!response.ok) throw new Error('Cannot load llms.txt');
          docIndex = await Promise.race([response.text(), aborted]);
        }
        const { WebWorkerMLCEngine } = await Promise.race([import('@mlc-ai/web-llm'), aborted]);
        if (request.signal.aborted || disposed) return;
        worker = new Worker(new URL('./local-chat.worker.ts', import.meta.url), { type: 'module' });
        const failed = new Promise<never>((_resolve, reject) => {
          worker!.addEventListener('error', () => reject(new Error('Worker failed')), {
            once: true,
          });
        });
        engine = new WebWorkerMLCEngine(worker, {
          appConfig: {
            model_list: [
              {
                model_id: modelId,
                model: modelUrl,
                model_lib: modelLibUrl,
                required_features: ['shader-f16'],
                overrides: { context_window_size: 2048 },
              },
            ],
          },
          initProgressCallback(report) {
            if (!request.signal.aborted && !disposed)
              progress.value =
                Math.round(Math.max(0, Math.min(1, report.progress)) * 10000) / 10000;
          },
        });
        await Promise.race([engine.reload(modelId), aborted, failed]);
      }
      preparing.value = false;
      if (!value) return;
      pending.value = undefined;
      const response = await Promise.race([
        engine.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `You are the SD Design component library documentation assistant.
Use only the llms.txt excerpts below to explain components and link their documentation.
Do not invent APIs, props, code or external data. If the answer is not in these excerpts, say so.
Answer briefly in the user's language.

${getDocContext(docIndex, value + ' ' + (history.filter((message) => message.role === 'user').at(-1)?.content || ''))}`,
            },
            ...history.slice(-6),
            { role: 'user', content: value },
          ],
          max_tokens: 128,
          temperature: 0.2,
        }),
        aborted,
      ]);
      const reply = response.choices[0]?.message.content;
      if (!reply) throw new Error('Empty response');
      if (!request.signal.aborted && !disposed) {
        history = [
          ...history,
          { role: 'user', content: value },
          { role: 'assistant', content: reply },
        ];
        messages.value = [...messages.value, { role: 'assistant', content: reply }];
      }
    } catch (cause) {
      pending.value = undefined;
      release();
      if (!disposed) {
        error.value = request.signal.aborted
          ? request.signal.reason === 'timeout'
            ? '本地模型响应超时，请重试。'
            : '已停止回复'
          : '本地模型加载或运行失败，请检查模型下载网络及浏览器 WebGPU 支持后重试。';
        if (!request.signal.aborted) console.error('Local chat failed:', cause);
      }
    } finally {
      window.clearTimeout(timeout);
      if (!disposed) {
        busy.value = false;
        preparing.value = false;
      }
      controller = undefined;
      if (!disposed && pending.value !== undefined) {
        const next = pending.value;
        pending.value = undefined;
        void run(next);
      }
    }
  }
  onBeforeUnmount(() => {
    disposed = true;
    stop();
    release();
  });
  return { messages, busy, replying, preparing, progress, error, send, stop };
}
