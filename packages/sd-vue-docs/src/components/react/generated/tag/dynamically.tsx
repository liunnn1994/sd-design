/** @jsxImportSource react */
import type { InputInstance } from '@sdata/web-react';

import { Input, Space, Tag } from '@sdata/web-react';
import { IconPlus } from '@sdata/web-react/icon';
import { type ComponentRef, useLayoutEffect, useRef, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [tags, setTags] = useState(['标签 1', '标签 2', '标签 3']);
  const inputRef = useRef<ComponentRef<typeof Input> | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const handleEdit = () => {
    setShowInput(true);
  };
  useLayoutEffect(() => {
    if (showInput) inputRef.current?.focus();
  }, [showInput]);
  const handleAdd = () => {
    if (inputVal) {
      setTags((previous) => {
        const next = [...previous];
        next.push(inputVal);
        return next;
      });
      setInputVal('');
    }
    setShowInput(false);
  };
  const handleRemove = (key: string) => {
    setTags(tags.filter((tag) => tag !== key));
  };

  return (
    <>
      <Space wrap={true}>
        {tags.map((tag, index) => (
          <Tag
            key={tag}
            closable={index !== 0}
            onClose={() => {
              handleRemove(tag);
            }}
          >
            {formatValue(tag)}
          </Tag>
        ))}
        {showInput ? (
          <Input
            ref={inputRef}
            className={'sd:w-22.5'}
            size={'mini'}
            value={inputVal}
            onValueChange={(next) => setInputVal(next as typeof inputVal)}
            onKeyUp={(event) => {
              if (event.key !== 'Enter') return;
              handleAdd();
            }}
            onBlur={handleAdd}
          />
        ) : (
          <Tag
            className={
              'sd:w-[90px] sd:cursor-pointer sd:border sd:border-dashed sd:border-[var(--color-fill-3)] sd:bg-[var(--color-fill-2)]'
            }
            onClick={handleEdit}
            icon={
              <>
                <IconPlus />
              </>
            }
          >
            {' 添加标签 '}
          </Tag>
        )}
      </Space>
    </>
  );
}
