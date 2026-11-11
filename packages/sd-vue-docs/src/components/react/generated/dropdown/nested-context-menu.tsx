/** @jsxImportSource react */
import { Doption, Dropdown } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Dropdown
        data-v-321e7f24=""
        trigger={'contextMenu'}
        alignPoint={true}
        position={'bl'}
        className={'sd:block'}
        content={
          <>
            <Doption data-v-321e7f24="" value={'new-file'}>
              {'新建文件'}
            </Doption>
            <Doption data-v-321e7f24="" value={'new-dir'}>
              {'新建目录'}
            </Doption>
            <Doption data-v-321e7f24="" value={'upload'}>
              {'上传'}
            </Doption>
          </>
        }
      >
        <div data-v-321e7f24="" className={'dropdown-nested-context-menu'}>
          <div data-v-321e7f24="" className={'dropdown-nested-context-menu-hint'}>
            {'右键空白区域打开外层菜单'}
          </div>
          <Dropdown
            data-v-321e7f24=""
            trigger={'contextMenu'}
            alignPoint={true}
            position={'bl'}
            content={
              <>
                <Doption data-v-321e7f24="" value={'rename'}>
                  {'重命名'}
                </Doption>
                <Doption data-v-321e7f24="" value={'delete'}>
                  {'删除'}
                </Doption>
              </>
            }
          >
            <div
              data-v-321e7f24=""
              className={'dropdown-nested-context-menu-node'}
              onContextMenu={(event) => {
                event.stopPropagation();
              }}
            >
              <span data-v-321e7f24="" className={'dropdown-nested-context-menu-icon'}>
                {'文件'}
              </span>
              {' README.md '}
            </div>
          </Dropdown>
        </div>
      </Dropdown>
      <style>
        {
          '\n.dropdown-nested-context-menu[data-v-321e7f24] {\n    height: 420px;\n    padding: 12px;\n    color: var(--color-text-2);\n    background-color: var(--color-fill-2);\n}\n.dropdown-nested-context-menu-hint[data-v-321e7f24] {\n    margin-bottom: 12px;\n    font-size: 13px;\n}\n.dropdown-nested-context-menu-node[data-v-321e7f24] {\n    display: inline-flex;\n    align-items: center;\n    min-width: 160px;\n    height: 28px;\n    padding: 0 8px;\n    color: var(--color-text-1);\n    cursor: default;\n    border-radius: 4px;\n}\n.dropdown-nested-context-menu-node[data-v-321e7f24]:hover {\n    background-color: var(--color-fill-3);\n}\n.dropdown-nested-context-menu-icon[data-v-321e7f24] {\n    margin-right: 6px;\n    font-size: 12px;\n    color: var(--color-text-3);\n}\n'
        }
      </style>
    </>
  );
}
