import { Checkbox, Transfer } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconDelete } from '@sdata/web-react/icon';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const data = Array(8)
    .fill(undefined)
    .map((_, index) => ({
      value: `option${index + 1}`,
      label: `选项 ${index + 1}`,
    }));
  const value = ['option1', 'option3', 'option5'];

  return (
    <>
      <Transfer
        data={data}
        defaultValue={value}
        renderSourceTitle={({
          countTotal,
          countSelected,
          checked,
          indeterminate,
          onSelectAllChange,
        }) => (
          <>
            <div className={'sd:flex sd:items-center sd:justify-between sd:pr-2'}>
              {' 源列表标题 '}
              {formatValue(countSelected)}
              {'-'}
              {formatValue(countTotal)}
              <Checkbox
                modelValue={checked}
                indeterminate={indeterminate}
                onChange={(value) => onSelectAllChange(Boolean(value))}
              />
            </div>
          </>
        )}
        renderTargetTitle={({ countTotal, countSelected, onClear }) => (
          <>
            <div className={'sd:flex sd:items-center sd:justify-between sd:pr-2'}>
              {' 目标列表标题 '}
              {formatValue(countSelected)}
              {'-'}
              {formatValue(countTotal)}
              <IconDelete onClick={onClear} />
            </div>
          </>
        )}
      />
    </>
  );
}
