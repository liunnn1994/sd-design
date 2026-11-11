/** @jsxImportSource react */
import { Col, Row } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div data-v-7d8fc82c="">
        <Row data-v-7d8fc82c="" className={'grid-demo sd:text-white'}>
          <Col data-v-7d8fc82c="" span={6} order={4} className={'sd:bg-[#4096ff]'}>
            <div data-v-7d8fc82c="">{'1 col-order-4'}</div>
          </Col>
          <Col data-v-7d8fc82c="" span={6} order={3} className={'sd:bg-[#0958d9]'}>
            <div data-v-7d8fc82c="">{'2 col-order-3'}</div>
          </Col>
          <Col data-v-7d8fc82c="" span={6} order={2} className={'sd:bg-[#4096ff]'}>
            <div data-v-7d8fc82c="">{'3 col-order-2'}</div>
          </Col>
          <Col data-v-7d8fc82c="" span={6} order={1} className={'sd:bg-[#0958d9]'}>
            <div data-v-7d8fc82c="">{'4 col-order-1'}</div>
          </Col>
        </Row>
      </div>
      <style>
        {
          '\n.grid-demo .sd-col[data-v-7d8fc82c] {\n    height: 48px;\n    line-height: 48px;\n    text-align: center;\n}\n'
        }
      </style>
    </>
  );
}
