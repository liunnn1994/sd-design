import { useRef, useState } from 'react';

import type { DrawerProps, DrawerReturn } from '../../src/drawer';

import { Button } from '../../src/button';
import { ConfigProvider } from '../../src/config-provider';
import { Drawer } from '../../src/drawer';

const pending = new URLSearchParams(location.search).get('pending');
const scenario = new URLSearchParams(location.search).get('scenario');

export function DrawerScrollOwnershipFixture() {
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  return (
    <div id="drawer-scroll-owner" style={{ position: 'relative', height: 400, overflow: 'auto' }}>
      <div style={{ height: 800 }}>Scrollable content</div>
      <Drawer
        title="Lower owner"
        visible={lower}
        popupContainer="#drawer-scroll-owner"
        unmountOnClose
      >
        <button onClick={() => setLower(false)}>Close remaining owner</button>
      </Drawer>
      <Drawer
        title="Upper owner"
        visible={upper}
        popupContainer="#drawer-scroll-owner"
        unmountOnClose
      >
        <button onClick={() => setLower(false)}>Close lower owner</button>
        <button onClick={() => setUpper(false)}>Close upper owner</button>
      </Drawer>
    </div>
  );
}

export function DrawerFixture() {
  const imperative = useRef<DrawerReturn>(null);
  const finish = useRef<(closed: boolean) => void>(undefined);
  const [visible, setVisible] = useState(false);
  const [nested, setNested] = useState(false);
  const [escapeEnabled, setEscapeEnabled] = useState(scenario !== 'escape');
  const [veto, setVeto] = useState(true);
  const [local, setLocal] = useState(false);
  const [maskClosable, setMaskClosable] = useState(false);
  const [cancelAllowed, setCancelAllowed] = useState(false);
  const [customHeading, setCustomHeading] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const log = (event: string) => setEvents((items) => [...items, event]);
  const beforeOk: DrawerProps['onBeforeOk'] = (done) => {
    if (scenario === 'throw') {
      if (veto) throw new Error('Confirmation failed');
      return true;
    }
    if (pending === 'callback') {
      finish.current = done;
      return;
    }
    if (pending === 'promise')
      return new Promise<boolean>((resolve, reject) => {
        finish.current = (approved) => {
          if (approved) resolve(true);
          else reject(new Error('Confirmation rejected'));
        };
      });
    return new Promise((resolve) => setTimeout(() => resolve(!veto), 100));
  };
  return (
    <section style={{ minHeight: '180vh' }}>
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
          title={scenario === 'title' ? (customHeading ? 'Custom title' : undefined) : '抽屉测试'}
          header={scenario === 'header' && customHeading ? <span>Custom header</span> : undefined}
          visible={visible}
          onVisibleChange={(next) => {
            if (scenario === 'cancel') log(`visible:${next}`);
            setVisible(next);
          }}
          escToClose={escapeEnabled}
          maskClosable={scenario !== 'cancel' || maskClosable}
          unmountOnClose
          onBeforeOk={beforeOk}
          onBeforeCancel={
            scenario === 'cancel'
              ? () => {
                  log('beforeCancel');
                  return cancelAllowed;
                }
              : undefined
          }
          onCancel={scenario === 'cancel' ? () => log('cancel') : undefined}
          onBeforeOpen={() => log('beforeOpen')}
          onOpen={() => log('open')}
          onBeforeClose={() => log('beforeClose')}
          onClose={() => log('close')}
          onOk={() => log('ok')}
        >
          <input aria-label="抽屉输入" />
          <Button onClick={() => setNested(true)}>打开内层抽屉</Button>
          <Button onClick={() => setVeto(false)}>允许抽屉确认</Button>
          {(scenario === 'title' || scenario === 'header') && (
            <button onClick={() => setCustomHeading(!customHeading)}>Toggle drawer heading</button>
          )}
          {pending && (
            <>
              <Button onClick={() => setVisible(false)}>External close</Button>
              <Button onClick={() => finish.current?.(true)}>Finish confirmation</Button>
              {pending === 'promise' && (
                <Button onClick={() => finish.current?.(false)}>Reject confirmation</Button>
              )}
            </>
          )}
          {scenario === 'escape' && (
            <button onClick={() => setEscapeEnabled(true)}>Enable Escape</button>
          )}
          {scenario === 'cancel' && (
            <>
              <button onClick={() => setMaskClosable(true)}>Enable mask dismissal</button>
              <button onClick={() => setCancelAllowed(true)}>Allow cancel</button>
            </>
          )}
          {(scenario !== 'unmount' || nested) && (
            <Drawer
              title="内层抽屉"
              visible={nested}
              onVisibleChange={setNested}
              footer={false}
              unmountOnClose
            >
              <input aria-label="内层输入" />
              {scenario === 'unmount' && (
                <button onClick={() => setNested(false)}>Remove upper drawer</button>
              )}
            </Drawer>
          )}
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
