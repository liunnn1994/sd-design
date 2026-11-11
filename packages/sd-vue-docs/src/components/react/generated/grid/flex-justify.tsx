/** @jsxImportSource react */
import { Col, Row } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div data-v-1203e4f2="">
        <p data-v-1203e4f2="">{'左对齐'}</p>
        <Row data-v-1203e4f2="" className={'grid-demo sd:text-white'} justify={'start'}>
          <Col data-v-1203e4f2="" span={4} className={'sd:bg-[#4096ff]'}>
            <div data-v-1203e4f2="">{'col - 4'}</div>
          </Col>
          <Col data-v-1203e4f2="" span={4} className={'sd:bg-[#0958d9]'}>
            <div data-v-1203e4f2="">{'col - 4'}</div>
          </Col>
          <Col data-v-1203e4f2="" span={4} className={'sd:bg-[#4096ff]'}>
            <div data-v-1203e4f2="">{'col - 4'}</div>
          </Col>
          <Col data-v-1203e4f2="" span={4} className={'sd:bg-[#0958d9]'}>
            <div data-v-1203e4f2="">{'col - 4'}</div>
          </Col>
        </Row>
        <p data-v-1203e4f2="">{'居中对齐'}</p>
        <Row data-v-1203e4f2="" className={'grid-demo sd:text-white'} justify={'center'}>
          <Col data-v-1203e4f2="" span={4} className={'sd:bg-[#4096ff]'}>
            <div data-v-1203e4f2="">{'col - 4'}</div>
          </Col>
          <Col data-v-1203e4f2="" span={4} className={'sd:bg-[#0958d9]'}>
            <div data-v-1203e4f2="">{'col - 4'}</div>
          </Col>
          <Col data-v-1203e4f2="" span={4} className={'sd:bg-[#4096ff]'}>
            <div data-v-1203e4f2="">{'col - 4'}</div>
          </Col>
          <Col data-v-1203e4f2="" span={4} className={'sd:bg-[#0958d9]'}>
            <div data-v-1203e4f2="">{'col - 4'}</div>
          </Col>
        </Row>
        <p data-v-1203e4f2="">{'右对齐'}</p>
        <Row data-v-1203e4f2="" className={'grid-demo sd:text-white'} justify={'end'}>
          <Col data-v-1203e4f2="" span={4} className={'sd:bg-[#4096ff]'}>
            <div data-v-1203e4f2="">{'col - 4'}</div>
          </Col>
          <Col data-v-1203e4f2="" span={4} className={'sd:bg-[#0958d9]'}>
            <div data-v-1203e4f2="">{'col - 4'}</div>
          </Col>
          <Col data-v-1203e4f2="" span={4} className={'sd:bg-[#4096ff]'}>
            <div data-v-1203e4f2="">{'col - 4'}</div>
          </Col>
          <Col data-v-1203e4f2="" span={4} className={'sd:bg-[#0958d9]'}>
            <div data-v-1203e4f2="">{'col - 4'}</div>
          </Col>
        </Row>
        <p data-v-1203e4f2="">{'两侧均分'}</p>
        <Row data-v-1203e4f2="" className={'grid-demo sd:text-white'} justify={'space-around'}>
          <Col data-v-1203e4f2="" span={4} className={'sd:bg-[#4096ff]'}>
            <div data-v-1203e4f2="">{'col - 4'}</div>
          </Col>
          <Col data-v-1203e4f2="" span={4} className={'sd:bg-[#0958d9]'}>
            <div data-v-1203e4f2="">{'col - 4'}</div>
          </Col>
          <Col data-v-1203e4f2="" span={4} className={'sd:bg-[#4096ff]'}>
            <div data-v-1203e4f2="">{'col - 4'}</div>
          </Col>
          <Col data-v-1203e4f2="" span={4} className={'sd:bg-[#0958d9]'}>
            <div data-v-1203e4f2="">{'col - 4'}</div>
          </Col>
        </Row>
        <p data-v-1203e4f2="">{'两端对齐'}</p>
        <Row data-v-1203e4f2="" className={'grid-demo sd:text-white'} justify={'space-between'}>
          <Col data-v-1203e4f2="" span={4} className={'sd:bg-[#4096ff]'}>
            <div data-v-1203e4f2="">{'col - 4'}</div>
          </Col>
          <Col data-v-1203e4f2="" span={4} className={'sd:bg-[#0958d9]'}>
            <div data-v-1203e4f2="">{'col - 4'}</div>
          </Col>
          <Col data-v-1203e4f2="" span={4} className={'sd:bg-[#4096ff]'}>
            <div data-v-1203e4f2="">{'col - 4'}</div>
          </Col>
          <Col data-v-1203e4f2="" span={4} className={'sd:bg-[#0958d9]'}>
            <div data-v-1203e4f2="">{'col - 4'}</div>
          </Col>
        </Row>
      </div>
      <style>
        {
          '\n.grid-demo[data-v-1203e4f2] {\n    margin-bottom: 40px;\n    background-color: var(--color-fill-2);\n}\n.grid-demo[data-v-1203e4f2]:last-child {\n    margin-bottom: 0;\n}\n.grid-demo .sd-col[data-v-1203e4f2] {\n    height: 48px;\n    line-height: 48px;\n    text-align: center;\n}\n'
        }
      </style>
    </>
  );
}
