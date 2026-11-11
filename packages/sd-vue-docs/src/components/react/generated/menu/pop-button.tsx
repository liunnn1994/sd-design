import { Menu, MenuItem, Trigger } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconBug, IconBulb, IconClose, IconMessage } from '@sdata/web-react/icon';
import { useState } from 'react';
function classNames(value: unknown): string {
  return Array.isArray(value)
    ? value.map(classNames).filter(Boolean).join(' ')
    : value && typeof value === 'object'
      ? Object.entries(value)
          .filter(([, active]) => active)
          .map(([name]) => name)
          .join(' ')
      : typeof value === 'string'
        ? value
        : '';
}

export default function Example() {
  const [popupVisible1, setPopupVisible1] = useState(false);
  const [popupVisible2, setPopupVisible2] = useState(false);

  return (
    <>
      <div data-v-db2b271e="" className={'menu-demo'}>
        <Trigger
          data-v-db2b271e=""
          trigger={['click', 'hover']}
          clickToClose={true}
          position={'top'}
          popupVisible={popupVisible1}
          onPopupVisibleChange={(next) => setPopupVisible1(next as typeof popupVisible1)}
          content={
            <>
              <Menu
                data-v-db2b271e=""
                className={'sd:-mb-1'}
                mode={'popButton'}
                tooltipProps={{ position: 'left' }}
                showCollapseButton={true}
              >
                <MenuItem
                  data-v-db2b271e=""
                  key={'1'}
                  icon={
                    <>
                      <IconBug data-v-db2b271e="" />
                    </>
                  }
                >
                  {' 问题 '}
                </MenuItem>
                <MenuItem
                  data-v-db2b271e=""
                  key={'2'}
                  icon={
                    <>
                      <IconBulb data-v-db2b271e="" />
                    </>
                  }
                >
                  {' 想法 '}
                </MenuItem>
              </Menu>
            </>
          }
        >
          <div
            data-v-db2b271e=""
            className={classNames(`button-trigger ${popupVisible1 ? 'button-trigger-active' : ''}`)}
          >
            {popupVisible1 ? <IconClose data-v-db2b271e="" /> : <IconMessage data-v-db2b271e="" />}
          </div>
        </Trigger>
        <Trigger
          data-v-db2b271e=""
          trigger={['click', 'hover']}
          clickToClose={true}
          position={'top'}
          popupVisible={popupVisible2}
          onPopupVisibleChange={(next) => setPopupVisible2(next as typeof popupVisible2)}
          content={
            <>
              <Menu
                data-v-db2b271e=""
                className={'sd:-mb-1'}
                mode={'popButton'}
                tooltipProps={{ position: 'left' }}
                showCollapseButton={true}
              >
                <MenuItem
                  data-v-db2b271e=""
                  key={'1'}
                  icon={
                    <>
                      <IconBug data-v-db2b271e="" />
                    </>
                  }
                >
                  {' 问题 '}
                </MenuItem>
                <MenuItem
                  data-v-db2b271e=""
                  key={'2'}
                  icon={
                    <>
                      <IconBulb data-v-db2b271e="" />
                    </>
                  }
                >
                  {' 想法 '}
                </MenuItem>
              </Menu>
            </>
          }
        >
          <div
            data-v-db2b271e=""
            className={classNames(`button-trigger ${popupVisible2 ? 'button-trigger-active' : ''}`)}
          >
            {popupVisible2 ? <IconClose data-v-db2b271e="" /> : <IconMessage data-v-db2b271e="" />}
          </div>
        </Trigger>
      </div>
      <style>
        {
          '\n.menu-demo[data-v-db2b271e] {\n    position: relative;\n    box-sizing: border-box;\n    width: 100%;\n    height: 300px;\n    padding: 40px;\n    background-color: var(--color-fill-2);\n}\n.button-trigger[data-v-db2b271e] {\n    position: absolute;\n    bottom: 80px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    width: 40px;\n    height: 40px;\n    color: var(--color-white);\n    font-size: 14px;\n    border-radius: 50%;\n    cursor: pointer;\n    transition: all 0.1s;\n}\n\n  /* button left */\n.button-trigger[data-v-db2b271e]:nth-child(1) {\n    left: 150px;\n    background-color: var(--color-neutral-5);\n}\n.button-trigger:nth-child(1).button-trigger-active[data-v-db2b271e] {\n    background-color: var(--color-neutral-4);\n}\n\n  /* button right */\n.button-trigger[data-v-db2b271e]:nth-child(2) {\n    left: 372px;\n    background-color: rgb(var(--sdblue-6));\n}\n.button-trigger:nth-child(3).button-trigger-active[data-v-db2b271e] {\n    background-color: var(--color-primary-light-4);\n}\n'
        }
      </style>
    </>
  );
}
