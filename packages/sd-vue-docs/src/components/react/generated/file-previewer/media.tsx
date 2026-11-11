/** @jsxImportSource react */
import { Button, FilePreviewer, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  type FileKey = 'video' | 'audio' | 'pdf';
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<FileKey>('video');
  const files = {
    video: {
      title: '视频预览',
      src: 'https://developer.mozilla.org/shared-assets/videos/flower.webm',
      type: 'video',
    },
    audio: {
      title: '音频预览',
      src: 'https://developer.mozilla.org/shared-assets/audio/t-rex-roar.mp3',
      type: 'audio',
    },
    pdf: {
      title: 'PDF 预览',
      src: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
      type: 'pdf',
    },
  } as const;
  const currentFile = (() => files[current])();
  function openPreview(type: FileKey) {
    setCurrent(type);
    setVisible(true);
  }

  return (
    <>
      <Space>
        <Button
          type={'primary'}
          onClick={() => {
            openPreview('video');
          }}
        >
          {'预览视频'}
        </Button>
        <Button
          onClick={() => {
            openPreview('audio');
          }}
        >
          {'预览音频'}
        </Button>
        <Button
          onClick={() => {
            openPreview('pdf');
          }}
        >
          {'预览 PDF'}
        </Button>
      </Space>
      <FilePreviewer
        visible={visible}
        onVisibleChange={(next) => setVisible(next as typeof visible)}
        src={currentFile.src}
        type={currentFile.type}
        title={currentFile.title}
      />
    </>
  );
}
