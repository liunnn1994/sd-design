import { Link, Space } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconEdit } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Space>
        <Link href={'#'} icon={true} iconTooltip={'查看详情'} />
        <Link
          href={'#'}
          iconTooltip={'编辑内容'}
          icon={
            <>
              <IconEdit />
            </>
          }
        />
      </Space>
    </>
  );
}
