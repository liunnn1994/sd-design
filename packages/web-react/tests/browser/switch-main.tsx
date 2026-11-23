import React, { StrictMode, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { Switch } from '../../src/switch';
import '../../styles/switch.scss';

function Fixture() {
  const zeroSwitchText = new URLSearchParams(location.search).has('zero-switch-text');
  const [value, setValue] = useState(false);
  const [changes, setChanges] = useState(0);
  const [autoValue, setAutoValue] = useState(false);
  const [typedValue, setTypedValue] = useState<SwitchValue>('off');
  const [ownsLoading, setOwnsLoading] = useState(true);
  const [mounted, setMounted] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const finish = useRef<(approved: boolean) => void>(undefined);
  return (
    <>
      <Switch
        aria-label="默认开启"
        defaultChecked
        checkedText={zeroSwitchText ? 0 : undefined}
        uncheckedText={zeroSwitchText ? 0 : undefined}
      />
      <Switch aria-label="受控" value={value} onChange={(next) => setValue(Boolean(next))} />
      <Switch
        aria-label="锁定受控"
        value={false}
        onChange={() => setChanges((count) => count + 1)}
      />
      <Switch
        aria-label="异步校验"
        beforeChange={() => new Promise((resolve) => setTimeout(() => resolve(true), 150))}
        onChange={() => setChanges((count) => count + 1)}
      />
      <Switch aria-label="拒绝切换" beforeChange={() => false} />
      <Switch aria-label="禁用" disabled />
      <Switch
        aria-label="自动加载"
        value={autoValue}
        autoLoading
        onChange={(next) => setTimeout(() => setAutoValue(Boolean(next)), 300)}
      />
      <Switch aria-label="拒绝异步" beforeChange={() => Promise.reject(new Error('取消'))} />
      <output data-testid="changes">{changes}</output>
      <Switch
        aria-label="Typed value"
        checkedValue={0}
        uncheckedValue="off"
        value={typedValue}
        type="line"
        checkedColor="#ff0000"
        uncheckedColor="#0000ff"
        onChange={setTypedValue}
      />
      <output data-testid="typed-value">{JSON.stringify(typedValue)}</output>
      <button onClick={() => setOwnsLoading(!ownsLoading)}>Toggle explicit loading</button>
      <Switch
        aria-label="Loading ownership"
        value={false}
        autoLoading
        {...(ownsLoading ? { loading: false } : {})}
      />
      {mounted && (
        <Switch
          aria-label="Deferred switch"
          disabled={disabled}
          beforeChange={() =>
            new Promise<boolean>((resolve) => {
              finish.current = resolve;
            })
          }
          onChange={() => setChanges((count) => count + 1)}
        />
      )}
      <button onClick={() => setDisabled(!disabled)}>Toggle deferred disabled</button>
      <button onClick={() => setMounted(!mounted)}>Toggle deferred mount</button>
      <button onClick={() => finish.current?.(true)}>Resolve deferred switch</button>
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
import type { SwitchValue } from '../../src/switch';
