/** @jsxImportSource react */
import { Col, Row } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Row data-v-eaea5388="" className={'grid-demo sd:mb-4 sd:text-white'}>
        <Col data-v-eaea5388="" flex={'100px'} className={'sd:bg-[#4096ff]'}>
          <div data-v-eaea5388="">{'100px'}</div>
        </Col>
        <Col data-v-eaea5388="" flex={'auto'} className={'sd:bg-[#0958d9]'}>
          <div data-v-eaea5388="">{'自动'}</div>
        </Col>
      </Row>
      <Row data-v-eaea5388="" className={'grid-demo sd:mb-4 sd:text-white'}>
        <Col data-v-eaea5388="" flex={'100px'} className={'sd:bg-[#4096ff]'}>
          <div data-v-eaea5388="">{'100px'}</div>
        </Col>
        <Col data-v-eaea5388="" flex={'auto'} className={'sd:bg-[#0958d9]'}>
          <div data-v-eaea5388="">{'自动'}</div>
        </Col>
        <Col data-v-eaea5388="" flex={'100px'} className={'sd:bg-[#4096ff]'}>
          <div data-v-eaea5388="">{'100px'}</div>
        </Col>
      </Row>
      <Row data-v-eaea5388="" className={'grid-demo sd:mb-4 sd:text-white'}>
        <Col data-v-eaea5388="" flex={3} className={'sd:bg-[#4096ff]'}>
          <div data-v-eaea5388="">{'3 / 12'}</div>
        </Col>
        <Col data-v-eaea5388="" flex={4} className={'sd:bg-[#0958d9]'}>
          <div data-v-eaea5388="">{'4 / 12'}</div>
        </Col>
        <Col data-v-eaea5388="" flex={5} className={'sd:bg-[#4096ff]'}>
          <div data-v-eaea5388="">{'5 / 12'}</div>
        </Col>
      </Row>
      <style>
        {
          '\n.grid-demo .sd-col[data-v-eaea5388] {\n    height: 48px;\n    line-height: 48px;\n    text-align: center;\n}\n'
        }
      </style>
    </>
  );
}
