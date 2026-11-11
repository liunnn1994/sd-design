/** @jsxImportSource react */
import { Grid, GridItem, Switch, TypographyText } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <div data-v-4fb15789="" className={'sd:mb-5'}>
        <TypographyText data-v-4fb15789="">{'折叠：'}</TypographyText>
        <Switch
          data-v-4fb15789=""
          value={collapsed}
          onClick={() => {
            setCollapsed(!collapsed);
          }}
        />
      </div>
      <Grid
        data-v-4fb15789=""
        cols={3}
        colGap={12}
        rowGap={16}
        className={'grid-demo-grid sd:text-white'}
        collapsed={collapsed}
      >
        <GridItem data-v-4fb15789="" className={'demo-item sd:bg-[#4096ff]'}>
          {'项目'}
        </GridItem>
        <GridItem data-v-4fb15789="" className={'demo-item sd:bg-[#0958d9]'}>
          {'项目'}
        </GridItem>
        <GridItem data-v-4fb15789="" className={'demo-item sd:bg-[#4096ff]'}>
          {'项目'}
        </GridItem>
        <GridItem data-v-4fb15789="" className={'demo-item sd:bg-[#0958d9]'} offset={1}>
          {'item | offset - 1'}
        </GridItem>
        <GridItem data-v-4fb15789="" className={'demo-item sd:bg-[#4096ff]'}>
          {'项目'}
        </GridItem>
        <GridItem data-v-4fb15789="" className={'demo-item sd:bg-[#0958d9]'} span={3}>
          {'item | span - 3'}
        </GridItem>
        <GridItem data-v-4fb15789="" className={'demo-item sd:bg-[#4096ff]'}>
          {'项目'}
        </GridItem>
        <GridItem data-v-4fb15789="" className={'demo-item sd:bg-[#0958d9]'}>
          {'项目'}
        </GridItem>
        <GridItem
          data-v-4fb15789=""
          className={'demo-item sd:bg-[#4096ff]'}
          suffix={true}
          children={({ overflow }) => (
            <>
              {' suffix | overflow: '}
              {formatValue(overflow)}
            </>
          )}
        />
      </Grid>
      <style>
        {
          '\n.grid-demo-grid .demo-item[data-v-4fb15789],\n  .grid-demo-grid .demo-suffix[data-v-4fb15789] {\n    height: 48px;\n    line-height: 48px;\n    text-align: center;\n}\n'
        }
      </style>
    </>
  );
}
