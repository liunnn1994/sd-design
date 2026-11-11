import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ConfigProvider } from '../../src/config-provider/index.js';
import { Form, FormItem } from '../../src/form/index.js';
import { TreeSelect, type TreeSelectInstance } from '../../src/tree-select/tree-select.js';
import '../../styles/tree-select.scss';
import '../../styles/form.scss';
const data = [{ key: 0, title: 'Root', children: [{ key: 'one', title: 'One' }] }];
function Fixture() {
  const [model, setModel] = useState<{ choice: string | number }>({ choice: '' });
  const [disabled, setDisabled] = useState(false);
  const reference = useRef<TreeSelectInstance>(null);
  return (
    <ConfigProvider allowClear allowSearch virtualListProps={{ height: 160, itemSize: 32 }}>
      <button onClick={() => reference.current?.focus()}>Focus</button>
      <button onClick={() => reference.current?.blur()}>Blur</button>
      <button onClick={() => setDisabled(!disabled)}>Disable</button>
      <Form
        model={model}
        disabled={disabled}
        size="large"
        rules={{ choice: [{ required: true, message: 'Choose team' }] }}
      >
        <FormItem field="choice" label="Team" validateTrigger={['blur', 'change']}>
          <TreeSelect
            ref={reference}
            data={data}
            value={model.choice}
            style={{ width: 280 }}
            onValueChange={(next) =>
              setModel({ choice: typeof next === 'string' || typeof next === 'number' ? next : '' })
            }
          />
        </FormItem>
      </Form>
      <output>{JSON.stringify(model)}</output>
    </ConfigProvider>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
