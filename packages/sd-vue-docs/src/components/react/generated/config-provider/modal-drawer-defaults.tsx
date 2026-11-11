/** @jsxImportSource react */
import { Button, ConfigProvider, Drawer, Modal, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  type ModalDefaults = {
    mask?: boolean;
    closable?: boolean;
    hideCancel?: boolean;
    alignCenter?: boolean;
    titleAlign?: 'start' | 'center';
    top?: number | string;
    maskStyle?: Record<string, string>;
    draggable?: boolean;
    escToClose?: boolean;
    okText?: string;
    cancelText?: string;
    width?: number | string;
  };
  type DrawerDefaults = {
    placement?: 'top' | 'right' | 'bottom' | 'left';
    mask?: boolean;
    closable?: boolean;
    hideCancel?: boolean;
    escToClose?: boolean;
    okText?: string;
    cancelText?: string;
    width?: number | string;
    height?: number | string;
  };
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const modalDefaults: ModalDefaults = {
    mask: false,
    closable: false,
    hideCancel: true,
    alignCenter: false,
    titleAlign: 'start',
    top: '10vh',
    maskStyle: { backgroundColor: 'rgba(0, 0, 0, 0.2)' },
    draggable: true,
    escToClose: false,
    okText: '全局确认',
    cancelText: '全局取消',
    width: 520,
  };
  const drawerDefaults: DrawerDefaults = {
    placement: 'bottom',
    mask: false,
    closable: false,
    hideCancel: true,
    escToClose: false,
    okText: '全局确认',
    cancelText: '全局取消',
    height: 360,
  };

  return (
    <>
      <div data-v-80fe4d31="" className={'config-provider-modal-drawer-demo'}>
        <ConfigProvider data-v-80fe4d31="" modal={modalDefaults} drawer={drawerDefaults}>
          <Space data-v-80fe4d31="">
            <Button
              data-v-80fe4d31=""
              type={'primary'}
              onClick={() => {
                setModalVisible(true);
              }}
            >
              {'打开 Modal'}
            </Button>
            <Button
              data-v-80fe4d31=""
              onClick={() => {
                setDrawerVisible(true);
              }}
            >
              {'打开 Drawer'}
            </Button>
          </Space>
          <Modal
            data-v-80fe4d31=""
            visible={modalVisible}
            onVisibleChange={(next) => setModalVisible(next as typeof modalVisible)}
            title={'全局默认值示例'}
          >
            {' Modal 将继承 ConfigProvider.modal 配置。 '}
          </Modal>
          <Drawer
            data-v-80fe4d31=""
            visible={drawerVisible}
            onVisibleChange={(next) => setDrawerVisible(next as typeof drawerVisible)}
            title={'全局默认值示例'}
          >
            {' Drawer 将继承 ConfigProvider.drawer 配置。 '}
          </Drawer>
        </ConfigProvider>
      </div>
      <style>
        {
          '\n.config-provider-modal-drawer-demo[data-v-80fe4d31] {\n    display: grid;\n    gap: 12px;\n}\n'
        }
      </style>
    </>
  );
}
