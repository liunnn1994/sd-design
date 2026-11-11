/** @jsxImportSource react */

import {
  Button,
  Dropdown,
  Doption,
  Dgroup,
  Sender,
  SkeletonReveal,
  Tag,
  Space,
  type SenderSlotConfig,
} from '@sdata/web-react';
import { IconPlus, IconDown, IconArrowUp, IconRefresh } from '@sdata/web-react/icon';
import { useMemo, useRef, useState, type ComponentRef } from 'react';

import HomeFileLinks from './HomeFileLinks';
import '../../home/HomeAIWorkbench.scss';

const scenes = ['AI 对话界面', '数据工作台', '知识库'];
const logo = { name: 'android-chrome-192x192.png', url: '/android-chrome-192x192.png' };

export default function HomeAIWorkbench() {
  const [context, setContext] = useState('AI 对话界面');
  const [mode, setMode] = useState('Agent');
  const reveal = useRef<ComponentRef<typeof SkeletonReveal>>(null);
  const sender = useRef<ComponentRef<typeof Sender>>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const slots = useMemo<SenderSlotConfig[]>(
    () => [
      { type: 'text', value: '用 SD Design 构建 ' },
      {
        type: 'select',
        key: `scene-${context}`,
        props: { options: scenes, defaultValue: scenes.includes(context) ? context : scenes[0] },
      },
      { type: 'text', value: '，要求 ' },
      {
        type: 'input',
        key: 'detail',
        props: { defaultValue: '清晰、轻量', placeholder: '补充要求' },
      },
      { type: 'text', value: '，参考 ' },
      {
        type: 'custom',
        key: 'example-logo',
        props: { defaultValue: logo.name },
        customRender: (_value, _change, state) => (
          <HomeFileLinks source={logo} type="image" onRemove={state.remove} />
        ),
      },
      { type: 'text', value: '。' },
    ],
    [context],
  );
  function addFiles(incoming: FileList) {
    const additions = Array.from(incoming).flatMap<SenderSlotConfig>((source) => {
      const type = source.type.startsWith('image/')
        ? 'image'
        : source.type.startsWith('video/')
          ? 'video'
          : source.type.startsWith('audio/')
            ? 'audio'
            : source.type === 'application/pdf' || /\.pdf$/i.test(source.name)
              ? 'pdf'
              : /\.(md|markdown)$/i.test(source.name) || source.type === 'text/markdown'
                ? 'markdown'
                : undefined;
      return type
        ? [
            {
              type: 'custom',
              key: `file-${crypto.randomUUID()}`,
              props: { defaultValue: source.name },
              customRender: (_value, _change, state) => (
                <HomeFileLinks source={source} type={type} onRemove={state.remove} />
              ),
            },
          ]
        : [];
    });
    if (additions.length) sender.current?.insert(additions, 'cursor');
  }
  return (
    <div className="home-workbench">
      <SkeletonReveal ref={reveal}>
        <Sender
          ref={sender}
          slotConfig={slots}
          placeholder="描述你想构建的组件或界面…"
          suffixPlacement="footer"
          autoSize={{ minRows: 2, maxRows: 5 }}
          onPasteFile={addFiles}
          slots={{
            footer: () => (
              <Space size={8}>
                <Dropdown
                  trigger="click"
                  position="bl"
                  onSelect={(value) => {
                    if (value === 'file') fileInput.current?.click();
                    if (value === 'library') setContext('SD Design');
                  }}
                  content={
                    <>
                      <Doption value="file">添加文件</Doption>
                      <Doption value="library">添加组件库</Doption>
                    </>
                  }
                >
                  <Button shape="circle" type="outline" aria-label="添加内容">
                    <IconPlus />
                  </Button>
                </Dropdown>
                {context && (
                  <Tag className="home-workbench__context" closable onClose={() => setContext('')}>
                    {context}
                  </Tag>
                )}
              </Space>
            ),
            suffix: ({ actions }) => (
              <Space size={8}>
                <Dropdown
                  trigger="click"
                  position="br"
                  popupMaxHeight={false}
                  onSelect={(value) => {
                    if (value === 'Agent' || value === 'Ask') setMode(value);
                  }}
                  content={
                    <>
                      <Dgroup title="工作方式">
                        <Doption value="Agent">智能体</Doption>
                        <Doption value="Ask">提问</Doption>
                      </Dgroup>
                      <Dgroup title="构建方式">
                        <Doption>
                          <a href="/">Vue 3</a>
                        </Doption>
                        <Doption>
                          <a href="/react/">React</a>
                        </Doption>
                      </Dgroup>
                    </>
                  }
                >
                  <Button type="outline" aria-label="选择工作方式">
                    {mode === 'Agent' ? '智能体' : '提问'} <IconDown />
                  </Button>
                </Dropdown>
                <Button
                  type="primary"
                  shape="circle"
                  disabled={actions.submitDisabled}
                  aria-label="发送需求"
                  onClick={() => actions.send()}
                >
                  <IconArrowUp />
                </Button>
              </Space>
            ),
          }}
        />
      </SkeletonReveal>
      <input
        ref={fileInput}
        className="home-workbench__file"
        type="file"
        multiple
        accept="image/*,video/*,audio/*,application/pdf,.md,.markdown,text/markdown"
        aria-label="选择参考文件"
        onChange={(event) => {
          if (event.target.files) addFiles(event.target.files);
          event.target.value = '';
        }}
      />
      <div className="home-workbench__below">
        <Button
          type="text"
          shape="circle"
          aria-label="重播入场"
          onClick={() => reveal.current?.replay()}
        >
          <IconRefresh />
        </Button>
      </div>
    </div>
  );
}
