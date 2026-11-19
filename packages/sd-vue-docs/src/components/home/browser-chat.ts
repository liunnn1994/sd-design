/// <reference types="vite/client" />
import type { InitProgressReport, WebWorkerMLCEngine } from '@mlc-ai/web-llm';

import type { DocsFramework } from '../../utils/framework-navigation.ts';

import { frameworkHref } from '../../utils/framework-navigation.ts';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
export interface BrowserChatSnapshot {
  messages: ChatMessage[];
  supported: boolean;
  busy: boolean;
  preparing: boolean;
  progress: number;
  error: string;
  pending: string | undefined;
  replying: boolean;
}

// Keep the model weights, WASM and WebLLM version in sync for both view adapters.
const modelLibBase =
  'https://cdn.jsdelivr.net/gh/mlc-ai/binary-mlc-llm-libs@146ed9cd4b4062e967b017fd2291f7106b50599f/web-llm-models/v0_2_87/base';

function getDocContext(index: string, question: string, framework: DocsFramework) {
  const terms = (question.toLowerCase().match(/[a-z][a-z0-9-]*|[一-鿿]{2,}/g) || []).flatMap(
    (term) =>
      /[一-鿿]/.test(term)
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
  const result = [overview, ...related].join('\n').slice(0, 1000);
  if (framework === 'vue') return result;
  return result.replace(/\]\(([^)]+)\)/g, (match, href: string) => {
    const url = new URL(href, 'https://sd-design.js.org');
    if (!/^\/(components|guides)\//.test(url.pathname)) return match;
    const path = frameworkHref(url.pathname, framework);
    return `](${href.startsWith('http') ? url.origin : ''}${path}${url.hash})`;
  });
}

export function createBrowserChat(framework: DocsFramework = 'vue') {
  let state: BrowserChatSnapshot = {
    messages: [
      { role: 'user', content: '做 AI 聊天界面可以用哪些组件？' },
      {
        role: 'assistant',
        content: '可以用 Sender 输入问题，用 MarkdownRender 呈现回答。你想了解哪个组件？',
      },
    ],
    supported: true,
    busy: false,
    preparing: false,
    progress: 0,
    error: '',
    pending: undefined,
    replying: false,
  };
  const listeners = new Set<() => void>();
  const update = (patch: Partial<BrowserChatSnapshot>) => {
    const next = { ...state, ...patch };
    state = { ...next, replying: (next.busy && !next.preparing) || next.pending !== undefined };
    for (const listener of listeners) listener();
  };
  let engine: WebWorkerMLCEngine | undefined;
  let worker: Worker | undefined;
  let controller: AbortController | undefined;
  let disposed = false;
  let history: ChatMessage[] = [...state.messages];
  let docIndex = '';

  function release() {
    worker?.terminate();
    worker = undefined;
    engine = undefined;
  }
  function stop() {
    controller?.abort();
  }
  function start() {
    disposed = false;
    const supported = !!navigator.gpu;
    update({ supported, error: supported ? '' : '当前浏览器不支持 WebGPU，已切换为示例对话。' });
    if (supported) void run();
  }
  function send(value: string) {
    if (!value.trim() || state.replying) return;
    update({ messages: [...state.messages, { role: 'user', content: value }] });
    if (state.busy) {
      update({ pending: value });
      return;
    }
    return run(value);
  }
  async function run(value?: string) {
    if (state.busy || disposed) return;
    update({ error: '' });
    if (!state.supported) {
      if (value)
        update({
          messages: [
            ...state.messages,
            {
              role: 'assistant',
              content:
                '示例：Sender 用于聊天与 AI 对话输入，支持提交、加载取消和结构化词槽；MarkdownRender 用于呈现 Markdown 回答。',
            },
          ],
        });
      return;
    }
    update({ busy: true, ...(value ? { pending: value } : {}) });
    const request = new AbortController();
    controller = request;
    const current = () => !disposed && controller === request;
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
        update({ preparing: true, progress: 0 });
        if (!docIndex) {
          const response = await Promise.race([
            fetch(
              `${import.meta.env?.BASE_URL ?? '/'}${framework === 'react' ? 'react/' : ''}llms/llms.txt`,
              { signal: request.signal },
            ),
            aborted,
          ]);
          if (!response.ok)
            throw new Error('Cannot load llms.txt (' + response.status + '): ' + response.url);
          docIndex = await Promise.race([response.text(), aborted]);
        }
        const [{ WebWorkerMLCEngine }, adapter] = await Promise.race([
          Promise.all([
            import('@mlc-ai/web-llm'),
            navigator.gpu.requestAdapter({ powerPreference: 'high-performance' }),
          ]),
          aborted,
        ]);
        if (request.signal.aborted || !current()) return;
        if (!adapter) throw new Error('No WebGPU adapter available');
        const shaderF16 = adapter.features.has('shader-f16');
        const quantization = shaderF16 ? 'q4f16_1' : 'q4f32_1';
        const model = `SmolLM2-135M-Instruct-${quantization}`;
        const modelId = `${model}-MLC`;
        const revision = shaderF16
          ? 'ef2811e091465a80a2eb737fb46e91c4197a43fa'
          : '72b483449ac59d39238d9e63d4c363d746f75a13';
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
                model: `https://modelscope.cn/models/mlc-ai/${modelId}/resolve/${revision}/`,
                model_lib: `${modelLibBase}/${model}_cs1k-webgpu.wasm`,
                required_features: shaderF16 ? ['shader-f16'] : [],
                overrides: { context_window_size: 2048 },
              },
            ],
          },
          initProgressCallback(report: InitProgressReport) {
            if (!request.signal.aborted && current())
              update({
                progress: Math.round(Math.max(0, Math.min(1, report.progress)) * 10000) / 10000,
              });
          },
        });
        await Promise.race([engine.reload(modelId), aborted, failed]);
      }
      if (!current()) return;
      update({ preparing: false });
      if (!value) return;
      update({ pending: undefined });
      const response = await Promise.race([
        engine.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `You are the SD Design component library documentation assistant.
Use only the llms.txt excerpts below to explain components and link their documentation.
Do not invent APIs, props, code or external data. If the answer is not in these excerpts, say so.
Answer briefly in the user's language.

${getDocContext(docIndex, value + ' ' + (history.filter((message) => message.role === 'user').at(-1)?.content || ''), framework)}`,
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
      if (!request.signal.aborted && current()) {
        history = [
          ...history,
          { role: 'user', content: value },
          { role: 'assistant', content: reply },
        ];
        update({ messages: [...state.messages, { role: 'assistant', content: reply }] });
      }
    } catch (cause) {
      if (current()) {
        release();
        update({
          pending: undefined,
          error: request.signal.aborted
            ? request.signal.reason === 'timeout'
              ? '本地模型响应超时，请重试。'
              : '已停止回复'
            : '本地模型加载或运行失败，请检查模型下载网络及浏览器 WebGPU 支持后重试。',
        });
        if (!request.signal.aborted) console.error('Local chat failed:', cause);
      }
    } finally {
      window.clearTimeout(timeout);
      if (current()) {
        update({ busy: false, preparing: false });
        controller = undefined;
        if (state.pending !== undefined) {
          const next = state.pending;
          update({ pending: undefined });
          void run(next);
        }
      }
    }
  }
  function dispose() {
    disposed = true;
    stop();
    release();
    controller = undefined;
    update({ busy: false, preparing: false, pending: undefined });
  }
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    start,
    send,
    stop,
    dispose,
  };
}
