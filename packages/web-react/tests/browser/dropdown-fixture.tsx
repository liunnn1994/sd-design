import { useState } from 'react';

import { Button } from '../../src/button';
import { Dropdown, Doption, Dgroup, Dsubmenu } from '../../src/dropdown';

export function DropdownFixture() {
  const params = new URLSearchParams(location.search);
  const mainDisabled = params.has('main-disabled');
  const [selected, setSelected] = useState('');
  const [empty, setEmpty] = useState(false);
  const [disabled, setDisabled] = useState(!mainDisabled);
  const [visible, setVisible] = useState(false);
  const [requests, setRequests] = useState(0);
  const [updated, setUpdated] = useState(false);
  const [scrollEvents, setScrollEvents] = useState<string[]>([]);
  return (
    <section>
      <output data-testid="dropdown-selected">{selected}</output>
      <output data-testid="dropdown-requests">{requests}</output>
      <output data-testid="dropdown-scroll">{scrollEvents.join('|')}</output>
      <Dropdown
        defaultPopupVisible={params.has('open')}
        onSelect={(value) => setSelected(JSON.stringify(value))}
        header="菜单头"
        footer="菜单尾"
        content={
          <>
            <Dgroup title="操作组">
              <Doption disabled value="disabled">
                禁用选项
              </Doption>
              <Doption value={0} icon="★" suffix="⌘A">
                零值选项
              </Doption>
              <Doption>回退文本</Doption>
            </Dgroup>
            <Dsubmenu disabled content={<Doption>不应打开</Doption>}>
              禁用子菜单
            </Dsubmenu>
            <Dsubmenu content={<Doption value={{ id: 7 }}>子菜单操作</Doption>}>更多操作</Dsubmenu>
          </>
        }
      >
        <Button>打开菜单测试</Button>
      </Dropdown>
      <Dropdown
        hideOnSelect={false}
        popupMaxHeight={updated ? false : 100}
        onScroll={() => setScrollEvents((events) => [...events, 'scroll'])}
        onReachBottom={() => setScrollEvents((events) => [...events, 'bottom'])}
        isEmpty={empty}
        footer={updated ? undefined : '保留菜单尾'}
        header={<input aria-label="菜单搜索" />}
        onSelect={(value) => setSelected(String(value))}
        content={
          <>
            <li>
              <input aria-label="列表内输入" />
            </li>
            <Doption onClick={() => setEmpty(!empty)}>切换菜单空态</Doption>
            <Doption onClick={() => setUpdated(!updated)}>{updated ? '更新后' : '更新前'}</Doption>
            {Array.from({ length: 12 }, (_, index) => (
              <Doption key={index} value={index}>
                滚动项 {index}
              </Doption>
            ))}
          </>
        }
      >
        <Button>保留菜单测试</Button>
      </Dropdown>
      <Dropdown
        popupVisible={visible}
        onPopupVisibleChange={() => setRequests((value) => value + 1)}
        content={<Doption>受控菜单内容</Doption>}
      >
        <Button>拒绝菜单写回</Button>
      </Dropdown>
      <Button onClick={() => setVisible(!visible)}>外部切换菜单</Button>
      <Button onClick={() => setDisabled(!disabled)}>切换分裂禁用</Button>
      <input aria-label="菜单外输入" />
      <Dropdown trigger="hover" disabled={disabled} content={<Doption>悬停菜单内容</Doption>}>
        <Button>悬停菜单测试</Button>
      </Dropdown>
      <div data-testid="split-dropdown">
        <Dropdown.Button
          data-testid="split-root"
          className="split-custom"
          disabled={disabled}
          buttonProps={{ disabled: mainDisabled }}
          onClick={() => setSelected('main')}
          onSelect={() => setSelected('split')}
          icon={({ popupVisible }) => <span>{popupVisible ? '收起分裂菜单' : '打开分裂菜单'}</span>}
          content={<Doption>分裂选项</Doption>}
        >
          主操作
        </Dropdown.Button>
      </div>
    </section>
  );
}
