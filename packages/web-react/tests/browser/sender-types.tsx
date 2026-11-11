import {
  Sender,
  RecorderCore,
  type SenderRef,
  type SenderProps,
  type SenderSlotConfig,
  type RecorderCoreConstructor,
} from '@sdata/web-react';
import SenderSubpath from '@sdata/web-react/sender';
import { useRef } from 'react';

export function SenderTypeConsumer() {
  const ref = useRef<SenderRef>(null);
  const sdk: RecorderCoreConstructor = RecorderCore;
  sdk.Support();
  sdk({ type: 'wav' });
  const config: SenderSlotConfig[] = [
    { type: 'input', key: 'input', props: { defaultValue: 'Value' } },
    {
      type: 'custom',
      key: 'custom',
      customRender: (value, onChange, state) => (
        <button disabled={state.disabled} onClick={() => onChange(value)}>
          Custom
        </button>
      ),
    },
  ];
  const props: SenderProps = {
    slotConfig: config,
    onSubmit: (value, slots, skill) => {
      value.toUpperCase();
      slots.map((slot) => slot.type);
      skill?.value.toUpperCase();
    },
  };
  // @ts-expect-error Only documented submit gestures are supported.
  const invalid: SenderProps = { submitType: 'ctrlEnter' };
  void invalid;
  return (
    <>
      <Sender {...props} ref={ref} />
      <SenderSubpath.Header open title="Header" />
      <Sender.Switch onValueChange={(value) => value.valueOf()}>Switch</Sender.Switch>
    </>
  );
}
