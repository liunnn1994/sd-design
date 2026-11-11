/** @jsxImportSource react */
import { Button, Panel, PanelGroup, PanelSeparator, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [files, setFiles] = useState(140);
  const [outline, setOutline] = useState(120);
  const [terminal, setTerminal] = useState(90);
  const [filesCollapsed, setFilesCollapsed] = useState(false);
  const [outlineCollapsed, setOutlineCollapsed] = useState(false);
  const [terminalCollapsed, setTerminalCollapsed] = useState(false);

  return (
    <>
      <div>
        <Space className={'sd:mb-2'}>
          <Button
            size={'small'}
            onClick={() => {
              setFilesCollapsed(!filesCollapsed);
            }}
          >
            {'切换文件面板'}
          </Button>
          <Button
            size={'small'}
            onClick={() => {
              setOutlineCollapsed(!outlineCollapsed);
            }}
          >
            {'切换大纲面板'}
          </Button>
          <Button
            size={'small'}
            onClick={() => {
              setTerminalCollapsed(!terminalCollapsed);
            }}
          >
            {'切换终端面板'}
          </Button>
        </Space>
        <div className={'sd:h-90 sd:border sd:border-solid sd:rounded'}>
          <PanelGroup>
            <Panel
              size={files}
              onSizeChange={(next) => setFiles(next as typeof files)}
              collapsed={filesCollapsed}
              onCollapsedChange={(next) => setFilesCollapsed(next as typeof filesCollapsed)}
              minSize={'12%'}
              maxSize={'30%'}
              className={'sd:p-2'}
            >
              {' 文件列表 '}
            </Panel>
            <PanelSeparator />
            <Panel>
              <PanelGroup orientation={'vertical'}>
                <Panel>
                  <PanelGroup>
                    <Panel className={'sd:p-2'}>{'编辑器区域'}</Panel>
                    <PanelSeparator />
                    <Panel
                      size={outline}
                      onSizeChange={(next) => setOutline(next as typeof outline)}
                      collapsed={outlineCollapsed}
                      onCollapsedChange={(next) =>
                        setOutlineCollapsed(next as typeof outlineCollapsed)
                      }
                      minSize={'12%'}
                      maxSize={'30%'}
                      className={'sd:p-2'}
                    >
                      {' 大纲 '}
                    </Panel>
                  </PanelGroup>
                </Panel>
                <PanelSeparator />
                <Panel
                  size={terminal}
                  onSizeChange={(next) => setTerminal(next as typeof terminal)}
                  collapsed={terminalCollapsed}
                  onCollapsedChange={(next) =>
                    setTerminalCollapsed(next as typeof terminalCollapsed)
                  }
                  minSize={60}
                  maxSize={160}
                  transition={{ type: 'spring', duration: 700, bounce: 0.4 }}
                  className={'sd:p-2'}
                >
                  {' 终端输出 '}
                </Panel>
              </PanelGroup>
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </>
  );
}
