import { useRef, useState } from 'react';

import type { DrawerReturn } from '../../src/index';

import { Button, ConfigProvider, Drawer } from '../../src/index';

export function DrawerFixture() {
  const imperative = useRef<DrawerReturn>(null);
  const [visible, setVisible] = useState(false);
  const [nested, setNested] = useState(false);
  const [veto, setVeto] = useState(true);
  const [local, setLocal] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const log = (event: string) => setEvents((items) => [...items, event]);
  return (
    <section>
      <Button
        onClick={() => {
          imperative.current = Drawer.open(
            {
              title: () => '命令抽屉',
              content: () => <input aria-label="命令抽屉输入" />,
              width: 280,
              className: 'imperative-drawer',
              onOk: () => log('imperativeOk'),
              onCancel: () => log('imperativeCancel'),
              onClose: () => log('imperativeClose'),
            },
            { drawer: { placement: 'left' } },
          );
        }}
      >
        打开命令抽屉
      </Button>
      <Button onClick={() => imperative.current?.update({ width: 410, maskClosable: false })}>
        更新命令抽屉
      </Button>
      <Button onClick={() => imperative.current?.close()}>关闭命令抽屉</Button>
      <Button
        onClick={() =>
          Drawer.open({ content: '瞬时抽屉', onClose: () => log('immediateClose') }).close()
        }
      >
        立即关闭命令抽屉
      </Button>
      <Button onClick={() => setVisible(true)}>打开抽屉测试</Button>
      <Button onClick={() => setLocal(!local)}>切换容器抽屉</Button>
      <output data-testid="drawer-events">{events.join(',')}</output>
      <ConfigProvider drawer={{ placement: 'left', width: 320 }}>
        <Drawer
          title="抽屉测试"
          visible={visible}
          onVisibleChange={setVisible}
          unmountOnClose
          onBeforeOk={() => new Promise((resolve) => setTimeout(() => resolve(!veto), 100))}
          onBeforeOpen={() => log('beforeOpen')}
          onOpen={() => log('open')}
          onBeforeClose={() => log('beforeClose')}
          onClose={() => log('close')}
          onOk={() => log('ok')}
        >
          <input aria-label="抽屉输入" />
          <Button onClick={() => setNested(true)}>打开内层抽屉</Button>
          <Button onClick={() => setVeto(false)}>允许抽屉确认</Button>
          <Drawer
            title="内层抽屉"
            visible={nested}
            onVisibleChange={setNested}
            footer={false}
            unmountOnClose
          >
            <input aria-label="内层输入" />
          </Drawer>
        </Drawer>
      </ConfigProvider>
      <div id="drawer-container" style={{ position: 'relative', height: 120 }}>
        <Drawer
          visible={local}
          popupContainer="#drawer-container"
          placement="bottom"
          height={80}
          mask={false}
          header={false}
          footer={false}
          escToClose={false}
        >
          容器内抽屉
        </Drawer>
      </div>
    </section>
  );
}
