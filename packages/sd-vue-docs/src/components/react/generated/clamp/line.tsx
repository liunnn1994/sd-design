/** @jsxImportSource react */
import { LineClamp } from '@sdata/web-react';

export default function Example() {
  const text =
    'LineClamp 会按真实浏览器布局裁剪纯文本，支持最大行数、最大高度、省略位置、单词边界与受控展开状态。';

  return (
    <>
      <LineClamp data-v-fe86fb39="" text={text} maxLines={2} className={'clamp-demo'} />
      <style>{'\n.clamp-demo[data-v-fe86fb39] {\n    width: min(100%, 16rem);\n}\n'}</style>
    </>
  );
}
