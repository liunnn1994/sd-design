import { Alert, Col, Row } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconExclamationCircleFill } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Row gutter={[40, 20]}>
        <Col span={12}>
          <Alert>{'这是一条信息提示。'}</Alert>
        </Col>
        <Col span={12}>
          <Alert type={'success'}>{'这是一条成功提示。'}</Alert>
        </Col>
        <Col span={12}>
          <Alert type={'warning'}>{'这是一条警告提示。'}</Alert>
        </Col>
        <Col span={12}>
          <Alert type={'error'}>{'这是一条错误提示。'}</Alert>
        </Col>
        <Col span={12}>
          <Alert
            type={'normal'}
            icon={
              <>
                <IconExclamationCircleFill />
              </>
            }
          >
            {' 这是一条普通提示。 '}
          </Alert>
        </Col>
      </Row>
    </>
  );
}
