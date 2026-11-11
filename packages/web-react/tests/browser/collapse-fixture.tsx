import { useState } from 'react';

import { Button, Collapse, CollapseItem } from '../../src/index';

export function CollapseFixture() {
  const [destroy, setDestroy] = useState(true);
  const [keys, setKeys] = useState<(string | number)[]>([]);
  const [requests, setRequests] = useState(0);
  const [showIcon, setShowIcon] = useState(true);
  return (
    <section>
      <Button onClick={() => setDestroy(!destroy)}>切换折叠销毁</Button>
      <Button onClick={() => setKeys(keys.length ? [] : [0])}>外部展开面板</Button>
      <Button onClick={() => setShowIcon(!showIcon)}>切换折叠图标</Button>
      <output data-testid="collapse-requests">{requests}</output>
      <Collapse
        data-testid="accordion"
        accordion
        defaultActiveKey={['first']}
        destroyOnHide={destroy}
        showExpandIcon={showIcon}
        expandIconPosition="right"
        bordered={false}
        expandIcon={({ active, position }) => (
          <b>
            {position}:{active ? '开' : '关'}
          </b>
        )}
      >
        <>
          <CollapseItem key="first" header="面板一">
            <input aria-label="面板一输入" />
          </CollapseItem>
          <Collapse.Item
            key="second"
            header="面板二"
            expandIcon={({ active }) => <i>{active ? '局部开' : '局部关'}</i>}
          >
            <input aria-label="面板二输入" />
          </Collapse.Item>
        </>
        <CollapseItem itemKey="disabled" header="禁用面板" disabled>
          禁用内容
        </CollapseItem>
      </Collapse>
      <Collapse
        data-testid="controlled-collapse"
        activeKey={keys}
        onChange={() => setRequests((value) => value + 1)}
      >
        <CollapseItem
          itemKey={0}
          header="数字零面板"
          extra={<Button onClick={(event) => event.stopPropagation()}>独立操作</Button>}
        >
          <p>零值内容</p>
        </CollapseItem>
      </Collapse>
      <Collapse data-testid="editable-collapse">
        <CollapseItem itemKey="input" header={<input aria-label="标题输入" />}>
          编辑标题内容
        </CollapseItem>
      </Collapse>
    </section>
  );
}
