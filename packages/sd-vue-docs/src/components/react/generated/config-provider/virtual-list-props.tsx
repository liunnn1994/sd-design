/** @jsxImportSource react */
import {
  AutoComplete,
  Cascader,
  ConfigProvider,
  Select,
  Space,
  Switch,
  Tag,
  TreeSelect,
} from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [enabled, setEnabled] = useState(true);
  const providerVirtualListProps = (() => {
    if (!enabled) {
      return undefined;
    }

    return {
      height: 176,
      buffer: 220,
    };
  })();
  const overrideVirtualListProps = {
    height: 132,
    buffer: 160,
  };
  const selectOptions = Array.from({ length: 1200 }, (_, index) => ({
    label: `城市选项 ${index + 1}`,
    value: `city-${index + 1}`,
  }));
  const autoCompleteOptions = Array.from({ length: 1600 }, (_, index) => `搜索建议 ${index + 1}`);
  const cascaderOptions = Array.from({ length: 2400 }, (_, groupIndex) => ({
    label: `区域 ${groupIndex + 1}`,
    value: `region-${groupIndex + 1}`,
    children: Array.from({ length: 12 }, (_, childIndex) => ({
      label: `节点 ${groupIndex + 1}-${childIndex + 1}`,
      value: `region-${groupIndex + 1}-node-${childIndex + 1}`,
    })),
  }));
  const treeOptions = [
    {
      title: '组织架构',
      key: 'root',
      value: 'root',
      children: Array.from({ length: 800 }, (_, index) => ({
        title: `成员 ${index + 1}`,
        key: `member-${index + 1}`,
        value: `member-${index + 1}`,
      })),
    },
  ];

  return (
    <>
      <div data-v-d7c46f3b="" className={'config-provider-virtual-list-props-demo'}>
        <Space data-v-d7c46f3b="" align={'center'} wrap={true}>
          <Switch
            data-v-d7c46f3b=""
            value={enabled}
            onChange={(next) => setEnabled(next as typeof enabled)}
            checkedText={<>{'全局 virtualListProps 开启'}</>}
            uncheckedText={<>{'全局 virtualListProps 关闭'}</>}
          />
          <Tag data-v-d7c46f3b="" color={'blue'}>
            {'组件显式传入 virtual-list-props 时优先级更高'}
          </Tag>
        </Space>
        <ConfigProvider data-v-d7c46f3b="" virtualListProps={providerVirtualListProps}>
          <div data-v-d7c46f3b="" className={'config-provider-virtual-list-props-demo__grid'}>
            <section data-v-d7c46f3b="" className={'config-provider-virtual-list-props-demo__card'}>
              <div data-v-d7c46f3b="" className={'config-provider-virtual-list-props-demo__title'}>
                {'Select 继承全局默认值'}
              </div>
              <div
                data-v-d7c46f3b=""
                className={'config-provider-virtual-list-props-demo__popup-host'}
              >
                <Select
                  data-v-d7c46f3b=""
                  options={selectOptions}
                  placeholder={'继承 176px 的虚拟滚动高度'}
                />
              </div>
            </section>
            <section data-v-d7c46f3b="" className={'config-provider-virtual-list-props-demo__card'}>
              <div data-v-d7c46f3b="" className={'config-provider-virtual-list-props-demo__title'}>
                {' AutoComplete 也会继承这组参数 '}
              </div>
              <div
                data-v-d7c46f3b=""
                className={'config-provider-virtual-list-props-demo__popup-host'}
              >
                <AutoComplete
                  data-v-d7c46f3b=""
                  data={autoCompleteOptions}
                  placeholder={'继承 176px 的虚拟滚动高度'}
                />
              </div>
            </section>
            <section data-v-d7c46f3b="" className={'config-provider-virtual-list-props-demo__card'}>
              <div data-v-d7c46f3b="" className={'config-provider-virtual-list-props-demo__title'}>
                {'Cascader 继承同一组参数'}
              </div>
              <div
                data-v-d7c46f3b=""
                className={'config-provider-virtual-list-props-demo__popup-host'}
              >
                <Cascader
                  data-v-d7c46f3b=""
                  options={cascaderOptions}
                  placeholder={'继承 176px 的虚拟滚动高度'}
                />
              </div>
            </section>
            <section data-v-d7c46f3b="" className={'config-provider-virtual-list-props-demo__card'}>
              <div data-v-d7c46f3b="" className={'config-provider-virtual-list-props-demo__title'}>
                {'TreeSelect 也会继承'}
              </div>
              <div
                data-v-d7c46f3b=""
                className={'config-provider-virtual-list-props-demo__popup-host'}
              >
                <TreeSelect
                  data-v-d7c46f3b=""
                  data={treeOptions}
                  placeholder={'继承 176px 的虚拟滚动高度'}
                  treeCheckStrictly={true}
                />
              </div>
            </section>
            <section data-v-d7c46f3b="" className={'config-provider-virtual-list-props-demo__card'}>
              <div data-v-d7c46f3b="" className={'config-provider-virtual-list-props-demo__title'}>
                {'显式 props 仍然优先'}
              </div>
              <div
                data-v-d7c46f3b=""
                className={'config-provider-virtual-list-props-demo__popup-host'}
              >
                <Select
                  data-v-d7c46f3b=""
                  options={selectOptions}
                  virtualListProps={overrideVirtualListProps}
                  placeholder={'这个 Select 显式改成 132px 高度'}
                />
              </div>
            </section>
          </div>
        </ConfigProvider>
      </div>
      <style>
        {
          '\n.config-provider-virtual-list-props-demo[data-v-d7c46f3b] {\n    display: grid;\n    gap: 12px;\n}\n.config-provider-virtual-list-props-demo__grid[data-v-d7c46f3b] {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\n    gap: 16px;\n}\n.config-provider-virtual-list-props-demo__card[data-v-d7c46f3b] {\n    display: grid;\n    gap: 10px;\n}\n.config-provider-virtual-list-props-demo__title[data-v-d7c46f3b] {\n    color: rgb(var(--sd-color-text-2));\n    font-size: 13px;\n    line-height: 1.5;\n}\n.config-provider-virtual-list-props-demo__popup-host[data-v-d7c46f3b] {\n    position: relative;\n    padding: 12px;\n    overflow: hidden;\n    background: rgb(var(--sd-color-fill-1));\n    border: 1px solid rgb(var(--sd-color-border-2));\n    border-radius: var(--sd-border-radius-medium);\n}\n'
        }
      </style>
    </>
  );
}
