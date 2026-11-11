/** @jsxImportSource react */
import { Alert, Col, Row } from '@sdata/web-react';
import { IconCloseCircle } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Row gutter={[40, 20]}>
        <Col span={12}>
          <Alert
            closable={true}
            closeElement={
              <>
                <IconCloseCircle />
              </>
            }
          >
            {' 这是一条信息提示。 '}
          </Alert>
        </Col>
        <Col span={12}>
          <Alert closable={true} closeElement={<>{' 关闭 '}</>}>
            {' 这是一条信息提示。 '}
          </Alert>
        </Col>
      </Row>
    </>
  );
}
