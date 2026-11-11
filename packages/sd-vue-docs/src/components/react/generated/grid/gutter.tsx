/** @jsxImportSource react */
import { Col, Row } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div data-v-047e0bda="">
        <p data-v-047e0bda="">{'水平'}</p>
        <Row data-v-047e0bda="" className={'grid-demo sd:text-white'} gutter={24}>
          <Col data-v-047e0bda="" span={12}>
            <div data-v-047e0bda="" className={'sd:bg-[#4096ff]'}>
              {'col - 12'}
            </div>
          </Col>
          <Col data-v-047e0bda="" span={12}>
            <div data-v-047e0bda="" className={'sd:bg-[#0958d9]'}>
              {'col - 12'}
            </div>
          </Col>
        </Row>
        <p data-v-047e0bda="">{'响应式'}</p>
        <Row
          data-v-047e0bda=""
          className={'grid-demo sd:text-white'}
          gutter={{ md: 8, lg: 24, xl: 32 }}
        >
          <Col data-v-047e0bda="" span={6}>
            <div data-v-047e0bda="" className={'sd:bg-[#4096ff]'}>
              {'col - 6'}
            </div>
          </Col>
          <Col data-v-047e0bda="" span={6}>
            <div data-v-047e0bda="" className={'sd:bg-[#0958d9]'}>
              {'col - 6'}
            </div>
          </Col>
          <Col data-v-047e0bda="" span={6}>
            <div data-v-047e0bda="" className={'sd:bg-[#4096ff]'}>
              {'col - 6'}
            </div>
          </Col>
          <Col data-v-047e0bda="" span={6}>
            <div data-v-047e0bda="" className={'sd:bg-[#0958d9]'}>
              {'col - 6'}
            </div>
          </Col>
        </Row>
        <p data-v-047e0bda="">{'水平和垂直'}</p>
        <Row data-v-047e0bda="" className={'grid-demo sd:text-white'} gutter={[24, 12]}>
          <Col data-v-047e0bda="" span={6}>
            <div data-v-047e0bda="" className={'sd:bg-[#4096ff]'}>
              {'col - 6'}
            </div>
          </Col>
          <Col data-v-047e0bda="" span={6}>
            <div data-v-047e0bda="" className={'sd:bg-[#0958d9]'}>
              {'col - 6'}
            </div>
          </Col>
          <Col data-v-047e0bda="" span={6}>
            <div data-v-047e0bda="" className={'sd:bg-[#4096ff]'}>
              {'col - 6'}
            </div>
          </Col>
          <Col data-v-047e0bda="" span={6}>
            <div data-v-047e0bda="" className={'sd:bg-[#0958d9]'}>
              {'col - 6'}
            </div>
          </Col>
          <Col data-v-047e0bda="" span={6}>
            <div data-v-047e0bda="" className={'sd:bg-[#4096ff]'}>
              {'col - 6'}
            </div>
          </Col>
          <Col data-v-047e0bda="" span={6}>
            <div data-v-047e0bda="" className={'sd:bg-[#0958d9]'}>
              {'col - 6'}
            </div>
          </Col>
          <Col data-v-047e0bda="" span={6}>
            <div data-v-047e0bda="" className={'sd:bg-[#4096ff]'}>
              {'col - 6'}
            </div>
          </Col>
          <Col data-v-047e0bda="" span={6}>
            <div data-v-047e0bda="" className={'sd:bg-[#0958d9]'}>
              {'col - 6'}
            </div>
          </Col>
        </Row>
      </div>
      <style>
        {
          '\n.grid-demo .sd-col[data-v-047e0bda] {\n    height: 48px;\n}\n.grid-demo .sd-col > div[data-v-047e0bda] {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    height: 100%;\n}\n'
        }
      </style>
    </>
  );
}
