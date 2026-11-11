/** @jsxImportSource react */
import { Typography, TypographyTitle } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Typography>
        <TypographyTitle>{' H1. 务实的浪漫主义 '}</TypographyTitle>
        <TypographyTitle heading={2}>{' H2. 务实的浪漫主义 '}</TypographyTitle>
        <TypographyTitle heading={3}>{' H3. 务实的浪漫主义 '}</TypographyTitle>
        <TypographyTitle heading={4}>{' H4. 务实的浪漫主义 '}</TypographyTitle>
        <TypographyTitle heading={5}>{' H5. 务实的浪漫主义 '}</TypographyTitle>
        <TypographyTitle heading={6}>{' H6. 务实的浪漫主义 '}</TypographyTitle>
      </Typography>
    </>
  );
}
