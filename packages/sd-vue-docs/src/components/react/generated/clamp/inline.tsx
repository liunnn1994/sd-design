/** @jsxImportSource react */
import type { InlineClampSplit } from '@sdata/web-react';

import { InlineClamp } from '@sdata/web-react';

export default function Example() {
  const splitFileName: InlineClampSplit = (text) => {
    const extension = text.match(/\.[^.]+$/)?.[0];
    return extension ? { body: text.slice(0, -extension.length), end: extension } : { body: text };
  };

  return (
    <>
      <InlineClamp
        data-v-afac8932=""
        text={'summer-campaign-panorama-final.jpeg'}
        split={splitFileName}
        location={'middle'}
        className={'clamp-demo'}
      />
      <style>
        {'\n.clamp-demo[data-v-afac8932] {\n    display: block;\n    width: min(100%, 12rem);\n}\n'}
      </style>
    </>
  );
}
