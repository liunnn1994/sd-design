/** @jsxImportSource react */
import type { Size, TreeNodeData } from '@sdata/web-react';

import { Radio, RadioGroup, TreeSelect } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const sizeToItemSize: Record<Size, number> = {
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

      if (level > 0) {
        treeNode.children = loop(key, level - 1);
      }

      list.push(treeNode);
    }
    return list;
  }
  const [size, setSize] = useState<Size>('medium');
  const [mode, setMode] = useState<'disabled' | 'enabled' | 'explicit'>('disabled');
  const treeData = loop();
  const helperText = (() => {
    if (mode === 'disabled') {
      return '未传入任何虚拟滚动配置时，TreeSelect 会完整渲染当前展开的节点。';
    }

    if (mode === 'enabled') {
      return `virtual-scroll=true 会显式启用虚拟滚动，并使用 ${size} 尺寸对应的 ${sizeToItemSize[size]}px 固定行高。`;
    }

    return `virtual-list-props 可进一步设置 itemSize、height 和 buffer；当前 itemSize 为 ${sizeToItemSize[size]}px。`;
  })();
  const virtualBindings = (() => {
    if (mode === 'disabled') {
      return {};
    }

    if (mode === 'enabled') {
      return { virtualScroll: true };
    }

    return {
      virtualListProps: {
        itemSize: sizeToItemSize[size],
        height: 240,
        buffer: 220,
      },
    };
  })();

  return (
    <>
      <div className={'sd:w-90'}>
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
          <Radio value={'disabled'}>{'默认不启用'}</Radio>
          <Radio value={'enabled'}>{'virtual-scroll=true'}</Radio>
          <Radio value={'explicit'}>{'virtual-list-props'}</Radio>
        </RadioGroup>
        <div className={'sd:mb-3 sd:text-[var(--color-text-2)] sd:text-xs sd:leading-[1.5]'}>
          {formatValue(helperText)}
        </div>
        <TreeSelect
          {...virtualBindings}
          data={treeData}
          size={size}
          allowSearch={{
            retainInputValue: true,
          }}
          multiple={true}
          treeCheckable={true}
          treeCheckedStrategy={'parent'}
          triggerProps={{ popupStyle: { maxHeight: '240px' } }}
          placeholder={'请选择节点'}
        />
      </div>
    </>
  );
}
