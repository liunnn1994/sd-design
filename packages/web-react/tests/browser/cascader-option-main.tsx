import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { TagProps } from '../../src/tag/index.js';

import { CascaderContext } from '../../src/cascader/context.js';
import { CascaderOptionView } from '../../src/cascader/option.js';
import { useCascaderOptions } from '../../src/cascader/use-options.js';
import { useCascaderSelection } from '../../src/cascader/use-selection.js';
import { Checkbox } from '../../src/checkbox/index.js';
import '../../../web-core/styles/cascader/style/index.scss';
import '../../styles/checkbox.scss';
import '../../styles/radio.scss';
import '../../styles/ellipsis.scss';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const multiple = query.has('multiple');
  const checkStrictly = query.has('strict');
  const [active, setActiveKey] = useState<string>();
  const [path, setSelectedPath] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [custom, setCustom] = useState(false);
  const [formatted, setFormatted] = useState(false);
  const [ellipsis, setEllipsis] = useState<boolean | 'performant-ellipsis'>(false);
  const data = useCascaderOptions<TagProps>({
    checkStrictly,
    options: [
      {
        value: 'root',
        label: 'Root',
        children: [
          { value: 'one', label: 'One' },
          { value: 'two', label: 'Two' },
          { value: 'locked', label: 'Locked', disabled: true },
          {
            value: 'unselectable',
            label: 'Unselectable',
            children: [{ value: 'locked-child', disabled: true }],
          },
        ],
      },
    ],
  });
  const selection = useCascaderSelection(
    { multiple, checkStrictly },
    { ...data, setActiveKey, setSelectedPath },
  );
  return (
    <>
      <button onClick={() => setLoading((value) => !value)}>Loading</button>
      <button onClick={() => setCustom(true)}>Custom</button>
      <button onClick={() => setFormatted(true)}>Format</button>
      <button onClick={() => setEllipsis(true)}>Ellipsis</button>
      <button onClick={() => setEllipsis('performant-ellipsis')}>Performant</button>
      <Checkbox.Group value={['unrelated']}>
        <CascaderContext
          value={{
            valueMap: selection.valueMap,
            onClickOption: selection.foundation.click,
            setActiveKey,
            setSelectedPath,
            loadOption: () => {},
            isLoading: () => loading,
            expandTrigger: query.has('hover') ? 'hover' : 'click',
            ellipsis,
            separator: ' > ',
            formatLabel: formatted
              ? (options) => options.map((item) => item.label).join(' / ')
              : undefined,
            renderOption: custom ? (option) => <strong>Custom {option.label}</strong> : undefined,
          }}
        >
          <ul style={{ width: 240 }}>
            {[...data.optionMap.values()].map((option) => (
              <CascaderOptionView
                key={option.key}
                data-testid={option.value as string}
                option={option}
                active={active === option.key}
                multiple={multiple}
                checkStrictly={checkStrictly}
                pathLabel={query.has('path')}
                searchOption={query.has('search')}
              />
            ))}
          </ul>
        </CascaderContext>
      </Checkbox.Group>
      <output data-testid="active">{active}</output>
      <output data-testid="path">{path}</output>
      <output data-testid="value">{JSON.stringify(selection.value)}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
