/** @jsxImportSource react */
import { Button, LineClamp } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [expanded, setExpanded] = useState(false);
  const text =
    '通过 expanded 模型和 after 插槽可以组合展开控件。插槽同时提供 expand、collapse、toggle、clamped 与 expanded 状态。';

  return (
    <>
      <LineClamp
        data-v-b2c351cc=""
        expanded={expanded}
        onExpandedChange={(next) => setExpanded(next as typeof expanded)}
        text={text}
        maxLines={2}
        className={'clamp-demo'}
        after={({ clamped, expanded: current, toggle }) => (
          <>
            {clamped || current ? (
              <Button data-v-b2c351cc="" type={'text'} size={'mini'} onClick={toggle}>
                {formatValue(current ? '收起' : '展开')}
              </Button>
            ) : null}
          </>
        )}
      />
      <style>{'\n.clamp-demo[data-v-b2c351cc] {\n    width: min(100%, 16rem);\n}\n'}</style>
    </>
  );
}
