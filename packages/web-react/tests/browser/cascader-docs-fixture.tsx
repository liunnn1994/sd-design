import { Button } from '@sdata/web-react';
import {
  Cascader,
  CascaderPanel,
  type CascaderInstance,
  type CascaderModelValue,
  type CascaderOption,
} from '@sdata/web-react/cascader';
import { useRef, useState } from 'react';
import '@sdata/web-react/styles/cascader.scss';

const options: CascaderOption[] = [
  {
    value: 'design',
    label: '设计',
    children: [
      { value: 'visual', label: '视觉设计' },
      { value: 'interaction', label: '交互设计' },
    ],
  },
  {
    value: 'engineering',
    label: '研发',
    children: [
      { value: 'frontend', label: '前端' },
      { value: 'backend', label: '后端' },
      { value: 'archived', label: '归档项目', disabled: true },
    ],
  },
];
const layout = { display: 'grid', gap: 12, maxWidth: 520 } as const;

export default function CascaderDemo() {
  const [value, setValue] = useState<CascaderModelValue>('');
  const ref = useRef<CascaderInstance>(null);
  return (
    <div data-testid="cascader-demo" style={layout}>
      <Cascader
        ref={ref}
        options={options}
        value={value}
        onValueChange={setValue}
        allowSearch
        allowClear
        placeholder="搜索或选择团队"
      />
      <Button onClick={() => ref.current?.focus()}>聚焦级联选择</Button>
      <output aria-live="polite">当前值：{JSON.stringify(value)}</output>
    </div>
  );
}
export function CascaderMultipleDemo() {
  const [value, setValue] = useState<CascaderModelValue>(['frontend']);
  return (
    <div data-testid="cascader-multiple-demo" style={layout}>
      <Cascader
        options={options}
        multiple
        value={value}
        onValueChange={setValue}
        allowClear
        maxTagCount="responsive"
        placeholder="选择多个团队"
      />
      <output>当前值：{JSON.stringify(value)}</output>
    </div>
  );
}
export function CascaderPathDemo() {
  const [value, setValue] = useState<CascaderModelValue>(['design', 'visual']);
  return (
    <div data-testid="cascader-path-demo" style={layout}>
      <Cascader
        options={options}
        pathMode
        value={value}
        onValueChange={setValue}
        expandTrigger="hover"
        separator=" → "
      />
      <output>完整路径：{JSON.stringify(value)}</output>
    </div>
  );
}
const lazyOptions: CascaderOption[] = [{ value: 'region', label: '区域', isLeaf: false }];
export function CascaderLazyDemo() {
  const [value, setValue] = useState<CascaderModelValue>('');
  return (
    <div data-testid="cascader-lazy-demo" style={layout}>
      <Cascader
        options={lazyOptions}
        value={value}
        onValueChange={setValue}
        placeholder="展开以加载区域"
        loadMore={(_, done) => {
          setTimeout(
            () =>
              done([
                { value: 'east', label: '华东', isLeaf: true },
                { value: 'south', label: '华南', isLeaf: true },
              ]),
            500,
          );
        }}
      />
      <output>当前值：{JSON.stringify(value)}</output>
    </div>
  );
}
export function CascaderPanelDemo() {
  const [value, setValue] = useState<CascaderModelValue>('');
  return (
    <div data-testid="cascader-panel-demo" style={layout}>
      <CascaderPanel
        options={options}
        value={value}
        onValueChange={setValue}
        checkStrictly
        tabIndex={0}
        aria-label="独立团队面板"
      />
      <output>可选择父级：{JSON.stringify(value)}</output>
    </div>
  );
}
export function CascaderCustomDemo() {
  const [value, setValue] = useState<CascaderModelValue>('');
  return (
    <div data-testid="cascader-custom-demo" style={layout}>
      <Cascader
        options={options}
        value={value}
        onValueChange={setValue}
        fitWidth
        renderTrigger={(state) => (
          <Button aria-expanded={state.popupVisible}>
            {state.displayValue || '用按钮选择团队'}
          </Button>
        )}
        renderOption={(option) => (
          <span>
            {option.label}
            {option.isLeaf ? ' · 团队' : ' · 部门'}
          </span>
        )}
      />
      <output>当前值：{JSON.stringify(value)}</output>
    </div>
  );
}
