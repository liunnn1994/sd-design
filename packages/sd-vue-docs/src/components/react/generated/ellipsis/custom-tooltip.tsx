/** @jsxImportSource react */
import { Ellipsis } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Ellipsis
        tooltip={{ position: 'bottom', mini: true }}
        style={{ display: 'block', width: 'min(100%, 14rem)' }}
        tooltipContent={
          <>
            <div>
              <strong>{'完整内容'}</strong>
              <div className={'sd:mt-1'}>
                {' 将鼠标悬停在截断的内容上，即可显示通过提示插槽渲染的自定义内容。 '}
              </div>
            </div>
          </>
        }
      >
        {' 将鼠标悬停在截断的内容上，即可显示通过提示插槽渲染的自定义内容。 '}
      </Ellipsis>
    </>
  );
}
