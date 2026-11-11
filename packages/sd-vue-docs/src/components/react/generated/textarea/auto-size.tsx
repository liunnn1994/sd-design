/** @jsxImportSource react */
import { Textarea } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Textarea
        defaultValue={'这是多行文本框的内容。这是多行文本框的内容。这是多行文本框的内容。'}
        autoSize={true}
      />
      <Textarea
        defaultValue={'这是多行文本框的内容。这是多行文本框的内容。这是多行文本框的内容。'}
        autoSize={{
          minRows: 2,
          maxRows: 5,
        }}
        className={'sd:mt-5'}
      />
    </>
  );
}
