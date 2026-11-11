/** @jsxImportSource react */
import { Select } from '@sdata/web-react';

export default function Example() {
  const options = [
    '北京',
    '上海',
    '广州',
    { label: '禁用', value: '禁用', disabled: true },
    '深圳',
    '成都',
    '武汉',
  ];
  const handleScroll = (ev: Event) => {
    console.log('滚动', ev);
  };
  const handleReachBottom = (ev: Event) => {
    console.log('滚动到底部', ev);
  };

  return (
    <>
      <Select
        className={'sd:w-80'}
        defaultValue={'北京'}
        placeholder={'请选择…'}
        options={options}
        onDropdownScroll={handleScroll}
        onDropdownReachBottom={handleReachBottom}
      />
    </>
  );
}
