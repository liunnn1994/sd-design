/** @jsxImportSource react */
import { Alert, Col, Row } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Row gutter={[40, 20]}>
        <Col span={12}>
          <Alert title={'信息'}>{'这是一条信息提示。'}</Alert>
        </Col>
        <Col span={12}>
          <Alert title={'成功'} type={'success'}>
            {'这是一条成功提示。'}
          </Alert>
        </Col>
        <Col span={12}>
          <Alert type={'warning'} title={<>{' 警告 '}</>}>
            {' 这是一条警告提示。 '}
          </Alert>
        </Col>
        <Col span={12}>
          <Alert type={'error'} title={<>{' 错误 '}</>}>
            {' 这是一条错误提示。 '}
          </Alert>
        </Col>
      </Row>
    </>
  );
}
