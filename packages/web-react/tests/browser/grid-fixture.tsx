import { useState } from 'react';

import { Button } from '../../src/button/index.js';
import { Grid, GridItem, Row, Col } from '../../src/grid/index.js';

export function GridFixture() {
  const [div, setDiv] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [items, setItems] = useState(['A', 'B', 'C']);
  const [mounted, setMounted] = useState(true);
  return (
    <section>
      <Button onClick={() => setDiv(!div)}>切换栅格 div</Button>
      <Button onClick={() => setCollapsed(!collapsed)}>切换网格折叠</Button>
      <Button onClick={() => setItems(['A', 'C'])}>删除网格 B</Button>
      <Button onClick={() => setItems(['D', 'C', 'A'])}>重排网格</Button>
      <Button onClick={() => setMounted(!mounted)}>挂载网格</Button>
      <Row
        data-testid="row"
        gutter={[{ xs: 0, md: 16 }, 8]}
        div={div}
        wrap={false}
        justify="center"
        align="stretch"
      >
        <Col data-testid="col-zero" xs={0} md={{ span: 12, offset: 0, order: 0 }}>
          响应式列
        </Col>
        <Col data-testid="col-flex" flex={0}>
          零 flex
        </Col>
        <Col data-testid="col-fixed" flex="100px">
          固定宽
        </Col>
      </Row>
      <Row style={{ width: 480 }}>
        <Col
          data-testid="col-responsive-offset"
          xs={{ span: 6, offset: 6, order: 2 }}
          md={{ span: 6, offset: 0, order: 0 }}
        >
          响应式偏移
        </Col>
      </Row>
      {mounted && (
        <Grid
          data-testid="grid-collection"
          cols={3}
          collapsed={collapsed}
          colGap={8}
          style={{ width: 300 }}
        >
          {items.map((label) => (
            <GridItem key={label} data-testid={`grid-${label}`} style={{ height: 20 }}>
              {label}
            </GridItem>
          ))}
          <GridItem suffix data-testid="grid-suffix" style={{ height: 20 }}>
            {({ overflow }) => String(overflow)}
          </GridItem>
        </Grid>
      )}
      <Grid
        data-testid="grid-geometry"
        cols={3}
        collapsed={collapsed}
        collapsedRows={2}
        rowGap={10}
        style={{ width: 300 }}
      >
        {[0, 1, 2].map((index) => (
          <GridItem key={index} span={2} data-testid={`geometry-${index}`} style={{ height: 20 }}>
            {index}
          </GridItem>
        ))}
      </Grid>
      <Grid
        data-testid="grid-responsive"
        cols={{ xs: 2, md: 4 }}
        colGap={{ xs: 0, md: 8 }}
        rowGap={6}
        style={{ width: 320 }}
      >
        <GridItem data-testid="grid-offset" span={1} offset={1} style={{ height: 20 }}>
          偏移
        </GridItem>
        <GridItem data-testid="grid-span" span={{ xs: 0, md: 1 }} style={{ height: 20 }}>
          响应式项
        </GridItem>
      </Grid>
    </section>
  );
}
