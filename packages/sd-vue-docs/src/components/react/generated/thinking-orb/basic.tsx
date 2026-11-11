/** @jsxImportSource react */
import { Space, ThinkingOrb } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space align={'center'} size={'large'}>
        <ThinkingOrb aria-label={'AI 正在思考'} />
        <span>{'正在整理回答…'}</span>
      </Space>
    </>
  );
}
