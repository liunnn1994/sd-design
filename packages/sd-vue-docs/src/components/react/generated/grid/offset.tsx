/** @jsxImportSource react */
import { Col, Row } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div data-v-83239db7="">
        <Row
          data-v-83239db7=""
          className={'grid-demo sd:mb-4 sd:bg-[var(--color-fill-2)] sd:text-white'}
        >
          <Col data-v-83239db7="" span={8} className={'sd:bg-[#4096ff]'}>
            {'col - 8'}
          </Col>
          <Col data-v-83239db7="" span={8} offset={8} className={'sd:bg-[#0958d9]'}>
            {' col - 8 | offset - 8 '}
          </Col>
        </Row>
        <Row
          data-v-83239db7=""
          className={'grid-demo sd:mb-4 sd:bg-[var(--color-fill-2)] sd:text-white'}
        >
          <Col data-v-83239db7="" span={6} offset={8} className={'sd:bg-[#4096ff]'}>
            {' col - 6 | offset - 8 '}
          </Col>
          <Col data-v-83239db7="" span={6} offset={4} className={'sd:bg-[#0958d9]'}>
            {' col - 6 | offset - 4 '}
          </Col>
        </Row>
        <Row data-v-83239db7="" className={'grid-demo sd:bg-[var(--color-fill-2)] sd:text-white'}>
          <Col data-v-83239db7="" span={12} offset={8} className={'sd:bg-[#4096ff]'}>
            {' col - 12 | offset - 8 '}
          </Col>
        </Row>
      </div>
      <style>
        {
          '\n.grid-demo .sd-col[data-v-83239db7] {\n    height: 48px;\n    line-height: 48px;\n    text-align: center;\n}\n'
        }
      </style>
    </>
  );
}
