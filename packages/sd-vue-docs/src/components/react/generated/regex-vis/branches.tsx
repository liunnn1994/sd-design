/** @jsxImportSource react */
import { RegexVis } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <RegexVis
        value={'^(https?):\\\\/\\\\/(www\\\\.)?([a-z0-9-]+\\\\.)+[a-z]{2,6}(\\\\/[^\\\\s]*)?$'}
        showInput={false}
        readonly={true}
        aria-label={'网址正则表达式结构'}
      />
    </>
  );
}
