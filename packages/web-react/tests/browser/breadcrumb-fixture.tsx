import { useState } from 'react';

import { Breadcrumb, BreadcrumbItem } from '../../src/breadcrumb/index.js';
import { Button } from '../../src/button/index.js';
import { Doption } from '../../src/dropdown/index.js';

export function BreadcrumbFixture() {
  const [custom, setCustom] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [selected, setSelected] = useState('');
  const [maxCount, setMaxCount] = useState(2);
  const routes = [
    { path: '/home', label: '首页' },
    {
      path: 'section',
      label: '目录',
      children: [
        { path: 'child', label: '下拉路径' },
        { path: 'child', label: '同路径选项' },
      ],
    },
    { path: 'detail', label: '详情' },
  ];
  return (
    <section>
      <Button onClick={() => setCustom(!custom)}>切换面包屑来源</Button>
      <Button onClick={() => setEnabled(!enabled)}>切换面包屑下拉</Button>
      <Button onClick={() => setMaxCount(maxCount ? 0 : 2)}>切换面包屑限制</Button>
      <output data-testid="breadcrumb-selected">{selected}</output>
      <Breadcrumb
        data-testid="dynamic-breadcrumb"
        maxCount={maxCount}
        routes={routes}
        separator="/"
        moreIcon={<b>更多路径</b>}
      >
        {custom ? (
          <>
            <Breadcrumb.Item>A</Breadcrumb.Item>
            <>
              <Breadcrumb.Item>B</Breadcrumb.Item>
              <Breadcrumb.Item>C</Breadcrumb.Item>
            </>
            <Breadcrumb.Item>D</Breadcrumb.Item>
            <Breadcrumb.Item>E</Breadcrumb.Item>
          </>
        ) : undefined}
      </Breadcrumb>
      <Breadcrumb data-testid="custom-breadcrumb" separator={<b>→</b>}>
        <BreadcrumbItem
          separator="-"
          dropdownContent={enabled ? <Doption value="custom">自定义路径</Doption> : undefined}
          dropdownProps={{ onSelect: (value) => setSelected(String(value)) }}
        >
          动态首页
        </BreadcrumbItem>
        <BreadcrumbItem>当前页</BreadcrumbItem>
      </Breadcrumb>
      <Breadcrumb
        data-testid="url-breadcrumb"
        routes={routes}
        customUrl={(paths) => `/browse/${paths.join('/')}`}
      />
      <Breadcrumb
        data-testid="render-breadcrumb"
        routes={routes}
        itemRender={({ route, paths }) => (
          <span data-paths={paths.join('|')}>{route.label}渲染</span>
        )}
      />
    </section>
  );
}
