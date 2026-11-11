/** @jsxImportSource react */
import { Checkbox, CheckboxGroup, Grid, GridItem } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [checkedValue, setCheckedValue] = useState(['1', '2']);

  return (
    <>
      <CheckboxGroup
        value={checkedValue}
        onValueChange={(next) => setCheckedValue(next as typeof checkedValue)}
      >
        <Grid cols={3} colGap={24} rowGap={16}>
          <GridItem>
            <Checkbox value={'1'}>{'选项 1'}</Checkbox>
          </GridItem>
          <GridItem>
            <Checkbox value={'2'} disabled={true}>
              {'选项 2'}
            </Checkbox>
          </GridItem>
          <GridItem>
            <Checkbox value={'3'}>{'选项 3'}</Checkbox>
          </GridItem>
          <GridItem>
            <Checkbox value={'4'}>{'选项 4'}</Checkbox>
          </GridItem>
          <GridItem>
            <Checkbox value={'5'}>{'选项 5'}</Checkbox>
          </GridItem>
        </Grid>
      </CheckboxGroup>
    </>
  );
}
