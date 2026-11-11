/** @jsxImportSource react */
import { Col, Row } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div data-v-e840a7a4="">
        <Row data-v-e840a7a4="" className={'grid-demo sd:text-white'}>
          <Col
            data-v-e840a7a4=""
            xs={{ span: 5, offset: 1 }}
            lg={{ span: 6, offset: 2 }}
            className={'sd:bg-[#4096ff]'}
          >
            {' 列 '}
          </Col>
          <Col
            data-v-e840a7a4=""
            xs={{ span: 11, offset: 1 }}
            lg={{ span: 6, offset: 2 }}
            className={'sd:bg-[#0958d9]'}
          >
            {' 列 '}
          </Col>
          <Col
            data-v-e840a7a4=""
            xs={{ span: 5, offset: 1 }}
            lg={{ span: 6, offset: 2 }}
            className={'sd:bg-[#4096ff]'}
          >
            {' 列 '}
          </Col>
        </Row>
      </div>
      <style>
        {
          '\n.grid-demo .sd-col[data-v-e840a7a4] {\n    height: 48px;\n    line-height: 48px;\n    text-align: center;\n}\n'
        }
      </style>
    </>
  );
}
