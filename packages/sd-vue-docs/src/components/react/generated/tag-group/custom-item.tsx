/** @jsxImportSource react */
import { Link, TagGroup } from '@sdata/web-react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const options = [
    { label: '监控看板', value: 'dashboard', href: '/dashboard' },
    { label: '告警中心', value: 'alert', href: '/alert' },
    { label: '排障手册', value: 'playbook', href: '/playbook' },
  ];

  return (
    <>
      <TagGroup
        options={options}
        maxCount={2}
        renderItem={({ data, itemClass, itemStyle }) => (
          <>
            <Link
              className={itemClass}
              style={itemStyle}
              href={typeof data.href === 'string' ? data.href : undefined}
            >
              {formatValue(data.label)}
            </Link>
          </>
        )}
      />
    </>
  );
}
