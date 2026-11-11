/** @jsxImportSource react */
import type { CustomIcon, FileItem } from '@sdata/web-react';

import { Radio, RadioGroup, Space, Upload } from '@sdata/web-react';
import { IconClose, IconFaceFrownFill, IconFileAudio, IconUpload } from '@sdata/web-react/icon';
import { createElement, useState } from 'react';

export default function Example() {
  const [type, setType] = useState<'text' | 'picture' | 'picture-card'>('text');
  const getCustomIcon = (): CustomIcon => {
    return {
      retryIcon: () => createElement(IconUpload, null),
      cancelIcon: () => createElement(IconClose, null),
      fileIcon: () => createElement(IconFileAudio, null),
      removeIcon: () => createElement(IconClose, null),
      errorIcon: () => createElement(IconFaceFrownFill, null),
      fileName: (file: FileItem) => {
        return `文件名： ${file.name}`;
      },
    };
  };

  return (
    <>
      <div>
        <div className={'sd:mb-5'}>
          <Space>
            <span>{'类型： '}</span>
            <RadioGroup value={type} onValueChange={(next) => setType(next as typeof type)}>
              <Radio value={'text'}>{'文本'}</Radio>
              <Radio value={'picture'}>{'图片'}</Radio>
              <Radio value={'picture-card'}>{'图片卡片'}</Radio>
            </RadioGroup>
          </Space>
        </div>
        <Upload
          action={'/'}
          listType={type}
          defaultFileList={[
            {
              uid: '-1',
              name: 'ice.png',
              url: '//picsum.photos/1000/1000',
            },
            {
              uid: '-3',
              name: 'light.png',
              url: '//picsum.photos/1000/1000',
            },
          ]}
          customIcon={getCustomIcon()}
        />
      </div>
    </>
  );
}
