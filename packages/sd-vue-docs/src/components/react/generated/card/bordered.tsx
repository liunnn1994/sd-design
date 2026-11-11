/** @jsxImportSource react */
import { getCssVarToken } from '@sdata/web-react';
import { Card, Col, Link, Row } from '@sdata/web-react';
import { type CSSProperties } from 'react';

export default function Example() {
  return (
    <>
      <div
        className={'sd:box-border sd:w-full sd:p-10'}
        style={{ backgroundColor: `var(${getCssVarToken('--color-fill-2')})` } as CSSProperties}
      >
        <Row gutter={20} className={'sd:mb-5'}>
          <Col span={8}>
            <Card
              title={'SD 卡片'}
              bordered={false}
              className={'sd:w-full'}
              extra={
                <>
                  <Link>{'更多'}</Link>
                </>
              }
            >
              {' 卡片内容 '}
            </Card>
          </Col>
          <Col span={8}>
            <Card
              title={'SD 卡片'}
              bordered={false}
              className={'sd:w-full'}
              extra={
                <>
                  <Link>{'更多'}</Link>
                </>
              }
            >
              {' 卡片内容 '}
            </Card>
          </Col>
          <Col span={8}>
            <Card
              title={'SD 卡片'}
              bordered={false}
              className={'sd:w-full'}
              extra={
                <>
                  <Link>{'更多'}</Link>
                </>
              }
            >
              {' 卡片内容 '}
            </Card>
          </Col>
        </Row>
        <Row gutter={20}>
          <Col span={16}>
            <Card
              title={'SD 卡片'}
              bordered={false}
              className={'sd:w-full'}
              extra={
                <>
                  <Link>{'更多'}</Link>
                </>
              }
            >
              {' 卡片内容 '}
            </Card>
          </Col>
          <Col span={8}>
            <Card
              title={'SD 卡片'}
              bordered={false}
              className={'sd:w-full'}
              extra={
                <>
                  <Link>{'更多'}</Link>
                </>
              }
            >
              {' 卡片内容 '}
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}
