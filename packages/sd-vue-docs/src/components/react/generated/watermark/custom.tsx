/** @jsxImportSource react */
import {
  Col,
  Form,
  FormItem,
  InputGroup,
  InputNumber,
  Row,
  Slider,
  Switch,
  Typography,
  TypographyParagraph,
  TypographyTitle,
  Watermark,
} from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [form, setForm] = useState({
    rotate: 0,
    gap: [50, 50] as [number, number],
    offset: [25, 25] as [number, number],
    font: { fontSize: 16 },
    zIndex: 6,
    repeat: true,
    staggered: true,
  });

  return (
    <>
      <div className={'sd:grid sd:gap-4'}>
        <Form size={'small'} model={form} autoLabelWidth={true}>
          <Row gutter={16}>
            <Col span={24}>
              <FormItem field={'rotate'} label={'rotate'}>
                <Slider
                  value={form.rotate}
                  onValueChange={(next) =>
                    setForm((previous) => {
                      const draft = structuredClone(previous);
                      draft.rotate = next as (typeof form)['rotate'];
                      return draft;
                    })
                  }
                  min={-180}
                  max={180}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label={'gap'}>
                <InputGroup>
                  <InputNumber
                    value={form.gap[0]}
                    onValueChange={(next) =>
                      setForm((previous) => {
                        const draft = structuredClone(previous);
                        draft.gap[0] = next as (typeof form)['gap'][number];
                        return draft;
                      })
                    }
                    placeholder={'gap[x]'}
                    min={0}
                  />
                  <InputNumber
                    value={form.gap[1]}
                    onValueChange={(next) =>
                      setForm((previous) => {
                        const draft = structuredClone(previous);
                        draft.gap[1] = next as (typeof form)['gap'][number];
                        return draft;
                      })
                    }
                    placeholder={'gap[y]'}
                    min={0}
                  />
                </InputGroup>
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label={'offset'}>
                <InputGroup>
                  <InputNumber
                    value={form.offset[0]}
                    onValueChange={(next) =>
                      setForm((previous) => {
                        const draft = structuredClone(previous);
                        draft.offset[0] = next as (typeof form)['offset'][number];
                        return draft;
                      })
                    }
                    placeholder={'offsetLeft'}
                  />
                  <InputNumber
                    value={form.offset[1]}
                    onValueChange={(next) =>
                      setForm((previous) => {
                        const draft = structuredClone(previous);
                        draft.offset[1] = next as (typeof form)['offset'][number];
                        return draft;
                      })
                    }
                    placeholder={'offsetTop'}
                  />
                </InputGroup>
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label={'fontSize'}>
                <InputNumber
                  value={form.font.fontSize}
                  onValueChange={(next) =>
                    setForm((previous) => {
                      const draft = structuredClone(previous);
                      draft.font.fontSize = next as (typeof form)['font']['fontSize'];
                      return draft;
                    })
                  }
                  mode={'button'}
                />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label={'zIndex'}>
                <InputNumber
                  value={form.zIndex}
                  onValueChange={(next) =>
                    setForm((previous) => {
                      const draft = structuredClone(previous);
                      draft.zIndex = next as (typeof form)['zIndex'];
                      return draft;
                    })
                  }
                  mode={'button'}
                />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={'repeat'}>
                <Switch
                  value={form.repeat}
                  onChange={(next) =>
                    setForm((previous) => {
                      const draft = structuredClone(previous);
                      draft.repeat = next as (typeof form)['repeat'];
                      return draft;
                    })
                  }
                />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label={'交错'}>
                <Switch
                  value={form.staggered}
                  onChange={(next) =>
                    setForm((previous) => {
                      const draft = structuredClone(previous);
                      draft.staggered = next as (typeof form)['staggered'];
                      return draft;
                    })
                  }
                />
              </FormItem>
            </Col>
          </Row>
        </Form>
        <Watermark {...form} content={'sd.design'}>
          <div className={'sd:box-border sd:w-full sd:border sd:border-[#e5e6eb]'}>
            <TypographyTitle heading={5}>{' 设计系统 '}</TypographyTitle>
            <Typography>
              <TypographyParagraph>
                {
                  ' 设计是为构建对象、系统或开展活动而制定的计划与规范，也可以指由此产生的原型、产品或流程。设计的过程就是将想法逐步转化为可用方案的过程。 '
                }
              </TypographyParagraph>
              <TypographyParagraph>
                {
                  ' 设计是为构建对象、系统或开展活动而制定的计划与规范，也可以指由此产生的原型、产品或流程。设计的过程就是将想法逐步转化为可用方案的过程。 '
                }
              </TypographyParagraph>
            </Typography>
            <img
              alt={'水印示例'}
              className={'sd:relative sd:z-[7]'}
              src={'https://picsum.photos/1200/480'}
            />
          </div>
        </Watermark>
      </div>
    </>
  );
}
