/** @jsxImportSource react */
import { Message } from '@sdata/web-react';
import { Space, Switch } from '@sdata/web-react';

export default function Example() {
  const handleChangeIntercept = async (newValue: string | number | boolean) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return true;
  };
  const handleChangeIntercept2 = async (newValue: string | number | boolean) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!newValue) {
      Message.error("OH, You can't change");
      return false;
    }
    return true;
  };
  const handleChangeIntercept3 = async (newValue: string | number | boolean) => {
    await new Promise((_, reject) =>
      setTimeout(() => {
        Message.error('操作失败，请重试');
        reject();
      }, 1000),
    );
    return true;
  };

  return (
    <>
      <Space size={'large'}>
        <Switch beforeChange={handleChangeIntercept} />
        <Switch type={'round'} beforeChange={handleChangeIntercept2} />
        <Switch type={'line'} beforeChange={handleChangeIntercept3} />
      </Space>
    </>
  );
}
