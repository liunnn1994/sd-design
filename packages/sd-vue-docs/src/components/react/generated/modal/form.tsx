/** @jsxImportSource react */
import { Button, Form, FormItem, Input, Modal, Select } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState({
    name: '',
    post: '',
  });
  const postOptions = [
    { value: 'post1', label: '岗位 1' },
    { value: 'post2', label: '岗位 2' },
    { value: 'post3', label: '岗位 3' },
    { value: 'post4', label: '岗位 4' },
  ];
  const handleClick = () => {
    setVisible(true);
  };
  const handleBeforeOk = (done: (closed: boolean) => void) => {
    console.log(form);
    window.setTimeout(() => {
      done(true);
      // prevent close
      // done(false)
    }, 3000);
  };
  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <>
      <Button onClick={handleClick}>{'打开表单对话框'}</Button>
      <Modal
        visible={visible}
        onVisibleChange={(next) => setVisible(next as typeof visible)}
        title={'弹窗表单'}
        onCancel={handleCancel}
        onBeforeOk={handleBeforeOk}
      >
        <Form model={form}>
          <FormItem field={'name'} label={'姓名'}>
            <Input
              value={form.name}
              onValueChange={(next) =>
                setForm((previous) => {
                  const draft = structuredClone(previous);
                  draft.name = next as (typeof form)['name'];
                  return draft;
                })
              }
            />
          </FormItem>
          <FormItem field={'post'} label={'岗位'}>
            <Select
              value={form.post}
              onValueChange={(next) =>
                setForm((previous) => {
                  const draft = structuredClone(previous);
                  draft.post = next as (typeof form)['post'];
                  return draft;
                })
              }
              options={postOptions}
            />
          </FormItem>
        </Form>
      </Modal>
    </>
  );
}
