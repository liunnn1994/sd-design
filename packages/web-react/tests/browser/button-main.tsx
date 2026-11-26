import React, { StrictMode, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { Button, ButtonGroup } from '../../src/button';
import { ConfigProvider } from '../../src/config-provider';
import IconPlus from '../../src/icon/icon-plus';
import '../../styles/button.scss';
import '../../styles/config-provider.scss';

function Fixture() {
  const [clicks, setClicks] = useState(0);
  const [spacing, setSpacing] = useState(true);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState(false);
  const [submissions, setSubmissions] = useState(0);
  const [groupDisabled, setGroupDisabled] = useState(false);
  const [groupClicks, setGroupClicks] = useState(0);
  return (
    <>
      <button onClick={() => setTooltip(!tooltip)}>Toggle help</button>
      <Button id="action" tooltipContent={tooltip ? 'Dynamic help' : undefined}>
        Action
      </Button>
      <button onClick={() => setLoading(false)}>Ready</button>
      <Button icon={<IconPlus />} aria-label="Optional label">
        {loading ? '' : 'Label'}
      </Button>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmissions((count) => count + 1);
        }}
      >
        <Button htmlType="submit" loading={loading} loadingFixedWidth icon={<IconPlus />}>
          Submit
        </Button>
        <output>{submissions}</output>
      </form>
      <button onClick={() => setGroupDisabled(!groupDisabled)}>Toggle button group disabled</button>
      <ButtonGroup
        type="primary"
        size="small"
        status="danger"
        shape="round"
        disabled={groupDisabled}
      >
        <Button
          icon={<IconPlus />}
          srOnly="Add"
          onClick={() => setGroupClicks((count) => count + 1)}
        />
        <Button type="dashed" size="large" status="warning" shape="circle">
          Override
        </Button>
        <Button
          href="#button-destination"
          disabled={false}
          onClick={() => setGroupClicks((count) => count + 1)}
          style={{ width: 108 }}
        >
          Group link with a long title
        </Button>
      </ButtonGroup>
      <output id="button-destination" data-testid="group-clicks">
        {groupClicks}
      </output>
      <div style={{ width: 300 }}>
        <Button long className="custom-action" aria-label="Full width action">
          Full width
        </Button>
      </div>
      <Button tooltip="按钮提示内容">带提示按钮</Button>
      <Button
        tooltip={{ content: '原始提示', position: 'bottom' }}
        tooltipContent={<strong>覆盖提示内容</strong>}
      >
        自定义提示按钮
      </Button>
      <Button onClick={() => setClicks((count) => count + 1)}>普通按钮</Button>
      <Button loading onClick={() => setClicks((count) => count + 1)}>
        加载按钮
      </Button>
      <Button href="#target" loading onClick={() => setClicks((count) => count + 1)}>
        加载链接
      </Button>
      <ButtonGroup disabled>
        <Button disabled={false}>组内禁用</Button>
      </ButtonGroup>
      <output data-testid="clicks">{clicks}</output>
      <ConfigProvider autoInsertSpaceInButton={spacing}>
        <Button ref={buttonRef} data-testid="chinese-button">
          保存
        </Button>
      </ConfigProvider>
      <Button onClick={() => setSpacing(!spacing)}>切换字间距</Button>
      <Button onClick={() => buttonRef.current?.focus()}>聚焦保存</Button>
    </>
  );
}

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Fixture />
    </StrictMode>,
  ),
);
