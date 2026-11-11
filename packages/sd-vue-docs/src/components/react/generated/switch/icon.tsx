/** @jsxImportSource react */
import { Space, Switch } from '@sdata/web-react';
import { IconCheck, IconClose } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Space size={'large'}>
        <Switch
          checkedIcon={
            <>
              <IconCheck />
            </>
          }
          uncheckedIcon={
            <>
              <IconClose />
            </>
          }
        />
        <Switch
          type={'round'}
          checkedIcon={
            <>
              <IconCheck />
            </>
          }
          uncheckedIcon={
            <>
              <IconClose />
            </>
          }
        />
        <Switch
          type={'line'}
          checkedIcon={
            <>
              <IconCheck />
            </>
          }
          uncheckedIcon={
            <>
              <IconClose />
            </>
          }
        />
      </Space>
    </>
  );
}
