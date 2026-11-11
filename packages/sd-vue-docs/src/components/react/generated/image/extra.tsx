import { Image, Tooltip } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconEye, IconDownload, IconInfoCircle } from '@sdata/web-react/icon';
import { useState } from 'react';

export default function Example() {
  const [visible1, setVisible1] = useState(false);
  const [visible2, setVisible2] = useState(false);
  function onDownLoad() {
    console.log('download');
  }

  return (
    <>
      <Image
        data-v-647e6f4f=""
        src={'https://picsum.photos/id/10/1000/1000?t=image-demo-10'}
        title={'用户头像'}
        description={'由 SD Design 提供'}
        width={'260'}
        className={'sd:mr-[67px] sd:align-top'}
        previewVisible={visible1}
        onPreviewVisibleChange={() => {
          setVisible1(false);
        }}
        extra={
          <>
            <div data-v-647e6f4f="" className={'actions'}>
              <span
                data-v-647e6f4f=""
                className={'action'}
                onClick={() => {
                  setVisible1(true);
                }}
              >
                <IconEye data-v-647e6f4f="" />
              </span>
              <span data-v-647e6f4f="" className={'action'} onClick={onDownLoad}>
                <IconDownload data-v-647e6f4f="" />
              </span>
              <Tooltip data-v-647e6f4f="" content={'用户头像'}>
                <span data-v-647e6f4f="" className={'action'}>
                  <IconInfoCircle data-v-647e6f4f="" />
                </span>
              </Tooltip>
            </div>
          </>
        }
      />
      <Image
        data-v-647e6f4f=""
        src={'https://picsum.photos/id/10/1000/1000?t=image-demo-11'}
        title={'用户头像'}
        description={'由 SD Design 提供'}
        width={'260'}
        footerPosition={'outer'}
        previewVisible={visible2}
        onPreviewVisibleChange={() => {
          setVisible2(false);
        }}
        extra={
          <>
            <div data-v-647e6f4f="" className={'actions actions-outer'}>
              <span
                data-v-647e6f4f=""
                className={'action'}
                onClick={() => {
                  setVisible2(true);
                }}
              >
                <IconEye data-v-647e6f4f="" />
              </span>
              <span data-v-647e6f4f="" className={'action'} onClick={onDownLoad}>
                <IconDownload data-v-647e6f4f="" />
              </span>
              <Tooltip data-v-647e6f4f="" content={'用户头像'}>
                <span data-v-647e6f4f="" className={'action'}>
                  <IconInfoCircle data-v-647e6f4f="" />
                </span>
              </Tooltip>
            </div>
          </>
        }
      />
      <style>
        {
          '\n.actions[data-v-647e6f4f] {\n    display: flex;\n    align-items: center;\n}\n.action[data-v-647e6f4f] {\n    margin-left: 12px;\n    padding: 5px 4px;\n    font-size: 14px;\n    line-height: 1;\n    border-radius: 2px;\n    cursor: pointer;\n}\n.action[data-v-647e6f4f]:first-child {\n    margin-left: 0;\n}\n.action[data-v-647e6f4f]:hover {\n    background: rgb(0 0 0 / 50%);\n}\n.actions-outer {\n.action {\n&[data-v-647e6f4f]:hover {\n        color: #fff;\n}\n}\n}\n'
        }
      </style>
    </>
  );
}
