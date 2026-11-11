/** @jsxImportSource react */
import { Typography, TypographyParagraph, TypographyTitle } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Typography>
        <TypographyTitle heading={5}>{'默认'}</TypographyTitle>
        <TypographyParagraph>
          {
            ' 设计是为构建对象、系统或开展活动而制定的计划与规范，也可以指由此产生的原型、产品或流程。设计需要满足目标与约束，综合考虑美观、功能和成本，并与使用环境相适应。建筑蓝图、工程图纸和业务流程都是常见的设计成果。 '
          }
        </TypographyParagraph>
        <TypographyTitle heading={5}>{'次要'}</TypographyTitle>
        <TypographyParagraph type={'secondary'}>
          {
            ' 设计是为构建对象、系统或开展活动而制定的计划与规范，也可以指由此产生的原型、产品或流程。设计需要满足目标与约束，综合考虑美观、功能和成本，并与使用环境相适应。建筑蓝图、工程图纸和业务流程都是常见的设计成果。 '
          }
        </TypographyParagraph>
        <TypographyTitle heading={5}>{'默认间距'}</TypographyTitle>
        <TypographyParagraph>
          {
            ' 设计是为构建对象、系统或开展活动而制定的计划与规范，也可以指由此产生的原型、产品或流程。设计需要满足目标与约束，综合考虑美观、功能和成本，并与使用环境相适应。建筑蓝图、工程图纸和业务流程都是常见的设计成果。 '
          }
        </TypographyParagraph>
        <TypographyTitle heading={5}>{'紧凑间距'}</TypographyTitle>
        <TypographyParagraph type={'secondary'} spacing={'close'}>
          {
            ' 设计是为构建对象、系统或开展活动而制定的计划与规范，也可以指由此产生的原型、产品或流程。设计的过程就是将想法逐步转化为可用方案的过程。 '
          }
        </TypographyParagraph>
      </Typography>
    </>
  );
}
