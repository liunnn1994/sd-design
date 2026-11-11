/** @jsxImportSource react */
import { Modal } from '@sdata/web-react';
import { Button } from '@sdata/web-react';

export default function Example() {
  const handleClick = () => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除所选的 3 个项目吗？点击删除按钮后，项目将立即删除，此操作无法撤销。',
      okButtonProps: {
        status: 'danger',
      },
    });
  };

  return (
    <>
      <Button type={'primary'} onClick={handleClick}>
        {'确认'}
      </Button>
    </>
  );
}
