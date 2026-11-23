import { StrictMode, useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { Button } from '../../src/button';
import { Cascader } from '../../src/cascader';
import { ConfigProvider } from '../../src/config-provider';
import { Input } from '../../src/input';
import { List } from '../../src/list';
import enUS from '../../src/locale/lang/en-us';
import { Select } from '../../src/select';
import { Spin } from '../../src/spin';
import { Tag } from '../../src/tag';
import { TreeSelect } from '../../src/tree-select';
import '../../styles/button.scss';
import '../../styles/cascader.scss';
import '../../styles/config-provider.scss';
import '../../styles/input.scss';
import '../../styles/list.scss';
import '../../styles/select.scss';
import '../../styles/spin.scss';
import '../../styles/tag.scss';
import '../../styles/tree-select.scss';

const choices = [
  { label: 'Beijing', value: 'beijing' },
  { label: 'Shanghai', value: 'shanghai' },
];
const nodes = [{ title: 'Beijing', key: 'beijing' }];

function Fixture() {
  const [compact, setCompact] = useState(false);
  const [override, setOverride] = useState(false);
  const [customContent, setCustomContent] = useState(false);
  const [english, setEnglish] = useState(false);
  const [search, setSearch] = useState(false);
  const [customPrefix, setCustomPrefix] = useState(false);
  return (
    <>
      <button onClick={() => setCompact(!compact)}>Toggle inherited defaults</button>
      <button onClick={() => setOverride(!override)}>Toggle mini radius</button>
      <button onClick={() => setCustomContent(!customContent)}>Toggle fallback content</button>
      <button onClick={() => setEnglish(!english)}>Toggle provider locale</button>
      <button onClick={() => setSearch(!search)}>Toggle inherited search</button>
      <button onClick={() => setCustomPrefix(!customPrefix)}>Toggle provider presentation</button>
      <ConfigProvider size={compact ? 'mini' : 'medium'} allowClear={compact}>
        <Button data-testid="outer-button">Outer</Button>
        <Input data-testid="outer-input" defaultValue="Same value" />
        <ConfigProvider size="large" allowClear={false}>
          <Button data-testid="inner-button">Inner</Button>
          <Input data-testid="inner-input" defaultValue="Same value" />
        </ConfigProvider>
      </ConfigProvider>
      <ConfigProvider allowSearch={search}>
        <Select data-testid="provider-select" options={choices} />
        <Cascader data-testid="provider-cascader" options={choices} />
        <TreeSelect data-testid="provider-tree-select" data={nodes} />
        <Select data-testid="provider-no-search" options={choices} allowSearch={false} />
      </ConfigProvider>
      <ConfigProvider
        prefixCls={customPrefix ? 'custom' : undefined}
        rtl={customPrefix}
        autoInsertSpaceInButton={customPrefix}
      >
        <Button data-testid="provider-spaced-button">确定</Button>
        <Tag data-testid="provider-direction-tag">Tag</Tag>
      </ConfigProvider>
      <ConfigProvider
        locale={english ? enUS : undefined}
        renderEmpty={customContent ? ({ component }) => <span>Empty {component}</span> : undefined}
        renderLoading={customContent ? () => <span>Custom loading</span> : undefined}
      >
        <List data-testid="provider-list" />
        <Spin data-testid="provider-spin" />
      </ConfigProvider>
      <ConfigProvider
        theme={{
          components: {
            button: {
              'btn-border-radius': '20px',
              ...(override ? { 'btn-size-mini-radius': '4px' } : {}),
            },
          },
        }}
      >
        {(['mini', 'small', 'medium', 'large'] as const).map((size) => (
          <div key={size} data-testid={`size-${size}`}>
            <Button size={size}>Action</Button>
            <Input size={size} />
          </div>
        ))}
      </ConfigProvider>
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
