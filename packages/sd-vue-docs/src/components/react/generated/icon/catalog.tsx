import { Button, Input } from '@sdata/web-react';
import Icons, { iconCatalog, IconPlus } from '@sdata/web-react/icon';
import { useState } from 'react';
import '@sdata/web-react/styles/icon.scss';

export default function IconDemo() {
  const [search, setSearch] = useState('');
  const [spin, setSpin] = useState(false);
  const [selected, setSelected] = useState('IconPlus');
  const matches = iconCatalog.filter((item) =>
    item.componentName.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <IconPlus
          data-testid="icon-demo-preview"
          size={32}
          rotate={45}
          spin={spin}
          aria-label="加号图标"
        />
        <Button onClick={() => setSpin((value) => !value)}>{spin ? '停止旋转' : '开始旋转'}</Button>
      </div>
      <Input
        inputAttrs={{ 'aria-label': '搜索图标' }}
        value={search}
        onValueChange={setSearch}
        placeholder="输入图标名称，例如 Arrow 或 Plus"
      />
      <output data-testid="icon-demo-count">
        {matches.length} / {iconCatalog.length}
      </output>
      <pre data-testid="icon-demo-import">
        <code>{`import { ${selected} } from '@sdata/web-react/icon';`}</code>
      </pre>
      <div
        data-testid="icon-demo-gallery"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 8,
        }}
      >
        {matches.map((item) => {
          const Component = Icons[item.componentName];
          return (
            <Button
              key={item.name}
              type="text"
              style={{ height: 'auto', minHeight: 72, padding: 8 }}
              onClick={() => setSelected(item.componentName)}
            >
              <span style={{ display: 'grid', justifyItems: 'center', gap: 8 }}>
                <Component size={24} aria-hidden="true" />
                <span style={{ fontSize: 11 }}>{item.componentName}</span>
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
