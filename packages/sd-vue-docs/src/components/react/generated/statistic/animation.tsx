/** @jsxImportSource react */
import { Button, Statistic } from '@sdata/web-react';
import { IconArrowRise } from '@sdata/web-react/icon';
import { useState } from 'react';

export default function Example() {
  const [start, setStart] = useState(false);

  return (
    <>
      <div className={'sd:grid sd:gap-4'}>
        <Statistic
          title={'用户增长率'}
          value={50.52}
          precision={2}
          valueFrom={0}
          start={start}
          animation={true}
          prefix={
            <>
              <IconArrowRise />
            </>
          }
          suffix={<>{'%'}</>}
        />
        <Button
          onClick={() => {
            setStart(true);
          }}
        >
          {'开始'}
        </Button>
      </div>
    </>
  );
}
