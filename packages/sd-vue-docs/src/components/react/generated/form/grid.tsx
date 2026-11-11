/** @jsxImportSource react */
import { Col, Form, FormItem, Input, Row } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [form, setForm] = useState({
    value1: '',
    value2: '',
    value3: '',
    value4: '',
    value5: '',
  });

  return (
    <>
      <Form model={form}>
        <Row gutter={16}>
          <Col span={8}>
            <FormItem field={'value1'} label={'值 1'} labelColFlex={'100px'}>
              <Input
                value={form.value1}
                onValueChange={(next) =>
                  setForm((previous) => {
                    const draft = structuredClone(previous);
                    draft.value1 = next as (typeof form)['value1'];
                    return draft;
                  })
                }
                placeholder={'请输入…'}
              />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem field={'value2'} label={'值 2'} labelColFlex={'80px'}>
              <Input
                value={form.value2}
                onValueChange={(next) =>
                  setForm((previous) => {
                    const draft = structuredClone(previous);
                    draft.value2 = next as (typeof form)['value2'];
                    return draft;
                  })
                }
                placeholder={'请输入…'}
              />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem field={'value3'} label={'值 3'} labelColFlex={'80px'}>
              <Input
                value={form.value3}
                onValueChange={(next) =>
                  setForm((previous) => {
                    const draft = structuredClone(previous);
                    draft.value3 = next as (typeof form)['value3'];
                    return draft;
                  })
                }
                placeholder={'请输入…'}
              />
            </FormItem>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={16}>
            <FormItem field={'value4'} label={'值 4'} labelColFlex={'100px'}>
              <Input
                value={form.value4}
                onValueChange={(next) =>
                  setForm((previous) => {
                    const draft = structuredClone(previous);
                    draft.value4 = next as (typeof form)['value4'];
                    return draft;
                  })
                }
                placeholder={'请输入…'}
              />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem field={'value5'} label={'值 5'} labelColFlex={'80px'}>
              <Input
                value={form.value5}
                onValueChange={(next) =>
                  setForm((previous) => {
                    const draft = structuredClone(previous);
                    draft.value5 = next as (typeof form)['value5'];
                    return draft;
                  })
                }
                placeholder={'请输入…'}
              />
            </FormItem>
          </Col>
        </Row>
      </Form>
      {formatValue(form)}
    </>
  );
}
