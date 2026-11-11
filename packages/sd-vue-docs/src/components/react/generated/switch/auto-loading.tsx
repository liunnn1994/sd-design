import { Space, Switch, type SwitchProps } from '@sdata/web-react';
import { useEffect, useRef, useState } from 'react';

function DelayedSwitch({ type }: Pick<SwitchProps, 'type'>) {
  const [value, setValue] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <Switch
      value={value}
      type={type}
      autoLoading
      onChange={(next) => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setValue(Boolean(next)), 1000);
      }}
    />
  );
}

export default function Example() {
  return (
    <Space>
      <DelayedSwitch />
      <DelayedSwitch type="round" />
      <DelayedSwitch type="line" />
    </Space>
  );
}
