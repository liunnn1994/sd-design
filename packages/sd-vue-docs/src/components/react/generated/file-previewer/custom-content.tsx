/** @jsxImportSource react */
import { Button, FilePreviewer, Tag } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button
        data-v-5a011422=""
        type={'primary'}
        onClick={() => {
          setVisible(true);
        }}
      >
        {'自定义预览内容'}
      </Button>
      <FilePreviewer
        data-v-5a011422=""
        visible={visible}
        onVisibleChange={(next) => setVisible(next as typeof visible)}
        title={'自定义内容'}
        type={'pdf'}
        src={'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'}
        renderContent={({ src, type, status, close }) => (
          <>
            <div data-v-5a011422="" className={'custom-preview-content'}>
              <div data-v-5a011422="" className={'custom-preview-content__meta'}>
                <Tag data-v-5a011422="" color={'blue'}>
                  {formatValue(type)}
                </Tag>
                <span data-v-5a011422="">{formatValue(status)}</span>
              </div>
              <p data-v-5a011422="" className={'custom-preview-content__url'}>
                {formatValue(src)}
              </p>
              <Button data-v-5a011422="" type={'primary'} onClick={close}>
                {'关闭预览'}
              </Button>
            </div>
          </>
        )}
      />
      <style>
        {
          '\n.custom-preview-content[data-v-5a011422] {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    justify-content: center;\n    box-sizing: border-box;\n    width: min(560px, 100%);\n    padding: 24px;\n    color: #1d2129;\n    background: #fff;\n    border-radius: 8px;\n}\n.custom-preview-content__meta[data-v-5a011422] {\n    display: flex;\n    gap: 8px;\n    align-items: center;\n}\n.custom-preview-content__url[data-v-5a011422] {\n    max-width: 100%;\n    overflow: hidden;\n    color: #4e5969;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n}\n'
        }
      </style>
    </>
  );
}
