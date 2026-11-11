/** @jsxImportSource react */
import { Progress, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div>
        <Progress
          percent={0.8}
          className={'sd:w-[50%]'}
          color={{
            '0%': 'rgb(var(--sd-primary-6))',
            '100%': 'rgb(var(--sd-success-6))',
          }}
        />
        <br />
        <br />
        <Progress
          percent={1}
          className={'sd:w-[50%]'}
          color={{
            '0%': 'rgb(var(--sd-primary-6))',
            '100%': 'rgb(var(--sd-success-6))',
          }}
        />
        <br />
        <br />
        <Space size={'large'}>
          <Progress
            type={'circle'}
            percent={0.8}
            color={{
              '0%': 'rgb(var(--sd-primary-6))',
              '100%': 'rgb(var(--sd-success-6))',
            }}
          />
          <Progress
            type={'circle'}
            percent={1}
            color={{
              '0%': 'rgb(var(--sd-primary-6))',
              '100%': 'rgb(var(--sd-success-6))',
            }}
          />
        </Space>
      </div>
    </>
  );
}
