/** @jsxImportSource react */
import { Checkbox, Col, Form, FormItem, Input, Row, Space } from '@sdata/web-react';
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
    together: {
      firstname: '',
      lastname: '',
    },
    separate: {
      firstname: '',
      lastname: '',
    },
    posts: {
      post1: '',
      post2: '',
    },
    isRead: false,
  });

  return (
    <>
      <Form model={form} className={'sd:w-150'}>
        <FormItem
          label={'用户名'}
          contentFlex={false}
          mergeProps={false}
          extra={'合并显示错误信息'}
        >
          <Row gutter={8}>
            <Col span={12}>
              <FormItem
                field={'together.firstname'}
                validateTrigger={'input'}
                rules={[{ required: true, message: '请输入名' }]}
                noStyle={true}
              >
                <Input
                  value={form.together.firstname}
                  onValueChange={(next) =>
                    setForm((previous) => {
                      const draft = structuredClone(previous);
                      draft.together.firstname = next as (typeof form)['together']['firstname'];
                      return draft;
                    })
                  }
                  placeholder={'请输入名…'}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                field={'together.lastname'}
                validateTrigger={'input'}
                rules={[{ required: true, message: '请输入姓' }]}
                noStyle={true}
              >
                <Input
                  value={form.together.lastname}
                  onValueChange={(next) =>
                    setForm((previous) => {
                      const draft = structuredClone(previous);
                      draft.together.lastname = next as (typeof form)['together']['lastname'];
                      return draft;
                    })
                  }
                  placeholder={'请输入姓…'}
                />
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <FormItem label={'用户名'} contentFlex={false} mergeProps={false}>
          <Row gutter={8}>
            <Col span={12}>
              <FormItem
                field={'separate.firstname'}
                validateTrigger={'input'}
                extra={'分别显示错误信息'}
                rules={[{ required: true, message: '请输入名' }]}
                hideLabel={true}
              >
                <Input
                  value={form.separate.firstname}
                  onValueChange={(next) =>
                    setForm((previous) => {
                      const draft = structuredClone(previous);
                      draft.separate.firstname = next as (typeof form)['separate']['firstname'];
                      return draft;
                    })
                  }
                  placeholder={'请输入名…'}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                field={'separate.lastname'}
                validateTrigger={'input'}
                rules={[{ required: true, message: '请输入姓' }]}
                hideLabel={true}
              >
                <Input
                  value={form.separate.lastname}
                  onValueChange={(next) =>
                    setForm((previous) => {
                      const draft = structuredClone(previous);
                      draft.separate.lastname = next as (typeof form)['separate']['lastname'];
                      return draft;
                    })
                  }
                  placeholder={'请输入姓…'}
                />
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <FormItem label={'岗位'} contentFlex={false} mergeProps={false}>
          <Space direction={'vertical'} fill={true}>
            <FormItem field={'posts.post1'} label={'岗位 1'}>
              <Input
                value={form.posts.post1}
                onValueChange={(next) =>
                  setForm((previous) => {
                    const draft = structuredClone(previous);
                    draft.posts.post1 = next as (typeof form)['posts']['post1'];
                    return draft;
                  })
                }
                placeholder={'请输入岗位…'}
              />
            </FormItem>
            <FormItem field={'posts.post2'} label={'岗位 2'}>
              <Input
                value={form.posts.post2}
                onValueChange={(next) =>
                  setForm((previous) => {
                    const draft = structuredClone(previous);
                    draft.posts.post2 = next as (typeof form)['posts']['post2'];
                    return draft;
                  })
                }
                placeholder={'请输入岗位…'}
              />
            </FormItem>
          </Space>
        </FormItem>
        <FormItem field={'isRead'}>
          <Checkbox
            modelValue={form.isRead}
            onValueChange={(next) =>
              setForm((previous) => {
                const draft = structuredClone(previous);
                draft.isRead = next as (typeof form)['isRead'];
                return draft;
              })
            }
          >
            {' 我已阅读使用手册 '}
          </Checkbox>
        </FormItem>
      </Form>
      {formatValue(form)}
    </>
  );
}
