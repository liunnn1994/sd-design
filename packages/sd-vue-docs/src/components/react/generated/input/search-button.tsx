/** @jsxImportSource react */
import { InputSearch, Space } from '@sdata/web-react';
import { IconSearch } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <InputSearch
          className={'sd:w-80'}
          placeholder={'请输入内容'}
          buttonText={'搜索'}
          searchButton={true}
        />
        <InputSearch
          className={'sd:w-80'}
          placeholder={'请输入内容'}
          searchButton={true}
          buttonIcon={
            <>
              <IconSearch />
            </>
          }
          buttonText={<>{' 搜索 '}</>}
        />
      </Space>
    </>
  );
}
