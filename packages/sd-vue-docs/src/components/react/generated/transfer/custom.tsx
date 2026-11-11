/** @jsxImportSource react */
import { Transfer } from '@sdata/web-react';
import { IconUp } from '@sdata/web-react/icon';

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
    .map((_, index) => {
      return {
        value: `option${index + 1}`,
        label: `选项 ${index + 1}`,
        disabled: index === 1,
      };
    });
  const value = ['option1', 'option3', 'option5'];

  return (
    <>
      <Transfer
        data={data}
        defaultValue={value}
        renderItem={({ label }) => (
          <>
            <IconUp />
            {formatValue(label)}
          </>
        )}
      />
    </>
  );
}
