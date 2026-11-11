/** @jsxImportSource react */
import { Button, MarkdownRender, Space, Tag } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const initial = '## 临江仙·滚滚长江东逝水\n\n明·杨慎\n\n**滚滚长江';
  const chunks = [
    '东逝水**，浪花淘尽英雄。  \n是非成败转头空。青山依旧在，几度夕阳红。\n\n',
    '白发渔樵江渚上，惯看秋月春风。  \n一壶浊酒喜相逢。古今多少事，都付笑谈中。\n\n> **青山依旧在**，*几度夕阳红*。\n\n### 阅读札记\n\n- **长江**：',
    '时间流逝的意象\n- *青山*：世事变迁中的恒常\n- `渔樵`：回望历史的视角\n\n- [x] 读完上阕\n- [ ] 整理下阕笔记\n\n',
    '| 意象 | 诗句 |\n| :--- | :--- |\n| 长江 | 滚滚长江东逝水 |\n| 青山 | 青山依旧在 |\n| 浊酒 | 一壶浊酒喜相逢 |\n\n### 诗词数据\n\n```typescript\nconst poem = {\n  title: "临江仙·滚滚长江东逝水",\n',
    '  author: "杨慎",\n  dynasty: "明",\n}\n```\n\n',
    '“古今多少事，都付笑谈中。”[^note]\n\n[^note]: 本例以诗词为中文排版内容，最后一批完成后设置 `final=true`。\n\n:::tip 传输完成\n诗词、引用、列表、表格、代码和脚注均已追加完成。\n:::',
  ];
  const [content, setContent] = useState(initial);
  const [step, setStep] = useState(0);
  const [final, setFinal] = useState(false);
  function advance() {
    if (final) return;
    setContent((previous) => previous + chunks[step]);
    setStep((previous) => previous + 1);
    setFinal(step + 1 === chunks.length);
  }
  function reset() {
    setContent(initial);
    setStep(0);
    setFinal(false);
  }

  return (
    <>
      <Space direction={'vertical'} size={'medium'} fill={true}>
        <Space wrap={true}>
          <Button disabled={final} onClick={advance}>
            {'追加内容'}
          </Button>
          <Button onClick={reset}>{'重置'}</Button>
          <Tag color={final ? 'green' : 'blue'}>
            {formatValue(step)}
            {'/'}
            {formatValue(chunks.length)}
            {' · '}
            {formatValue(final ? '传输完成' : '传输中')}
          </Tag>
        </Space>
        <MarkdownRender content={content} final={final} />
      </Space>
    </>
  );
}
