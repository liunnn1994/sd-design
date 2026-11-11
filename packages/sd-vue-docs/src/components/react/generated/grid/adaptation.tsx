/** @jsxImportSource react */
import { Col, Row } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Row data-v-4cbe697e="" className={'grid-demo sd:text-white'}>
        <Col
          data-v-4cbe697e=""
          xs={2}
          sm={4}
          md={6}
          lg={8}
          xl={10}
          xxl={8}
          className={'sd:bg-[#4096ff]'}
        >
          {' 列 '}
        </Col>
        <Col
          data-v-4cbe697e=""
          xs={20}
          sm={16}
          md={12}
          lg={8}
          xl={4}
          xxl={8}
          className={'sd:bg-[#0958d9]'}
        >
          {' 列 '}
        </Col>
        <Col
          data-v-4cbe697e=""
          xs={2}
          sm={4}
          md={6}
          lg={8}
          xl={10}
          xxl={8}
          className={'sd:bg-[#4096ff]'}
        >
          {' 列 '}
        </Col>
      </Row>
      <style>
        {
          '\n.grid-demo .sd-col[data-v-4cbe697e] {\n    height: 48px;\n    line-height: 48px;\n    text-align: center;\n}\n'
        }
      </style>
    </>
  );
}
