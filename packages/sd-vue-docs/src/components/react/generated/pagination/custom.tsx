/** @jsxImportSource react */
import { Pagination } from '@sdata/web-react';
import { IconSend, IconSunFill } from '@sdata/web-react/icon';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  return (
    <>
      <Pagination
        total={200}
        renderPageItem={({ page }) => (
          <>
            {' - '}
            {formatValue(page)}
            {' - '}
          </>
        )}
        renderPageItemStep={({ type }) => (
          <>
            <IconSend className={type === 'previous' ? 'sd:rotate-180' : undefined} />
          </>
        )}
        pageItemEllipsis={
          <>
            <IconSunFill />
          </>
        }
      />
    </>
  );
}
