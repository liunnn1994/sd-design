/** @jsxImportSource react */
import { defineJsonFormSchemas } from '@sdata/web-react';
import { Toolbar } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [formState, setFormState] = useState({
    name: '',
    status: '',
    region: '',
    owner: '',
    tag: '',
    type: '',
  });
  const statusOptions = [
    { label: '运行中', value: 'running' },
    { label: '已停止', value: 'stopped' },
  ];
  const regionOptions = [
    { label: '华东', value: 'east' },
    { label: '华北', value: 'north' },
    { label: '华南', value: 'south' },
  ];
  const typeOptions = [
    { label: '物理机', value: 'physical' },
    { label: '虚拟机', value: 'virtual' },
    { label: '容器', value: 'container' },
  ];
  const createSchemas = defineJsonFormSchemas();
  const schemas = createSchemas([
    { field: 'name', label: '名称', type: 'input', componentProps: { placeholder: '请输入名称' } },
    { field: 'status', label: '状态', type: 'select', componentProps: { options: statusOptions } },
    { field: 'region', label: '区域', type: 'select', componentProps: { options: regionOptions } },
    { field: 'type', label: '类型', type: 'select', componentProps: { options: typeOptions } },
    { field: 'owner', label: '负责人', type: 'input' },
    { field: 'tag', label: '标签', type: 'input' },
  ]);
  function onSearch(params: Record<string, unknown>) {
    console.log('search', params);
  }

  return (
    <>
      <Toolbar
        value={formState}
        onValueChange={(next) => setFormState(next as typeof formState)}
        schemas={schemas}
        allowExpand={true}
        onSearch={onSearch}
      />
    </>
  );
}
