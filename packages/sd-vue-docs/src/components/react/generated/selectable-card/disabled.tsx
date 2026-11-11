/** @jsxImportSource react */
import { SelectableCard, Space } from '@sdata/web-react';

export default function Example() {
  function onChange(_isSelected: boolean) {
    // 在这里同步业务选择状态
  }

  return (
    <>
      <Space size={16}>
        <SelectableCard
          label={'可选方案'}
          isSelected={false}
          title={'可选方案'}
          value={'随时启用'}
          onChange={onChange}
        />
        <SelectableCard
          label={'不可选方案'}
          isSelected={true}
          isDisabled={true}
          title={'不可选方案'}
          value={'已停用'}
          color={'gray'}
          variant={'soft'}
          onChange={onChange}
        />
      </Space>
    </>
  );
}
