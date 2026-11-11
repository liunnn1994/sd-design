/** @jsxImportSource react */
import { Button, MarkdownRender, Space, ThemeProvider } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [dark, setDark] = useState(false);
  const content = [
    '## 临江仙·滚滚长江东逝水',
    '*明·杨慎* · [阅读札记](#theme-notes)',
    '**滚滚长江东逝水**，浪花淘尽英雄。  \n是非成败转头空。青山依旧在，几度夕阳红。',
    '白发渔樵江渚上，惯看秋月春风。  \n一壶浊酒喜相逢。古今多少事，都付笑谈中。',
    '> ==青山依旧在==，*几度夕阳红*。以引用和高亮对照不同主题下的背景与文字。',
    '### 阅读札记',
    '| 意象 | 片段 |\n| :--- | :--- |\n| 长江 | **东逝水** |\n| 青山 | `依旧在` |',
    '- [x] 阅读原词\n- [ ] 整理批注',
    ':::note 局部主题\n这里的文本、链接、表格、复选框与提示块都跟随同一个 ThemeProvider。\n:::',
  ].join('\n\n');

  return (
    <>
      <Space data-v-71363345="" direction={'vertical'} size={'medium'} fill={true}>
        <Button
          data-v-71363345=""
          onClick={() => {
            setDark(!dark);
          }}
        >
          {'切换主题'}
        </Button>
        <ThemeProvider data-v-71363345="" themeMode={dark ? 'dark' : 'light'}>
          <div data-v-71363345="" className={'markdown-theme-panel'}>
            <Space data-v-71363345="" direction={'vertical'} size={'medium'} fill={true}>
              <MarkdownRender data-v-71363345="" content={content} final={true} />
              <Button data-v-71363345="" size={'mini'}>
                {'SD 按钮'}
              </Button>
            </Space>
          </div>
        </ThemeProvider>
      </Space>
      <style>
        {
          '.markdown-theme-panel[data-v-71363345] {\n  padding: 16px;\n  color: var(--sd-color-text-1);\n  background-color: var(--sd-color-bg-2);\n  border: 1px solid var(--sd-color-border-2);\n  border-radius: var(--sd-border-radius-medium);\n}'
        }
      </style>
    </>
  );
}
