import { useRef, useState } from 'react';

import {
  Button,
  ConfigProvider,
  List,
  ListItem,
  ListItemMeta,
  type ListRef,
} from '../../src/index';

export function ListFixture() {
  const [mode, setMode] = useState('plain');
  const [loading, setLoading] = useState(false);
  const [localSpin, setLocalSpin] = useState(false);
  const [gridSpan, setGridSpan] = useState(5);
  const [controlled, setControlled] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [vertical, setVertical] = useState(false);
  const [meta, setMeta] = useState(true);
  const [scrollLoading, setScrollLoading] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const list = useRef<ListRef>(null);
  const data = Array.from({ length: mode === 'virtual' ? 500 : 25 }, (_, index) => ({
    id: index,
    label: `List row ${index}`,
  }));
  const log = (value: string) => setEvents((old) => [...old, value]);
  const item = (label: string, index: number) => (
    <ListItem
      style={{ height: 44 }}
      data-index={index}
      meta={
        meta && (
          <ListItemMeta
            title={label}
            description={<span>Detail {index}</span>}
            avatar={<span>Avatar</span>}
          />
        )
      }
      actionLayout={vertical ? 'vertical' : 'horizontal'}
      actions={
        <>
          <button>Action {index}</button>
          <button>More {index}</button>
        </>
      }
      extra={<span>Extra {index}</span>}
    >
      {label}
    </ListItem>
  );
  return (
    <section data-testid="list-fixture">
      <Button onClick={() => setLoading((value) => !value)}>List loading</Button>
      <Button onClick={() => setLocalSpin((value) => !value)}>List local spin</Button>
      {['plain', 'grid', 'virtual', 'children', 'empty'].map((value) => (
        <Button key={value} onClick={() => setMode(value)}>
          List {value}
        </Button>
      ))}
      <Button onClick={() => setGridSpan((old) => (old === 5 ? 0 : 5))}>
        List responsive grid
      </Button>
      <Button onClick={() => setControlled((old) => !old)}>List controlled</Button>
      <Button
        onClick={() => {
          setCurrent(3);
          setPageSize(10);
        }}
      >
        List external page
      </Button>
      <Button onClick={() => setVertical((old) => !old)}>List actions layout</Button>
      <Button onClick={() => setMeta((old) => !old)}>List meta visibility</Button>
      <Button onClick={() => setScrollLoading((old) => !old)}>List scroll loading</Button>
      <Button
        onClick={() => {
          list.current?.scrollIntoView({ index: 400, align: 'start' });
          log(`ref:${!!list.current?.virtualListRef}`);
        }}
      >
        List scroll 400
      </Button>
      <ConfigProvider
        renderEmpty={({ component }) => <span>Empty {component}</span>}
        listSpinProps={{ tip: 'Inherited list loading', loading: true }}
      >
        <div style={{ height: mode === 'virtual' ? 180 : undefined }}>
          <List
            ref={list}
            data-testid="list-main"
            loading={loading}
            spinProps={localSpin ? { tip: 'Local list loading' } : undefined}
            data={mode === 'empty' ? [] : data}
            header="List header"
            footer="List footer"
            size="small"
            hoverable
            maxHeight={mode === 'virtual' ? 0 : 160}
            gridProps={
              mode === 'grid'
                ? gridSpan
                  ? { span: gridSpan, gutter: 8 }
                  : { xs: 24, md: 12, gutter: 8 }
                : undefined
            }
            paginationProps={
              mode === 'virtual' || mode === 'grid'
                ? undefined
                : {
                    defaultPageSize: 5,
                    current: controlled ? current : undefined,
                    pageSize: controlled ? pageSize : undefined,
                    showTotal: true,
                    showPageSize: true,
                    pageSizeOptions: [5, 10],
                    onChange: (value) => log(`pagination:${value}`),
                  }
            }
            virtualListProps={
              mode === 'virtual' || mode === 'grid'
                ? { height: 130, itemSize: 44, fixedSize: true, keyField: 'id', scrollbar: false }
                : undefined
            }
            renderItem={({ item: value, index }) => item(value.label, index)}
            scrollLoading={scrollLoading ? 'Loading more' : undefined}
            onPageChange={(value) => log(`page:${value}`)}
            onPageSizeChange={(value) => log(`size:${value}`)}
            onScroll={() => log('scroll')}
            onReachBottom={() => log('bottom')}
          >
            {mode === 'children' ? (
              <>
                {['a', 'b', 'c', 'd', 'e', 'f'].map((value, index) => (
                  <ListItem key={value}>
                    {index}:{value}
                  </ListItem>
                ))}
              </>
            ) : undefined}
          </List>
        </div>
      </ConfigProvider>
      <List
        data-testid="list-initial-virtual"
        data={Array.from({ length: 60 }, (_, index) => (
          <ListItem key={index} style={{ height: 40 }}>
            Virtual node {index}
          </ListItem>
        ))}
        virtualListProps={{ height: 120, itemSize: 40, fixedSize: true }}

        onReachBottom={() => log('virtual-bottom')}
      />
      <List
        data-testid="list-short"
        data={['short']}
        renderItem={({ item }) => <ListItem>{item}</ListItem>}
        onReachBottom={() => log('short-bottom')}
      />
      <output data-testid="list-events">{events.join('|')}</output>
    </section>
  );
}
