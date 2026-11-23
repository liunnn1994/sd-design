import { StrictMode, useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import '../../styles/tag.scss';
import { Tag, type TagProps } from '../../src/tag';

const colors: Pick<TagProps, 'color' | 'bordered' | 'backgroundAlpha'>[] = [
  { color: 'rgba(10, 20, 30, 0.25)', bordered: false },
  { color: 'rgba(10, 20, 30, 0.25)', bordered: false, backgroundAlpha: 0 },
  { color: 'red' },
  { color: 'linear-gradient(90deg, #000000, #ffffff)' },
];

function App() {
  const [checked, setChecked] = useState<boolean | undefined>(false);
  const [visible, setVisible] = useState<boolean | undefined>(true);
  const [color, setColor] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [performant, setPerformant] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const record = (event: string) => setEvents((current) => [...current, event]);
  return (
    <>
      <Tag data-testid="custom-tag" tooltip="标签自定义提示">
        短标签
      </Tag>
      <Tag data-testid="plain-tag" ellipsis={false} tooltip="无省略提示">
        普通标签
      </Tag>
      <Tag data-testid="disabled-tooltip-tag" ellipsisTooltip={false} tooltip="禁用的提示">
        禁用提示
      </Tag>
      <Tag
        data-testid="dynamic-tooltip-tag"
        ellipsisPerformant={performant}
        tooltip={showTooltip ? 'Added tag tip' : undefined}
      >
        Short tag
      </Tag>
      <button onClick={() => setShowTooltip(!showTooltip)}>Toggle tag tip</button>
      <button onClick={() => setPerformant(!performant)}>Toggle performant tag</button>
      <Tag
        data-testid="multiline-tag"
        ellipsisLineClamp={2}
        ellipsisExpandTrigger="click"
        style={{ width: 140 }}
      >
        {'多行标签长内容。'.repeat(10)}
      </Tag>
      <Tag data-testid="check-tag" checkable defaultChecked={false}>
        可选标签
      </Tag>
      <Tag data-testid="controlled-tag" checkable checked={false}>
        受控标签
      </Tag>
      <Tag data-testid="close-tag" closable checkable>
        可关闭标签
      </Tag>
      <Tag data-testid="fixed-tag" visible closable>
        固定显示标签
      </Tag>
      <Tag
        data-testid="released-tag"
        checkable
        closable
        visible={visible}
        checked={checked}
        onVisibleChange={(value) => record(`visible:${value}`)}
        onCheckedChange={(value) => record(`checked:${value}`)}
        onClose={(event) => record(`close:${event.type}`)}
        onCheck={(value, event) => record(`check:${value}:${event.type}`)}
      >
        Release controlled tag
      </Tag>
      <button onClick={() => setChecked(undefined)}>Release checked</button>
      <button onClick={() => setVisible(undefined)}>Release visible</button>
      <output data-testid="tag-events">{events.join('|')}</output>
      <Tag data-testid="color-tag" {...colors[color]}>
        Live color
      </Tag>
      <button onClick={() => setColor((current) => (current + 1) % colors.length)}>
        Change tag color
      </button>
    </>
  );
}

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  ),
);
