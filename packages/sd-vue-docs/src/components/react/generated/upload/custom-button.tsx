/** @jsxImportSource react */
import { Upload } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Upload
        action={'/'}
        uploadButton={
          <>
            <div
              className={
                'sd:h-39.5 sd:w-95 sd:rounded-[2px] sd:border sd:border-dashed sd:border-[var(--color-fill-4)] sd:bg-[var(--color-fill-2)] sd:text-center sd:leading-39.5 sd:text-[var(--color-text-1)]'
              }
            >
              <div>
                {' 将文件拖到此处，或 '}
                <span className={'sd:text-[#3370ff]'}>{' 点击上传'}</span>
              </div>
            </div>
          </>
        }
      />
    </>
  );
}
