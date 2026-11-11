import {
  Cascader,
  ConfigProvider,
  Empty,
  List,
  Select,
  Space,
  Table,
  TreeSelect,
} from '@sdata/web-react';
/** @jsxImportSource react */
import { IconTrophy } from '@sdata/web-react/icon';

export default function Example() {
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
    },
    {
      title: '薪资',
      dataIndex: 'salary',
    },
    {
      title: '地址',
      dataIndex: 'address',
    },
    {
      title: '电子邮箱',
      dataIndex: 'email',
    },
  ];

  return (
    <>
      <ConfigProvider
        data-v-512b1052=""
        renderEmpty={(scope) => (
          <>
            {scope?.component === 'cascader' ? (
              <Empty data-v-512b1052="" description={'暂无级联选项'} inConfigProvider={true} />
            ) : scope?.component === 'select' ? (
              <Empty data-v-512b1052="" description={'暂无选项'} inConfigProvider={true} />
            ) : scope?.component === 'tree-select' ? (
              <Empty data-v-512b1052="" description={'暂无树选项'} inConfigProvider={true} />
            ) : scope?.component === 'list' ? (
              <Empty data-v-512b1052="" description={'暂无列表数据'} inConfigProvider={true} />
            ) : scope?.component === 'table' ? (
              <Empty data-v-512b1052="" description={'暂无表格数据'} inConfigProvider={true} />
            ) : (
              <div data-v-512b1052="" className={'my-empty'}>
                <IconTrophy data-v-512b1052="" />
              </div>
            )}
          </>
        )}
      >
        <Space data-v-512b1052="" direction={'vertical'} fill={true}>
          <Cascader data-v-512b1052="" options={[]} placeholder={'级联选择'} allowSearch={true} />
          <Select data-v-512b1052="" placeholder={'选择框'} allowSearch={true} />
          <TreeSelect data-v-512b1052="" placeholder={'树选择器'} />
          <List data-v-512b1052="" header={<>{' 暂无列表数据 '}</>} />
          <Table data-v-512b1052="" columns={columns} data={[]} />
          <Empty data-v-512b1052="" />
        </Space>
      </ConfigProvider>
      <style>
        {
          '\n.my-empty {\n    box-sizing: border-box;\n    width: 100%;\n    padding: 20px;\n    text-align: center;\n}\n'
        }
      </style>
    </>
  );
}
