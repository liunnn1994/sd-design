/** @jsxImportSource react */
import { Typography, TypographyParagraph } from '@sdata/web-react';
import { type ComponentProps, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [str, setStr] =
    useState<NonNullable<ComponentProps<typeof TypographyParagraph>['editText']>>(
      '点击图标编辑这段文字。',
    );

  return (
    <>
      <Typography>
        <TypographyParagraph copyable={true}>{' 点击图标复制这段文字。 '}</TypographyParagraph>
        <TypographyParagraph
          editable={true}
          editText={str}
          onEditTextChange={(next) => setStr(next as typeof str)}
        >
          {formatValue(str)}
        </TypographyParagraph>
      </Typography>
    </>
  );
}
