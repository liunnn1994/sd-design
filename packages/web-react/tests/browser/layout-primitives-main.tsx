import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import { Comment } from '../../src/comment';
import { ConfigProvider } from '../../src/config-provider';
import { Divider } from '../../src/divider';
import { Empty } from '../../src/empty';
import { Space } from '../../src/space';
import '../../styles/comment.scss';
import '../../styles/divider.scss';
import '../../styles/empty.scss';
import '../../styles/space.scss';

function SpaceFixture() {
  const [step, setStep] = useState(0);
  return (
    <ConfigProvider rtl={step > 0}>
      <Space
        data-testid="space"
        align={step === 2 ? 'baseline' : undefined}
        direction={step ? 'vertical' : 'horizontal'}
        size={step ? [step === 1 ? 0 : 6, 'large'] : 'mini'}
        wrap
        fill
        split={<i>|</i>}
      >
        <input
          key={0}
          aria-label="Draft"
          onKeyDown={(event) => {
            if (event.key === 'Enter') setStep((current) => Math.min(current + 1, 2));
          }}
        />
        {false}
        <b key="second">Second</b>
      </Space>
    </ConfigProvider>
  );
}

function DividerFixture() {
  const [vertical, setVertical] = useState(false);
  const [size, setSize] = useState<number>();
  const [label, setLabel] = useState(false);
  return (
    <>
      <button onClick={() => setVertical(!vertical)}>Toggle direction</button>
      <button onClick={() => setSize(size === undefined ? 0 : size === 0 ? 4 : undefined)}>
        Cycle size
      </button>
      <button onClick={() => setLabel(!label)}>Toggle label</button>
      <Divider
        direction={vertical ? 'vertical' : 'horizontal'}
        size={size}
        type="dashed"
        margin={12}
        orientation="right"
      >
        {label ? 'Section label' : null}
      </Divider>
    </>
  );
}

function CommentFixture() {
  const [reply, setReply] = useState(false);
  return (
    <Comment
      data-testid="thread"
      className="comment-thread"
      avatar={<span aria-label="Custom avatar">A</span>}
      author="Author"
      datetime={<time dateTime="2026-11-23">November 23</time>}
      content="First message"
      align={{ actions: 'right' }}
      actions={<button onClick={() => setReply(!reply)}>Toggle reply</button>}
    >
      {reply ? <Comment author="Reviewer" content={<b>Nested reply</b>} /> : null}
    </Comment>
  );
}

function EmptyFixture() {
  const [local, setLocal] = useState(false);
  const [image, setImage] = useState(false);
  return (
    <>
      <button onClick={() => setLocal(!local)}>Toggle local description</button>
      <button onClick={() => setImage(!image)}>Toggle custom image</button>
      <ConfigProvider renderEmpty={({ component }) => <strong>Provider empty {component}</strong>}>
        <Empty
          className="empty-example"
          description={local ? 'Local description' : undefined}
          imgSrc={
            image
              ? 'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22/%3E'
              : undefined
          }
        >
          {local && image ? 'Custom content' : undefined}
        </Empty>
        <Empty data-testid="default-empty" inConfigProvider />
      </ConfigProvider>
    </>
  );
}

const fixtures = {
  space: <SpaceFixture />,
  divider: <DividerFixture />,
  comment: <CommentFixture />,
  empty: <EmptyFixture />,
};
const name = new URLSearchParams(location.search).get('fixture') as keyof typeof fixtures;
flushSync(() => createRoot(document.getElementById('root')!).render(fixtures[name]));
