/** @jsxImportSource react */
import { Doption, DropdownButton, Space } from '@sdata/web-react';
import { IconDown } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Space data-v-78ae2067="" size={'large'}>
        <DropdownButton
          data-v-78ae2067=""
          content={
            <>
              <Doption data-v-78ae2067="">{'立即保存'}</Doption>
              <Doption data-v-78ae2067="">{'保存并发布'}</Doption>
            </>
          }
        >
          {' 发布 '}
        </DropdownButton>
        <DropdownButton
          data-v-78ae2067=""
          disabled={true}
          content={
            <>
              <Doption data-v-78ae2067="">{'立即保存'}</Doption>
              <Doption data-v-78ae2067="">{'保存并发布'}</Doption>
            </>
          }
        >
          {' 禁用 '}
        </DropdownButton>
        <DropdownButton
          data-v-78ae2067=""
          icon={
            <>
              <IconDown data-v-78ae2067="" />
            </>
          }
          content={
            <>
              <Doption data-v-78ae2067="">{'立即保存'}</Doption>
              <Doption data-v-78ae2067="">{'保存并发布'}</Doption>
            </>
          }
        >
          {' 发布 '}
        </DropdownButton>
      </Space>
      <style>{'\n.sd-dropdown-open .sd-icon-down {\n    transform: rotate(180deg);\n}\n'}</style>
    </>
  );
}
