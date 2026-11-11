/** @jsxImportSource react */
import { Progress } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div className={'sd:w-[50%]'}>
        <Progress
          percent={0.4}
          trackColor={'var(--sd-color-primary-light-1)'}
          className={'sd:mb-5'}
        />
        <Progress
          percent={0.4}
          steps={4}
          trackColor={'var(--sd-color-primary-light-1)'}
          className={'sd:mb-5'}
        />
        <Progress
          percent={0.4}
          type={'circle'}
          trackColor={'var(--sd-color-primary-light-1)'}
          className={'sd:mb-5'}
        />
      </div>
    </>
  );
}
