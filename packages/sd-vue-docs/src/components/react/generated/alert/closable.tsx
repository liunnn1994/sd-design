/** @jsxImportSource react */
import { Alert, Col, Row } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Row gutter={[40, 20]}>
        <Col span={12}>
          <Alert closable={true}>{'这是一条信息提示。'}</Alert>
        </Col>
        <Col span={12}>
          <Alert type={'success'} closable={true}>
            {'这是一条成功提示。'}
          </Alert>
        </Col>
        <Col span={12}>
          <Alert type={'warning'} closable={true} title={<>{' 警告 '}</>}>
            {' 这是一条警告提示。 '}
          </Alert>
        </Col>
        <Col span={12}>
          <Alert type={'error'} closable={true} title={<>{' 错误 '}</>}>
            {' 这是一条错误提示。 '}
          </Alert>
        </Col>
      </Row>
    </>
  );
}
