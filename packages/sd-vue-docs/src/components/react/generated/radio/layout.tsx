/** @jsxImportSource react */
import { Grid, GridItem, Radio, RadioGroup } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [checkedValue, setCheckedValue] = useState('1');

  return (
    <>
      <RadioGroup
        value={checkedValue}
        onValueChange={(next) => setCheckedValue(next as typeof checkedValue)}
      >
        <Grid cols={3} colGap={24} rowGap={16}>
          <GridItem>
            <Radio value={'1'}>{'选项 1'}</Radio>
          </GridItem>
          <GridItem>
            <Radio value={'2'} disabled={true}>
              {'选项 2'}
            </Radio>
          </GridItem>
          <GridItem>
            <Radio value={'3'}>{'选项 3'}</Radio>
          </GridItem>
          <GridItem>
            <Radio value={'4'}>{'选项 4'}</Radio>
          </GridItem>
          <GridItem>
            <Radio value={'5'}>{'选项 5'}</Radio>
          </GridItem>
        </Grid>
      </RadioGroup>
    </>
  );
}
