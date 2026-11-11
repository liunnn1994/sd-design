/** @jsxImportSource react */
import { Col, Row } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div data-v-e3c7e122="">
        <p data-v-e3c7e122="">{'顶部对齐'}</p>
        <Row data-v-e3c7e122="" className={'grid-demo sd:text-white'} align={'start'}>
          <Col data-v-e3c7e122="" span={6} className={'sd:bg-[#4096ff]'}>
            <div data-v-e3c7e122="">{'col - 6'}</div>
          </Col>
          <Col data-v-e3c7e122="" span={6} className={'sd:bg-[#0958d9]'}>
            <div data-v-e3c7e122="">{'col - 6'}</div>
          </Col>
          <Col data-v-e3c7e122="" span={6} className={'sd:bg-[#4096ff]'}>
            <div data-v-e3c7e122="">{'col - 6'}</div>
          </Col>
          <Col data-v-e3c7e122="" span={6} className={'sd:bg-[#0958d9]'}>
            <div data-v-e3c7e122="">{'col - 6'}</div>
          </Col>
        </Row>
        <p data-v-e3c7e122="">{'居中对齐'}</p>
        <Row data-v-e3c7e122="" className={'grid-demo sd:text-white'} align={'center'}>
          <Col data-v-e3c7e122="" span={6} className={'sd:bg-[#4096ff]'}>
            <div data-v-e3c7e122="">{'col - 6'}</div>
          </Col>
          <Col data-v-e3c7e122="" span={6} className={'sd:bg-[#0958d9]'}>
            <div data-v-e3c7e122="">{'col - 6'}</div>
          </Col>
          <Col data-v-e3c7e122="" span={6} className={'sd:bg-[#4096ff]'}>
            <div data-v-e3c7e122="">{'col - 6'}</div>
          </Col>
          <Col data-v-e3c7e122="" span={6} className={'sd:bg-[#0958d9]'}>
            <div data-v-e3c7e122="">{'col - 6'}</div>
          </Col>
        </Row>
        <p data-v-e3c7e122="">{'底部对齐'}</p>
        <Row data-v-e3c7e122="" className={'grid-demo sd:text-white'} align={'end'}>
          <Col data-v-e3c7e122="" span={6} className={'sd:bg-[#4096ff]'}>
            <div data-v-e3c7e122="">{'col - 6'}</div>
          </Col>
          <Col data-v-e3c7e122="" span={6} className={'sd:bg-[#0958d9]'}>
            <div data-v-e3c7e122="">{'col - 6'}</div>
          </Col>
          <Col data-v-e3c7e122="" span={6} className={'sd:bg-[#4096ff]'}>
            <div data-v-e3c7e122="">{'col - 6'}</div>
          </Col>
          <Col data-v-e3c7e122="" span={6} className={'sd:bg-[#0958d9]'}>
            <div data-v-e3c7e122="">{'col - 6'}</div>
          </Col>
        </Row>
      </div>
      <style>
        {
          '\n.grid-demo[data-v-e3c7e122] {\n    margin-bottom: 40px;\n    background-color: var(--color-fill-2);\n}\n.grid-demo[data-v-e3c7e122]:last-child {\n    margin-bottom: 0;\n}\n.grid-demo .sd-col[data-v-e3c7e122] {\n    height: 48px;\n    line-height: 48px;\n    text-align: center;\n}\n.grid-demo .sd-col[data-v-e3c7e122]:nth-of-type(1) {\n    height: 90px;\n    line-height: 90px;\n}\n.grid-demo .sd-col[data-v-e3c7e122]:nth-of-type(2) {\n    height: 48px;\n    line-height: 48px;\n}\n.grid-demo .sd-col[data-v-e3c7e122]:nth-of-type(3) {\n    height: 120px;\n    line-height: 120px;\n}\n.grid-demo .sd-col[data-v-e3c7e122]:nth-of-type(4) {\n    height: 60px;\n    line-height: 60px;\n}\n'
        }
      </style>
    </>
  );
}
