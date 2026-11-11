/** @jsxImportSource react */
import { Button, Doption, Dropdown, Space } from '@sdata/web-react';
import { IconDown } from '@sdata/web-react/icon';

export default function Example() {
  const handleSelect = (
    v: string | number | Record<string, unknown> | undefined,
    _event: Event,
  ) => {
    console.log(v);
  };

  return (
    <>
      <Space data-v-248c8236="" size={'large'}>
        <Dropdown
          data-v-248c8236=""
          onSelect={handleSelect}
          content={
            <>
              <Doption data-v-248c8236="">{'选项 1'}</Doption>
              <Doption data-v-248c8236="" disabled={true}>
                {'选项 2'}
              </Doption>
              <Doption data-v-248c8236="" value={{ value: '选项 3' }}>
                {'选项 3'}
              </Doption>
            </>
          }
        >
          <Button data-v-248c8236="">{'点击我'}</Button>
        </Dropdown>
        <Dropdown
          data-v-248c8236=""
          onSelect={handleSelect}
          disabled={true}
          content={
            <>
              <Doption data-v-248c8236="">{'选项 1'}</Doption>
              <Doption data-v-248c8236="" disabled={true}>
                {'选项 2'}
              </Doption>
              <Doption data-v-248c8236="">{'选项 3'}</Doption>
            </>
          }
        >
          <Button data-v-248c8236="" disabled={true}>
            {'点击我'}
          </Button>
        </Dropdown>
        <Dropdown
          data-v-248c8236=""
          onSelect={handleSelect}
          popupMaxHeight={false}
          content={
            <>
              <Doption data-v-248c8236="">{'选项 1'}</Doption>
              <Doption data-v-248c8236="" disabled={true}>
                {'选项 2'}
              </Doption>
              <Doption data-v-248c8236="">{'选项 3'}</Doption>
              <Doption data-v-248c8236="">{'选项 4'}</Doption>
              <Doption data-v-248c8236="">{'选项 5'}</Doption>
              <Doption data-v-248c8236="">{'选项 6'}</Doption>
              <Doption data-v-248c8236="">{'选项 7'}</Doption>
              <Doption data-v-248c8236="">{'选项 8'}</Doption>
              <Doption data-v-248c8236="">{'选项 9'}</Doption>
            </>
          }
        >
          <Button data-v-248c8236="">
            {'不限制最大高度 '}
            <IconDown data-v-248c8236="" />
          </Button>
        </Dropdown>
      </Space>
      <style>{'\n.sd-dropdown-open .sd-icon-down {\n    transform: rotate(180deg);\n}\n'}</style>
    </>
  );
}
