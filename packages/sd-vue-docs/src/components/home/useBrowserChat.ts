import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue';

type Availability = 'unavailable' | 'downloadable' | 'downloading' | 'available';
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
interface BrowserSession {
  prompt(value: string, options: { signal: AbortSignal }): Promise<string>;
  destroy(): void;
}
interface BrowserModel {
  availability(): Promise<Availability>;
  create(options: {
    signal: AbortSignal;
    initialPrompts: { role: 'system'; content: string }[];
    monitor: (monitor: EventTarget) => void;
  }): Promise<BrowserSession>;
}

export function useBrowserChat() {
  const messages = shallowRef<ChatMessage[]>([
    { role: 'user', content: '这次发布，有哪些重点？' },
    { role: 'assistant', content: '可以从更新亮点、发布渠道和下一步行动来整理。' },
  ]);
  const availability = shallowRef<Availability>('unavailable');
  const busy = shallowRef(false);
  const checking = shallowRef(true);
  const preparing = shallowRef(false);
  const download = shallowRef<number | null>(null);
  const error = shallowRef('');
  let model: BrowserModel | undefined;
  let session: BrowserSession | undefined;
  let controller: AbortController | undefined;
  let disposed = false;
  const status = computed(() =>
    checking.value
      ? '检测中…'
      : busy.value
        ? preparing.value
          ? download.value === null
            ? '准备模型…'
            : download.value === 100
              ? '加载模型…'
              : `下载模型 ${download.value}%`
          : '正在回复…'
        : availability.value === 'available'
          ? '浏览器 AI'
          : availability.value === 'unavailable'
            ? '示例对话'
            : '模型待准备',
  );

  onMounted(async () => {
    model = (window as Window & { LanguageModel?: BrowserModel }).LanguageModel;
    try {
      if (model) availability.value = await model.availability();
    } catch {
      availability.value = 'unavailable';
    } finally {
      checking.value = false;
    }
  });

  function stop() {
    controller?.abort();
    session?.destroy();
    session = undefined;
  }
  async function send(value: string) {
    if (checking.value || busy.value || !value.trim()) return;
    error.value = '';
    messages.value = [...messages.value, { role: 'user', content: value }];
    if (!model || availability.value === 'unavailable') {
      messages.value = [
        ...messages.value,
        {
          role: 'assistant',
          content: '示例：先提炼三个核心亮点，再安排发布渠道，最后收集用户反馈。',
        },
      ];
      return;
    }
    busy.value = true;
    const request = new AbortController();
    controller = request;
    try {
      // create() runs directly from the send gesture, including model download if needed.
      if (!session) {
        preparing.value = true;
        const created = await model.create({
          signal: request.signal,
          monitor(monitor) {
            monitor.addEventListener(
              'downloadprogress',
              (event) => {
                if (request.signal.aborted || disposed) return;
                const { loaded, total } = event as ProgressEvent;
                download.value = Math.min(100, Math.round((loaded / (total || 1)) * 100));
              },
              { signal: request.signal },
            );
          },
          initialPrompts: [
            {
              role: 'system',
              content:
                "You are a concise product assistant. Answer in at most three short bullet points. Use the user's language when supported, otherwise English.",
            },
          ],
        });
        if (request.signal.aborted || disposed) {
          created.destroy();
          return;
        }
        session = created;
      }
      preparing.value = false;
      const reply = await session.prompt(value, { signal: request.signal });
      if (!request.signal.aborted && !disposed) {
        messages.value = [...messages.value, { role: 'assistant', content: reply }];
        availability.value = 'available';
      }
    } catch {
      if (!disposed)
        error.value = request.signal.aborted
          ? '已停止回复'
          : '浏览器 AI 暂时无法回复，请稍后重试。';
      session?.destroy();
      session = undefined;
    } finally {
      if (!disposed) {
        busy.value = false;
        preparing.value = false;
        download.value = null;
      }
    }
  }
  onBeforeUnmount(() => {
    disposed = true;
    stop();
  });
  return { messages, busy, checking, status, error, send, stop };
}
