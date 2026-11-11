/** @jsxImportSource react */
import { Button, FilePreviewer, Space } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  type PreviewType = 'image' | 'video' | 'audio' | 'pdf';
  const files = [
    {
      label: '图片',
      title: '内嵌图片预览',
      type: 'image',
      src: 'https://picsum.photos/id/11/1000/640?t=file-previewer-inline-image',
    },
    {
      label: '视频',
      title: '内嵌视频预览',
      type: 'video',
      src: 'https://developer.mozilla.org/shared-assets/videos/flower.webm',
    },
    {
      label: '音频',
      title: '内嵌音频预览',
      type: 'audio',
      src: 'https://developer.mozilla.org/shared-assets/audio/t-rex-roar.mp3',
    },
    {
      label: 'PDF',
      title: '内嵌 PDF 预览',
      type: 'pdf',
      src: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    },
  ] as const;
  const [current, setCurrent] = useState<PreviewType>('image');
  const currentFile = (() => files.find((file) => file.type === current) ?? files[0])();

  return (
    <>
      <Space data-v-0ad4bfa0="" className={'inline-preview-demo__actions'}>
        {files.map((file) => (
          <Button
            data-v-0ad4bfa0=""
            key={file.type}
            type={file.type === current ? 'primary' : 'secondary'}
            onClick={() => {
              setCurrent(file.type);
            }}
          >
            {formatValue(file.label)}
          </Button>
        ))}
      </Space>
      <div data-v-0ad4bfa0="" className={'inline-preview-demo'}>
        <FilePreviewer
          data-v-0ad4bfa0=""
          fullscreen={false}
          src={currentFile.src}
          title={currentFile.title}
          type={currentFile.type}
        />
      </div>
      <style>
        {
          '\n.inline-preview-demo__actions[data-v-0ad4bfa0] {\n    margin-bottom: 12px;\n}\n.inline-preview-demo[data-v-0ad4bfa0] {\n    width: 100%;\n    height: 360px;\n}\n'
        }
      </style>
    </>
  );
}
