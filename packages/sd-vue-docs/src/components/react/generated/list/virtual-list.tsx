/** @jsxImportSource react */
import { Avatar, List, ListItem, ListItemMeta, Radio, RadioGroup } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  type ListItem = {
    key: string;
    prefix: string;
    title: string;
    shortDescription: string;
    longDescription: string;
  };
  const [mode, setMode] = useState<'dynamic' | 'fixed'>('dynamic');
  const helperText = (() => {
    return mode === 'dynamic'
      ? '列表默认适应动态行高。此模式设置 minItemSize: 72，使较长描述可以自然撑开。'
      : '所有行需要保持相同高度且无需实时测量时，可设置 itemSize: 72。';
  })();
  const virtualListProps = (() => {
    return mode === 'dynamic' ? { height: 520, minItemSize: 72 } : { height: 520, itemSize: 72 };
  })();
  const getDescription = (item: ListItem) => {
    return mode === 'dynamic' ? item.longDescription : item.shortDescription;
  };
  const list: ListItem[] = Array(2400)
    .fill(null)
    .map((_, index) => {
      const prefix = `0${(index % 26) + 10}`.slice(-2);
      const shortDescription = `(${index}) 固定行高使列表保持一致的视觉节奏。`;
      const longDescription = [
        `(${index}) 动态行高让丰富内容保持可读，无需强制所有卡片使用相同高度。`,
        index % 3 === 0 ? '此项包含更多说明，便于滚动时观察行高差异。' : '',
        index % 5 === 0 ? '同时模拟辅助信息和更长的摘要。' : '',
      ]
        .filter(Boolean)
        .join(' ');

      return {
        key: `list-${index}`,
        prefix,
        title: `虚拟列表项目 ${index}`,
        shortDescription,
        longDescription,
      };
    });

  return (
    <>
      <div className={'sd:w-160'}>
        <RadioGroup
          value={mode}
          onValueChange={(next) => setMode(next as typeof mode)}
          type={'button'}
          className={'sd:mb-3'}
        >
          <Radio value={'dynamic'}>{'动态行高'}</Radio>
          <Radio value={'fixed'}>{'固定行高'}</Radio>
        </RadioGroup>
        <div className={'sd:mb-3 sd:text-[var(--color-text-2)] sd:text-xs sd:leading-[1.5]'}>
          {formatValue(helperText)}
        </div>
        <List
          virtualListProps={virtualListProps}
          data={list}
          renderItem={({ item, index }) => (
            <>
              <ListItem key={index}>
                <ListItemMeta
                  title={item.title}
                  description={getDescription(item)}
                  avatar={
                    <>
                      <Avatar shape={'square'}>{formatValue(item.prefix)}</Avatar>
                    </>
                  }
                />
              </ListItem>
            </>
          )}
        />
      </div>
    </>
  );
}
