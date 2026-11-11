/** @jsxImportSource react */
import { Alert, Button, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={'large'} className={'sd:w-full'}>
        <Alert
          closable={true}
          action={
            <>
              <Button size={'small'} type={'primary'}>
                {'详情'}
              </Button>
            </>
          }
        >
          {' 这是一条信息提示。 '}
        </Alert>
        <Alert
          title={'示例'}
          closable={true}
          action={
            <>
              <Button size={'small'} type={'primary'}>
                {'详情'}
              </Button>
            </>
          }
        >
          {' 这是一条信息提示。 '}
        </Alert>
      </Space>
    </>
  );
}
