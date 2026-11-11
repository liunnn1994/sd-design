/** @jsxImportSource react */
import { Message } from '@sdata/web-react';
import { Button, Col, Countdown, Row, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const now = Date.now();
  const [start, setStart] = useState(false);
  const handleFinish = () => {
    Message.info('已结束');
  };

  return (
    <>
      <Row>
        <Col flex={1}>
          <Countdown title={'倒计时'} value={now + 1000 * 60 * 60 * 2} now={now} />
        </Col>
        <Col flex={1}>
          <Countdown
            title={'毫秒'}
            value={now + 1000 * 60 * 60 * 2}
            now={now}
            format={'HH:mm:ss.SSS'}
            animation={false}
          />
        </Col>
        <Col flex={1}>
          <Countdown
            title={'天'}
            value={now + 1000 * 60 * 60 * 24 * 4}
            now={now}
            format={'D 天 H 时 m 分 s 秒'}
          />
        </Col>
      </Row>
      <Space direction={'vertical'} className={'sd:mt-2.5'}>
        <Countdown
          title={'结束时触发'}
          value={Date.now() + 5 * 1000}
          format={'mm:ss.SSS'}
          now={Date.now()}
          start={start}
          onFinish={handleFinish}
        />
        <Button
          onClick={() => {
            setStart(true);
          }}
          type={'primary'}
        >
          {'开始'}
        </Button>
      </Space>
    </>
  );
}
