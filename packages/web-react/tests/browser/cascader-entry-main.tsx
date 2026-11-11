import { Cascader as RootCascader, CascaderPanel as RootPanel } from '@sdata/web-react';
import CascaderDefault, {
  Cascader,
  CascaderPanel,
  type CascaderOption,
  type CascaderModelValue,
} from '@sdata/web-react/cascader';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@sdata/web-react/styles/cascader.scss';

const options: CascaderOption[] = [
  { value: 'root', label: 'Root', children: [{ value: 'leaf', label: 'Leaf' }] },
];
function Fixture() {
  const [value, setValue] = useState<CascaderModelValue>('');
  return (
    <>
      <output data-testid="identity">
        {String(
          CascaderDefault === Cascader &&
            Cascader.CascaderPanel === CascaderPanel &&
            RootCascader === Cascader &&
            RootPanel === CascaderPanel,
        )}
      </output>
      <Cascader
        aria-label="Cascader"
        options={options}
        style={{ width: 250 }}
        onValueChange={setValue}
      />
      <Cascader.CascaderPanel data-testid="standalone" options={options} onValueChange={setValue} />
      <output data-testid="value">{JSON.stringify(value)}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
