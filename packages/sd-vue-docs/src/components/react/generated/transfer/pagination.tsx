/** @jsxImportSource react */
import { Table, Transfer, type TransferPanelState } from '@sdata/web-react';

const data = Array.from({ length: 24 }, (_, index) => ({
  value: `option${index + 1}`,
  label: `选项 ${index + 1}`,
}));
function panel({ data, selectedKeys, onSelect }: TransferPanelState) {
  return (
    <Table
      rowKey="value"
      columns={[{ title: '选项', dataIndex: 'label' }]}
      data={data.map((item) => ({ ...item }))}
      pagination={{ pageSize: 5, simple: true }}
      rowSelection={{ type: 'checkbox', showCheckedAll: true }}
      selectedKeys={selectedKeys}
      onSelectedKeysChange={(keys) => onSelect(keys.map(String))}
    />
  );
}

export default function Example() {
  return (
    <Transfer
      data={data}
      defaultValue={['option1', 'option3', 'option5']}
      renderSource={panel}
      renderTarget={panel}
    />
  );
}
