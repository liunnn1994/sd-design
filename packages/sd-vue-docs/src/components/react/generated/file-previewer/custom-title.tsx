/** @jsxImportSource react */
import { Button, FilePreviewer, Space, Tag } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button
        type={'primary'}
        onClick={() => {
          setVisible(true);
        }}
      >
        {'自定义标题'}
      </Button>
      <FilePreviewer
        visible={visible}
        onVisibleChange={(next) => setVisible(next as typeof visible)}
        type={'audio'}
        src={'https://developer.mozilla.org/shared-assets/audio/t-rex-roar.mp3'}
        renderTitle={() => (
          <>
            <Space size={'mini'}>
              {'自定义标题 '}
              <Tag color={'blue'}>{'音频'}</Tag>
            </Space>
          </>
        )}
      />
    </>
  );
}
