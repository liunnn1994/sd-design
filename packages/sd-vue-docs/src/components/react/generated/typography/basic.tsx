/** @jsxImportSource react */
import { Typography, TypographyParagraph, TypographyText, TypographyTitle } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Typography className={'sd:-mt-10'}>
        <TypographyTitle>{' 设计系统 '}</TypographyTitle>
        <TypographyParagraph>
          {
            ' 设计是为构建对象、系统或开展活动而制定的计划与规范，也可以指由此产生的原型、产品或流程。设计的过程就是将想法逐步转化为可用方案的过程。 '
          }
        </TypographyParagraph>
        <TypographyParagraph>
          {
            ' 在某些情况下，未经明确规划而直接进行创作，例如手工制作、工程实践、编程和平面设计，也可以 '
          }
          <TypographyText bold={true}>{'视为设计活动。'}</TypographyText>
        </TypographyParagraph>
        <TypographyTitle heading={2}>{'SD Design'}</TypographyTitle>
        <TypographyParagraph>
          {' SD Design 组件库提供了一组默认的样式变量，您可以 '}
          <TypographyText mark={true}>{'自定义'}</TypographyText>
          {' 和 '}
          <TypographyText underline={true}>{'覆盖'}</TypographyText>
          {' 这些变量，创建适合业务的主题。 '}
        </TypographyParagraph>
        <TypographyParagraph blockquote={true}>
          {
            ' 设计是为构建对象、系统或开展活动而制定的计划与规范，也可以指由此产生的原型、产品或流程。设计的过程就是将想法逐步转化为可用方案的过程。 '
          }
          <TypographyText code={true}>{'原型'}</TypographyText>
          {', '}
          <TypographyText code={true}>{'产品'}</TypographyText>
          {' 或 '}
          <TypographyText code={true}>{'流程'}</TypographyText>
          {'。设计这一动词描述了形成设计方案的过程。 '}
        </TypographyParagraph>
        <TypographyParagraph mark={true} underline={true} delete={true}>
          {
            '设计是为构建对象、系统或开展活动而制定的计划与规范，也可以指由此产生的原型、产品或流程。设计的过程就是将想法逐步转化为可用方案的过程。'
          }
        </TypographyParagraph>
        <TypographyParagraph>
          <ul>
            <li>
              {' 建筑蓝图 '}
              <ul>
                <li>{'建筑蓝图'}</li>
              </ul>
            </li>
            <li>{'工程图纸'}</li>
            <li>{'业务流程'}</li>
          </ul>
        </TypographyParagraph>
        <TypographyParagraph>
          <ol>
            <li>{'建筑蓝图'}</li>
            <li>{'工程图纸'}</li>
            <li>{'业务流程'}</li>
          </ol>
        </TypographyParagraph>
      </Typography>
    </>
  );
}
