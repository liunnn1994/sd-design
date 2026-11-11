/** @jsxImportSource react */
import { Button, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space>
        <Button type={'primary'} tooltip={'主要按钮的提示'}>
          {'主要按钮'}
        </Button>
        <Button tooltip={{ content: '自定义位置', position: 'right' }}>{'对象配置'}</Button>
        <Button
          type={'text'}
          tooltipContent={
            <>
              <span style={{ fontWeight: 'bold', color: 'rgb(255, 125, 0)' }}>
                {'支持任意自定义'}
              </span>
            </>
          }
        >
          {' 自定义内容 '}
        </Button>
      </Space>
    </>
  );
}
