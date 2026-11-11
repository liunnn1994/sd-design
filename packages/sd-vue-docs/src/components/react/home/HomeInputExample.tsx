/** @jsxImportSource react */

import {
  Sender,
  Scrollbar,
  MarkdownRender,
  Progress,
  type SenderSlotConfig,
} from '@sdata/web-react';
import { useEffect, useRef, type ComponentRef } from 'react';

import { useBrowserChat } from './useBrowserChat';
import '../../home/HomeInputExample.scss';

const slots: SenderSlotConfig[] = [
  { type: 'text', value: '介绍一下 ' },
  { type: 'input', key: 'topic', props: { defaultValue: 'Sender', placeholder: '组件名称' } },
  { type: 'text', value: ' 的用途。' },
];

export default function HomeInputExample() {
  const { messages, busy, replying, preparing, progress, error, send, stop } = useBrowserChat();
  const scrollbar = useRef<ComponentRef<typeof Scrollbar>>(null);
  const sender = useRef<ComponentRef<typeof Sender>>(null);
  const following = useRef(true);
  const frame = useRef(0);
  function followReply() {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      if (!following.current) return;
      scrollbar.current?.update();
      const viewport = scrollbar.current?.elements()?.scrollOffsetElement;
      if (viewport) scrollbar.current?.scrollTop(viewport.scrollHeight);
    });
  }
  useEffect(() => {
    followReply();
    return () => cancelAnimationFrame(frame.current);
  }, [messages, busy]);
  return (
    <div className="home-input-example">
      <div className="home-input-example__heading">
        <img src="/logo-icon.png" alt="" width={22} height={22} />
        <strong>组件助手</strong>
        {preparing && (
          <Progress
            className="home-input-example__progress"
            size="mini"
            percent={progress}
            showText={false}
            aria-label="模型加载进度"
          />
        )}
      </div>
      <Scrollbar
        ref={scrollbar}
        outerStyle={{ height: '240px' }}
        onScroll={() => {
          const viewport = scrollbar.current?.elements()?.scrollOffsetElement;
          if (viewport)
            following.current =
              viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop < 32;
        }}
      >
        <ol
          className="home-input-example__messages"
          role="log"
          aria-label="对话记录"
          aria-live="polite"
        >
          {messages.map((message, index) => (
            <li key={index} className={message.role}>
              {message.role === 'assistant' ? (
                <>
                  <img src="/logo-icon.png" alt="助手" width={22} height={22} />
                  <div className="home-input-example__bubble">
                    <MarkdownRender
                      content={message.content}
                      final
                      batchRendering={false}
                      nodeVirtual={false}
                      style={{ contentVisibility: 'visible', containIntrinsicSize: 'none' }}
                      onRenderSettled={followReply}
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="home-input-example__bubble">{message.content}</p>
                  <span className="home-input-example__avatar" aria-label="你">
                    你
                  </span>
                </>
              )}
            </li>
          ))}
          {busy && !preparing && (
            <li className="assistant">
              <p className="home-input-example__bubble">正在回复…</p>
            </li>
          )}
        </ol>
      </Scrollbar>
      <Sender
        ref={sender}
        slotConfig={slots}
        placeholder="输入组件问题，例如：如何使用 Sender？"
        autoSize={{ minRows: 2, maxRows: 3 }}
        loading={replying}
        onSubmit={(value) => {
          if (replying || !value.trim()) return;
          following.current = true;
          void send(value);
          sender.current?.clear();
        }}
        onCancel={stop}
      />
      {error && (
        <span className="home-input-example__error" role="status">
          {error}
        </span>
      )}
    </div>
  );
}
