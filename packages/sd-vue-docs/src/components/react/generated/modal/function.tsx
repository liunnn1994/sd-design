import { Modal, Button } from '@sdata/web-react';

function ModalContent() {
  return (
    <div className="info-modal-content">
      <span style={{ marginBottom: 10 }}>这是一条提示消息</span>
      <Button
        size="mini"
        onClick={() => Modal.info({ title: '提示标题', content: '这是一条嵌套提示消息' })}
      >
        打开嵌套对话框
      </Button>
      <style>{`.info-modal-content { display: flex; flex-direction: column; align-items: center; justify-content: center; }`}</style>
    </div>
  );
}

export default function Example() {
  return (
    <Button onClick={() => Modal.info({ title: '提示标题', content: () => <ModalContent /> })}>
      打开对话框
    </Button>
  );
}
