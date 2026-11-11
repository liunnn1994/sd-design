/** @jsxImportSource react */
import { ColorPicker, Space, Switch } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [triggerProps, setTriggerProps] = useState({
    popupVisible: false,
    unmountOnClose: true,
    position: 'bl' as const,
  });

  return (
    <>
      <Space direction={'vertical'}>
        <Switch
          value={triggerProps.popupVisible}
          onChange={(next) =>
            setTriggerProps((previous) => {
              const draft = structuredClone(previous);
              draft.popupVisible = next as (typeof triggerProps)['popupVisible'];
              return draft;
            })
          }
          checkedText={<>{' 开 '}</>}
          uncheckedText={<>{'关'}</>}
        />
        <ColorPicker defaultValue={'#165DFF'} triggerProps={triggerProps} />
      </Space>
    </>
  );
}
