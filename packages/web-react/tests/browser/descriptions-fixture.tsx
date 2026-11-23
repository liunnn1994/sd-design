import { useState } from 'react';

import type { DescData, DescLayout } from '../../src/descriptions/index.js';

import { Button } from '../../src/button/index.js';
import { ConfigProvider } from '../../src/config-provider/index.js';
import { Descriptions, DescriptionsItem } from '../../src/descriptions/index.js';

const initialData: DescData[] = [
  { label: 'A', value: () => <b>第一项</b> },
  { label: 'B', value: '第二项', span: 2 },
  { label: 'C', value: '第三项' },
  { label: 'D', value: '第四项' },
];

export function DescriptionsFixture() {
  const [layout, setLayout] = useState<DescLayout>('horizontal');
  const [fixed, setFixed] = useState(false);
  const [items, setItems] = useState(false);
  const [data, setData] = useState(initialData);
  return (
    <section>
      <select
        aria-label="描述列表布局"
        value={layout}
        onChange={(event) => setLayout(event.target.value as DescLayout)}
      >
        {['horizontal', 'vertical', 'inline-horizontal', 'inline-vertical'].map((value) => (
          <option key={value}>{value}</option>
        ))}
      </select>
      <Button onClick={() => setFixed(!fixed)}>切换固定列数</Button>
      <Button onClick={() => setItems(!items)}>切换描述子项</Button>
      <Button onClick={() => setData([{ label: 'E', value: '替换项', span: 2 }, initialData[0]])}>
        更新描述数据
      </Button>
      <Button onClick={() => setData([])}>清空描述数据</Button>
      <ConfigProvider size="small">
        <Descriptions
          data-testid="descriptions"
          title={<strong>描述标题</strong>}
          layout={layout}
          column={fixed ? 2 : { xs: 1, md: 3 }}
          bordered
          tableLayout="fixed"
          align={{ label: 'right', value: 'center' }}
          labelStyle={{ color: 'rgb(255, 0, 0)' }}
          data={data}
          renderLabel={({ label, index }) => `${index}:${label}`}
        >
          {items ? (
            <>
              <DescriptionsItem label={<em>子项标签</em>} span={2}>
                <Button>子项按钮</Button>
              </DescriptionsItem>
              <DescriptionsItem label="末项">末项正文</DescriptionsItem>
            </>
          ) : undefined}
        </Descriptions>
      </ConfigProvider>
    </section>
  );
}
