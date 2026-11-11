/** @jsxImportSource react */
import { Grid, GridItem } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Grid
        data-v-83870e92=""
        cols={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }}
        colGap={12}
        rowGap={16}
        className={'grid-demo-grid sd:text-white'}
      >
        <GridItem data-v-83870e92="" className={'demo-item sd:bg-[#4096ff]'}>
          {'项目'}
        </GridItem>
        <GridItem data-v-83870e92="" className={'demo-item sd:bg-[#0958d9]'}>
          {'项目'}
        </GridItem>
        <GridItem data-v-83870e92="" className={'demo-item sd:bg-[#4096ff]'}>
          {'项目'}
        </GridItem>
        <GridItem data-v-83870e92="" className={'demo-item sd:bg-[#0958d9]'}>
          {'项目'}
        </GridItem>
        <GridItem data-v-83870e92="" className={'demo-item sd:bg-[#4096ff]'}>
          {'项目'}
        </GridItem>
        <GridItem data-v-83870e92="" className={'demo-item sd:bg-[#0958d9]'}>
          {'项目'}
        </GridItem>
        <GridItem
          data-v-83870e92=""
          className={'demo-item sd:bg-[#4096ff]'}
          span={{ xl: 4, xxl: 6 }}
          suffix={true}
        >
          {' 后缀 '}
        </GridItem>
      </Grid>
      <style>
        {
          '\n.grid-demo-grid .demo-item[data-v-83870e92],\n  .grid-demo-grid .demo-suffix[data-v-83870e92] {\n    height: 48px;\n    line-height: 48px;\n    text-align: center;\n}\n'
        }
      </style>
    </>
  );
}
