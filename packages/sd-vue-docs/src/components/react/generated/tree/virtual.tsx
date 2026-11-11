/** @jsxImportSource react */
import type { Size, TreeNodeData } from '@sdata/web-react';

import { Button, Radio, RadioGroup, Tree } from '@sdata/web-react';
import { type ComponentRef, useRef, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const sizeToItemSize = {
    mini: 24,
    small: 28,
    medium: 32,
    large: 36,
  };
  function loop(path = '0', level = 2) {
    const list: TreeNodeData[] = [];
    for (let i = 0; i < 10; i += 1) {
      const key = `${path}-${i}`;
      const treeNode: TreeNodeData = {
        title: `节点 ${key}`,
        key,
      };

      if (level === 0 && i % 3 === 0) {
        treeNode.description =
          '动态模式可在不强制每行保持相同高度的情况下，确保多行辅助文本仍清晰可读。';
      }

      if (level > 0) {
        treeNode.children = loop(key, level - 1);
      }

      list.push(treeNode);
    }
    return list;
  }
  const treeRef = useRef<ComponentRef<typeof Tree> | null>(null);
  const [size, setSize] = useState<Size>('medium');
  const [mode, setMode] = useState<'default' | 'dynamic'>('default');
  const treeData = loop();
  const helperText = (() => {
    return mode === 'default'
      ? `Tree 默认固定高度，映射 ${size} 行到 ${sizeToItemSize[size]}px。`
      : `动态高度模式使用 minItemSize: ${sizeToItemSize[size]}，并保持组件封装的 scrollbar。`;
  })();
  const virtualListProps = (() => {
    return mode === 'default'
      ? { height: 240 }
      : { height: 240, minItemSize: sizeToItemSize[size] };
  })();
  const scrollIntoView = () => {
    treeRef.current?.scrollIntoView({ key: '0-0-2-2' });
  };

  return (
    <>
      <div className={'sd:w-105'}>
        <RadioGroup
          value={size}
          onValueChange={(next) => setSize(next as typeof size)}
          type={'button'}
          className={'sd:mb-3'}
        >
          <Radio value={'mini'}>{'迷你'}</Radio>
          <Radio value={'small'}>{'小'}</Radio>
          <Radio value={'medium'}>{'中'}</Radio>
          <Radio value={'large'}>{'大'}</Radio>
        </RadioGroup>
        <RadioGroup
          value={mode}
          onValueChange={(next) => setMode(next as typeof mode)}
          type={'button'}
          className={'sd:mb-3'}
        >
          <Radio value={'default'}>{'默认固定高度'}</Radio>
          <Radio value={'dynamic'}>{'动态高度'}</Radio>
        </RadioGroup>
        <div className={'sd:mb-3 sd:text-[var(--color-text-2)] sd:text-xs sd:leading-[1.5]'}>
          {formatValue(helperText)}
        </div>
        <Button type={'primary'} className={'sd:mb-3'} onClick={scrollIntoView}>
          {' 滚动到 0-0-2-2 '}
        </Button>
        <Tree
          ref={treeRef}
          blockNode={true}
          checkable={true}
          size={size}
          data={treeData}
          virtualListProps={virtualListProps}
          renderTitle={(nodeData) => (
            <>
              {mode === 'dynamic' && nodeData.description ? (
                <div className={'sd:py-1.5'}>
                  <div>{formatValue(nodeData.title)}</div>
                  <div
                    className={
                      'sd:text-xs sd:leading-[1.5] sd:text-[var(--color-text-3)] sd:mt-0.5'
                    }
                  >
                    {formatValue(nodeData.description)}
                  </div>
                </div>
              ) : (
                <>{formatValue(nodeData.title)}</>
              )}
            </>
          )}
        />
      </div>
    </>
  );
}
